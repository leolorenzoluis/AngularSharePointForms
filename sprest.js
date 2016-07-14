angular.module('app.SPRest', ['app.Utility'])
.service('SPRest', function($q, $timeout, Utility) {
this.peopleSearch = function(term, callback, take) {
   if (take === void 0) {
       take = 10;
   }
   var filter = "startswith(Name,'{0}')".replace(/\{0\}/g, term);
   var select = null ;
   var orderby = "Name";
   var top = 10;
   var cache = true;
   this.getListItems('UserInformationList', fn, '/', filter, select, orderby, top, cache);
   function fn(data, error) {
       if (!!error) {
           callback(null , error);
           return;
       }
       callback(data, error);
   }
   ;
}
/**
    * Get a person by their ID from the User Information list.
    * @param {number} id
    * @param {Function} callback
    */
this.getPersonById = function(id, callback) {
   this.getListItem('UserInformationList', id, function(data, error) {
       if (!!error) {
           callback(null , error);
       }
       callback(data);
   }, '/', true);
}
/**
    * General REST request method.
    * @param {string} url
    * @param {JQueryPromiseCallback<any>} callback
    * @param {boolean = false} cache
    * @param {string = 'GET'} type
    */
this.executeRestRequest = function(url, callback, cache, type) {
   if (cache === void 0) {
       cache = false;
   }
   if (type === void 0) {
       type = 'GET';
   }
   var $jqXhr = $.ajax({
       url: url,
       type: type,
       cache: cache,
       dataType: 'json',
       contentType: 'application/json; charset=utf-8',
       headers: {
           'Accept': 'application/json;odata=verbose'
       }
   });
   $jqXhr.done(function(data, status, jqXhr) {
       callback(data);
   });
   $jqXhr.fail(function(jqXhr, status, error) {
       if (!!status && status == '404') {
           var msg = status + ". The data may have been deleted by another user.";
       }
       else {
           msg = status + ' ' + error;
       }
       callback(null , msg);
   });
}
/**
    * Get list item via REST services.
    * @param {string} listName
    * @param {number} itemId
    * @param {Function} callback
    * @param {string = '/'} siteUrl
    * @param {boolean = false} cache
    * @param {string = null} expand
    */
this.getListItem = function(listName, itemId, callback, siteUrl, cache, expand) {
   var deferred = $q.defer();
   if (siteUrl === void 0) {
       siteUrl = '/';
   }
   if (cache === void 0) {
       cache = false;
   }
   if (expand === void 0) {
       expand = null ;
   }
   siteUrl = Utility.formatSubsiteUrl(siteUrl);
   var url = siteUrl + '_vti_bin/listdata.svc/' + Utility.toCamelCase(listName) + '(' + itemId + ')?$expand=CreatedBy,ModifiedBy' + (!!expand ? ',' + expand : '');
   this.executeRestRequest(url, fn, cache, 'GET');
   function fn(data, error) {
       if (!!error) {
           deferred.resolve(data, error);
           return;
       }
       if (!!data) {
           if (data.d) {
               deferred.resolve(data.d);
           }
           else {
               deferred.resolve(data);
           }
       }
   }
   return deferred.promise;
}
/**
    * Get list item via REST services.
    * @param {string} listName
    * @param {Function} callback
    * @param {string = '/'} siteUrl
    * @param {string = null} filter
    * @param {string = null} select
    * @param {string = null} orderby
    * @param {number = 10} top
    * @param {boolean = false} cache
    */
this.getListItems = function(listName, siteUrl, filter, select, orderby, top, cache) {
   var deferred = $q.defer();
   if (siteUrl === void 0) {
       siteUrl = '/';
   }
   if (filter === void 0) {
       filter = null ;
   }
   if (select === void 0) {
       select = null ;
   }
   if (orderby === void 0) {
       orderby = null ;
   }
   if (top === void 0) {
       top = 10;
   }
   if (cache === void 0) {
       cache = false;
   }
   siteUrl = Utility.formatSubsiteUrl(siteUrl);
   var url = [siteUrl + '_vti_bin/listdata.svc/' + Utility.toCamelCase(listName)];
   if (!!filter) {
       url.push('$filter=' + filter);
   }
   if (!!select) {
       url.push('$select=' + select);
   }
   if (!!orderby) {
       url.push('$orderby=' + orderby);
   }
   url.push('$top=' + top);
   this.executeRestRequest(url.join('&').replace(/\&/, '\?'), fn, cache, 'GET');
   function fn(data, error) {
       var data = !!data && 'd' in data ? data.d : data;
       var results = null ;
       if (!!data) {
           results = 'results' in data ? data.results : data;
           deferred.resolve(results);
       }
       deferred.resolve(results, error);
   }
   return deferred.promise;
}
/**
    * Insert a list item with REST service.
    * @param {string} url
    * @param {Function} callback
    * @param {any = undefined} data
    */
this.insertListItem = function(url, callback, data) {
   if (data === void 0) {
       data = undefined;
   }
   var $jqXhr = $.ajax({
       url: url,
       type: 'POST',
       processData: false,
       contentType: 'application/json',
       data: !!data ? JSON.stringify(data) : null ,
       headers: {
           'Accept': 'application/json;odata=verbose'
       }
   });
   $jqXhr.done(function(data, status, jqXhr) {
       callback(data);
   });
   $jqXhr.fail(function(jqXhr, status, error) {
       callback(null , status + ': ' + error);
   });
}
/**
    * Update a list item with REST service.
    * @param {ISpItem} item
    * @param {Function} callback
    * @param {any = undefined} data
    */
this.updateListItem = function(item, callback, data) {
   if (data === void 0) {
       data = undefined;
   }
   var $jqXhr = $.ajax({
       url: item.__metadata.uri,
       type: 'POST',
       processData: false,
       contentType: 'application/json',
       data: data ? JSON.stringify(data) : null ,
       beforeSend: function(xhr) {
           xhr.setRequestHeader('X-HTTP-Method', 'MERGE');
           xhr.setRequestHeader('If-Match', item.__metadata.etag);
       }
   });
   $jqXhr.done(function(data, status, jqXhr) {
       callback(data);
   });
   $jqXhr.fail(function(jqXhr, status, error) {
       callback(null , status + ': ' + error);
   });
}
/**
    * Delete the list item with REST service.
    * @param {ISpItem} item
    * @param {JQueryPromiseCallback<any>} callback
    */
this.deleteListItem = function(item, callback) {
   var $jqXhr = $.ajax({
       url: item.__metadata.uri,
       type: 'POST',
       headers: {
           'Accept': 'application/json;odata=verbose',
           'X-Http-Method': 'DELETE',
           'If-Match': item.__metadata.etag
       }
   });
   $jqXhr.done(function(data, status, jqXhr) {
       callback(data);
   });
   $jqXhr.fail(function(jqXhr, status, error) {
       callback(null , error);
   });
}
/**
    * Delete an attachment with REST service.
    * @param {ISpAttachment} att
    * @param {Function} callback
    */
this.deleteAttachment = function(att, callback) {
   var $jqXhr = $.ajax({
       url: att.__metadata.uri,
       type: 'POST',
       dataType: 'json',
       contentType: "application/json",
       headers: {
           'Accept': 'application/json;odata=verbose',
           'X-HTTP-Method': 'DELETE'
       }
   });
   $jqXhr.done(function(data, status, jqXhr) {
       callback(data);
   });
   $jqXhr.fail(function(jqXhr, status, error) {
       callback(null , status + ': ' + error);
   });
}
});
