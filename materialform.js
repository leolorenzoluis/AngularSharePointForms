angular.module('app.MaterialForm', ['app.SPSoap', 'app.SPRest', 'app.Utility'])
      .factory('MaterialForm', function(SPSoap, SPRest, Utility, $http, $q, $timeout) {
          var materialForm = {};

          materialForm.createForm = function(options) {
              materialForm.formId = options.formId;
              materialForm.workflowHistoryListName = options.workflowHistoryListName;
              materialForm.siteUrl = options.siteUrl;
              materialForm.listName = options.listName;
              materialForm.debug = options.debug;
              materialForm.vm = options.vm;
              materialForm.fields = {};
              materialForm.editableFields = [];
              // Order is important
              getListItemId();
              SPSoap.getList(materialForm)
                    .then(setupList);

              return SPSoap.getCurrentUser()
                      .then(setCurrentUser)
                      .then(getUsersGroups)
                      .then(bindListItem);
          }

          function getUsersGroups() {
              return SPSoap.getUsersGroups(materialForm.currentUser.login)
                    .then(setCurrentUserGroups);
          }

          function setCurrentUser(user) {
              if(materialForm.debug) {
                  console.info('Got current user');
                  console.info(user);
              }
              materialForm.currentUser = user;
          }

          function setCurrentUserGroups(groups) {
              materialForm.currentUser.groups = groups;
          }

          function getListItemId() {
              var idFromQuery = Utility.getQueryParam(materialForm.formId);
              materialForm.listItemId = Utility.getIdFromHash();
              if (!!!materialForm.listItemId && /\d/.test(idFromQuery)) {
                  // get the SP list item ID of the form in the querystring
                  materialForm.listItemId = parseInt(idFromQuery);
                  Utility.setIdHash(materialForm.listItemId);
              }
          }

          function setupList(xmlDoc) {
              try {
                  // Determine if the field is a `Choice` or `MultiChoice` field with choices.
                  var rxIsChoice = /choice/i;
                  var rxExcludeNames = /\b(FolderChildCount|ItemChildCount|MetaInfo|ContentType|Edit|Type|LinkTitleNoMenu|LinkTitle|LinkTitle2|Version|Attachments)\b/;
                  var $list = $(xmlDoc).find('List').first();
                  var listId = $list.attr('ID');
                  materialForm.listId = listId;
                  var requireCheckout = $list.attr('RequireCheckout');
                  materialForm.requireCheckout = !!requireCheckout ? requireCheckout.toLowerCase() == 'true' : false;
                  var enableAttachments = $list.attr('EnableAttachments');
                  materialForm.enableAttachments = !!enableAttachments ? enableAttachments.toLowerCase() == 'true' : false;
                  materialForm.defaultViewUrl = $list.attr('DefaultViewUrl');
                  materialForm.defaultMobileViewUrl = $list.attr('MobileDefaultViewUrl');

                  $(xmlDoc).find('Field').filter(function (i, el) {
                      return !!($(el).attr('DisplayName')) && $(el).attr('Hidden') != 'TRUE' && !rxExcludeNames.test($(el).attr('Name'));
                  }).each(setupFields);
                  // sort the field names alpha
                  // materialForm.fields.sort(function(a,b) {return (a.ngModel > b.ngModel) ? 1 : ((b.ngModel > a.ngModel) ? -1 : 0);} );
                  if (materialForm.debug) {
                      console.info(materialForm.listName + ' list ID = ' + materialForm.listId);
                      console.info('Field names are...');
                      console.info(materialForm.fieldNames);
                  }

                  var filter = "ListID eq '" + materialForm.listId + "' and PrimaryItemID eq " + materialForm.listItemId;
                  var select = "Description,DateOccurred";
                  var orderby = "DateOccurred";

                  SPRest.getListItems(materialForm.workflowHistoryListName, materialForm.siteUrl, filter, select, orderby, 25, false)
                  .then(function(result,error) {
                      materialForm.vm.workflowHistory = [];
                      angular.forEach(result, function(value, key) {
                          materialForm.vm.workflowHistory.push({Description: value.Description, DateOccurred: Utility.parseDate(value.DateOccurred).toGMTString()})
                      });
                  });
              }
              catch (e) {
                  if (materialForm.debug) {
                      throw e;
                  }
                  var error = 'Failed to initialize list settings.';
                  console.error(error + ' SPForm.getListAsync.setupList(): ', e);
              }
          }

          function setupFields(i, el) {
              if (!!!el) {
              return;
              }
              try {
                  var $el = $(el);
                  var field = {};
                  field.displayName = $el.attr('DisplayName');
                  field.spType = $el.attr('Type');
                  field.spName = $el.attr('Name');
                  field.spFormat = $el.attr('Format');
                  field.spRequired = !!($el.attr('Required')) ? $el.attr('Required').toLowerCase() == 'true' : false;
                  field.spReadOnly = !!($el.attr('ReadOnly')) ? $el.attr('ReadOnly').toLowerCase() == 'true' : false;
                  field.spDesc = $el.attr('Description');
                  field.ngModel = Utility.toCamelCase(field.displayName);
                  field.options = [];
                  $el.find('CHOICE').each(function (j, choice) {
                      var txt = $(choice).text();
                      field.options.push(txt); // new preferred array to reference in KO foreach binding contexts
                  });
                  field.formatValue = function formatValue(vm) {
                      if(this.spType === "User"){
                          if(vm[this.ngModel])
                              return vm[this.ngModel].value;
                      }
                      else if(this.spType === "Choice"){
                          if(vm[this.ngModel])
                              if(vm[this.ngModel].display)
                                 return vm[this.ngModel].display // Auto complete
                              return vm[this.ngModel]; // or other control
                      }
                      else if(this.spType === "DateTime") {
                          if(vm[this.ngModel])
                              return vm[this.ngModel].toISOString();
                      }
                      return vm[this.ngModel];
                  }
                  materialForm.fields[field.ngModel] = field;
              }
              catch (e) {
                  console.error('Failed to setup ng model object at MaterialForm.setupFieldNames: ', e);
                  if (materialForm.debug) {
                      throw e;
                  }
              }
          }

          function bindListItem() {
                  if(!materialForm.listItemId) return;

                  var url = materialForm.siteUrl+'/_vti_bin/listdata.svc/'+Utility.toCamelCase(materialForm.listName)+'({0})?$expand=CreatedBy,ModifiedBy,Attachments';
                  url = url.replace('{0}', materialForm.listItemId);
                  return $http({
                      method: 'GET',
                      url: url
                  }).then(function successCallback(response) {
                      angular.forEach(materialForm.fields, function(value, key) {
                          if(value.spType === "User")
                          {
                              var userId = response.data.d[value.ngModel+'Id'];
                              if(userId)
                              {
                                materialForm.vm[value.ngModel+'Id'] = userId;
                                  SPRest.getListItem('UserInformationList', userId)
                                      .then(function(person) {
                                          materialForm.vm[value.ngModel] = {
                                              display: person.Name,
                                              value: person.Id + ';#' + person.Name
                                          };
                                      });
                              }
                          }
                          else if(value.spType === "DateTime") {
                              materialForm.vm[value.ngModel] = Utility.parseDate(response.data.d[value.ngModel]);
                          }
                          else if(value.spType === "Choice") {
                              materialForm.vm[value.ngModel] = response.data.d[value.ngModel+'Value'];
                          }
                          else
                              materialForm.vm[value.ngModel] = response.data.d[value.ngModel];
                      });
                      materialForm.vm.CreatedByCurrentUser = response.data.d.CreatedById === materialForm.currentUser.id;
                  }
                  , function errorCallback(response) {
                      console.error(response);
                  });
              }

          materialForm.saveListItem = function saveListItem(isSubmit, fields) {
              if(isSubmit) {
                  fields.push(['RequestStatus', 'Submitted']);
              }
              SPSoap.updateListItem(materialForm.listItemId, materialForm.listName, fields, materialForm.listItemId === null , materialForm.siteUrl, submitCallback);
          }

          function submitCallback(xmlDoc, status, jqXhr) {
              var itemId;
              if (materialForm.debug) {
                  console.log('Callback from saveListItem()...');
                  console.log(status);
                  console.log(xmlDoc);
              }
              var $errorText = $(xmlDoc).find('ErrorText');
              // catch and handle returned error
              if (!!$errorText && $errorText.text() != "") {
                  console.error($errorText.text());
                  return;
              }
              $(xmlDoc).find('*').filter(function() {
                  return Utility.isZrow(this);
              }).each(function(i, el) {
                  itemId = parseInt($(el).attr('ows_ID'));
                  if (materialForm.listItemId == null ) {
                      materialForm.listItemId = itemId;
                  }
                  if (materialForm.debug) {
                      console.info('Item ID returned...');
                      console.info(itemId);
                  }
              });
          }

          return materialForm;
      });
