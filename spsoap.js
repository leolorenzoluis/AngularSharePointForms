angular.module('app.SPSoap', ['app.Utility', 'app.SPRest'])
.service('SPSoap', function(Utility, SPRest, $q, $timeout) {

    /**
         * Get the current user via SOAP.
         */
    this.getUserInformation = function(id) {
        var deferred = $q.defer();
        var user = {};
        var query = '<Query><Where><Eq><FieldRef Name="ID" /><Value Type="Counter">'+id+'</Value></Eq></Where></Query>';
        var viewFields = '<ViewFields><FieldRef Name="ID" /><FieldRef Name="Name" /><FieldRef Name="EMail" /><FieldRef Name="Department" /><FieldRef Name="JobTitle" /><FieldRef Name="UserName" /><FieldRef Name="Office" /></ViewFields>';
        this.getListItems('', 'User Information List', viewFields, query, function(xmlDoc, status, jqXhr) {
            $(xmlDoc).find('*').filter(function() {
                return Utility.isZrow(this);
            }).each(function(i, node) {
                user.id = parseInt($(node).attr('ows_ID'));
                user.title = $(node).attr('ows_Title');
                user.login = $(node).attr('ows_Name');
                user.email = $(node).attr('ows_EMail');
                user.jobtitle = $(node).attr('ows_JobTitle');
                user.department = $(node).attr('ows_Department');
                user.location = $(node).attr('ows_Office');
                user.account = user.id + ';#' + user.title;
                user.groups = [];
            });
            deferred.resolve(user);
        });
        return deferred.promise;
        /*
            // Returns
            <z:row xmlns:z="#RowsetSchema"
                ows_ID="1"
                ows_Name="<DOMAIN\login>"
                ows_EMail="<email>"
                ows_JobTitle="<job title>"
                ows_UserName="<username>"
                ows_Office="<office>"
                ows__ModerationStatus="0"
                ows__Level="1"
                ows_Title="<Fullname>"
                ows_Dapartment="<Department>"
                ows_UniqueId="1;#{2AFFA9A1-87D4-44A7-9D4F-618BCBD990D7}"
                ows_owshiddenversion="306"
                ows_FSObjType="1;#0"/>
            */
    }
    /**
         * Get the current user via SOAP.
         */
    this.getCurrentUser = function() {
        var deferred = $q.defer();
        var user = {};
        var query = '<Query><Where><Eq><FieldRef Name="ID" /><Value Type="Counter"><UserID /></Value></Eq></Where></Query>';
        var viewFields = '<ViewFields><FieldRef Name="ID" /><FieldRef Name="Name" /><FieldRef Name="EMail" /><FieldRef Name="Department" /><FieldRef Name="JobTitle" /><FieldRef Name="UserName" /><FieldRef Name="Office" /></ViewFields>';
        this.getListItems('', 'User Information List', viewFields, query, function(xmlDoc, status, jqXhr) {
            $(xmlDoc).find('*').filter(function() {
                return Utility.isZrow(this);
            }).each(function(i, node) {
                user.id = parseInt($(node).attr('ows_ID'));
                user.title = $(node).attr('ows_Title');
                user.login = $(node).attr('ows_Name');
                user.email = $(node).attr('ows_EMail');
                user.jobtitle = $(node).attr('ows_JobTitle');
                user.department = $(node).attr('ows_Department');
                user.location = $(node).attr('ows_Office');
                user.account = user.id + ';#' + user.title;
                user.groups = [];
            });
            deferred.resolve(user);
        });
        return deferred.promise;
        /*
            // Returns
            <z:row xmlns:z="#RowsetSchema"
                ows_ID="1"
                ows_Name="<DOMAIN\login>"
                ows_EMail="<email>"
                ows_JobTitle="<job title>"
                ows_UserName="<username>"
                ows_Office="<office>"
                ows__ModerationStatus="0"
                ows__Level="1"
                ows_Title="<Fullname>"
                ows_Dapartment="<Department>"
                ows_UniqueId="1;#{2AFFA9A1-87D4-44A7-9D4F-618BCBD990D7}"
                ows_owshiddenversion="306"
                ows_FSObjType="1;#0"/>
            */
    }
    /**
         * Get the a user's groups via SOAP.
         * @param {string} loginName (DOMAIN\loginName)
         */
    this.getUsersGroups = function(loginName) {
        var deferred = $q.defer();
        var packet = '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">' +
        '<soap:Body>' +
        '<GetGroupCollectionFromUser xmlns="http://schemas.microsoft.com/sharepoint/soap/directory/">' +
        '<userLoginName>' + loginName + '</userLoginName>' +
        '</GetGroupCollectionFromUser>' +
        '</soap:Body>' +
        '</soap:Envelope>';
        var $jqXhr = $.ajax({
            url: '/_vti_bin/usergroup.asmx',
            type: 'POST',
            dataType: 'xml',
            data: packet,
            contentType: 'text/xml; charset="utf-8"'
        });
        $jqXhr.done(cb);
        $jqXhr.fail(cb);
        function cb(xmlDoc, status, jqXhr) {
            var $errorText = $(xmlDoc).find('errorstring');
            // catch and handle returned error
            if (!!$errorText && $errorText.text() != "") {
                callback(null , $errorText.text());
                return;
            }
            var groups = [];
            $(xmlDoc).find("Group").each(function(i, el) {
                groups.push({
                    id: parseInt($(el).attr("ID")),
                    name: $(el).attr("Name")
                });
            });
            deferred.resolve(groups);
        }
        return deferred.promise;
    }

    /**
         * Get the a users in a group via SOAP.
         * @param {string} loginName (DOMAIN\loginName)
         */
    this.getUserInfo = function(loginName) {
        var deferred = $q.defer();
        var packet = '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">' +
        '<soap:Body>' +
        '<GetUserInfo   xmlns="http://schemas.microsoft.com/sharepoint/soap/directory/">' +
        '<userLoginName>' + loginName + '</userLoginName>' +
        '</GetUserInfo >' +
        '</soap:Body>' +
        '</soap:Envelope>';
        var $jqXhr = $.ajax({
            url: '/_vti_bin/usergroup.asmx',
            type: 'POST',
            dataType: 'xml',
            data: packet,
            contentType: 'text/xml; charset="utf-8"'
        });
        $jqXhr.done(cb);
        $jqXhr.fail(cb);
        function cb(xmlDoc, status, jqXhr) {
            var $errorText = $(xmlDoc).find('errorstring');
            // catch and handle returned error
            if (!!$errorText && $errorText.text() != "") {
                callback(null , $errorText.text());
                return;
            }
            var users = [];
            $(xmlDoc).find("User").each(function(i, el) {
                users.push({
                    id: parseInt($(el).attr("ID")),
                    name: $(el).attr("Name"),
                    email: $(el).attr('Email')
                });
            });
            deferred.resolve(users);
        }
        return deferred.promise;
    }

    /**
         * Get the a users in a group via SOAP.
         * @param {string} loginName (DOMAIN\loginName)
         */
    this.getUsersInGroup = function(groupName) {
        var deferred = $q.defer();
        var packet = '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">' +
        '<soap:Body>' +
        '<GetUserCollectionFromGroup  xmlns="http://schemas.microsoft.com/sharepoint/soap/directory/">' +
        '<groupName>' + groupName + '</groupName>' +
        '</GetUserCollectionFromGroup>' +
        '</soap:Body>' +
        '</soap:Envelope>';
        var $jqXhr = $.ajax({
            url: '/_vti_bin/usergroup.asmx',
            type: 'POST',
            dataType: 'xml',
            data: packet,
            contentType: 'text/xml; charset="utf-8"'
        });
        $jqXhr.done(cb);
        $jqXhr.fail(cb);
        function cb(xmlDoc, status, jqXhr) {
            var $errorText = $(xmlDoc).find('errorstring');
            // catch and handle returned error
            if (!!$errorText && $errorText.text() != "") {
                callback(null , $errorText.text());
                return;
            }
            var users = [];
            $(xmlDoc).find("User").each(function(i, el) {
                users.push({
                    id: parseInt($(el).attr("ID")),
                    name: $(el).attr("Name"),
                    email: $(el).attr('Email')
                });
            });
            deferred.resolve(users);
        }
        return deferred.promise;
    }

    /**
         * Get list items via SOAP.
         * @param {string} siteUrl
         * @param {string} listName
         * @param {string} viewFields (XML)
         * @param {string} query (XML)
         * @param {Function} callback
         * @param {number = 25} rowLimit
         */
    this.getListItems = function(siteUrl, listName, viewFields, query, callback, rowLimit) {
        if (rowLimit === void 0) {
            rowLimit = 25;
        }
        siteUrl = Utility.formatSubsiteUrl(siteUrl);
        if (!!!listName) {
            console.error("Parameter `listName` is null or undefined in method SPSoap.getListItems()");
        }
        var packet = '<?xml version="1.0" encoding="utf-8"?>' +
        '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">' +
        '<soap:Body>' +
        '<GetListItems xmlns="http://schemas.microsoft.com/sharepoint/soap/">' +
        '<listName>' + listName + '</listName>' +
        '<query>' + query + '</query>' +
        '<viewFields>' + viewFields + '</viewFields>' +
        '<rowLimit>' + rowLimit + '</rowLimit>' +
        '</GetListItems>' +
        '</soap:Body>' +
        '</soap:Envelope>';
        var $jqXhr = $.ajax({
            url: siteUrl + '_vti_bin/lists.asmx',
            type: 'POST',
            dataType: 'xml',
            data: packet,
            headers: {
                "SOAPAction": "http://schemas.microsoft.com/sharepoint/soap/GetListItems",
                "Content-Type": "text/xml; charset=utf-8"
            }
        });
        $jqXhr.done(function(xmlDoc, status, error) {
            callback(xmlDoc);
        });
        $jqXhr.fail(function(jqXhr, status, error) {
            callback(status + ': ' + error);
        });
    }
    /**
         * Get list definition.
         * @param {string} siteUrl
         * @param {string} listName
         */
    this.getList = function(materialForm) {
        var deferred = $q.defer();
        materialForm.siteUrl = Utility.formatSubsiteUrl(materialForm.siteUrl);
        var packet = '<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><GetList xmlns="http://schemas.microsoft.com/sharepoint/soap/"><listName>{0}</listName></GetList></soap:Body></soap:Envelope>'
        .replace('{0}', materialForm.listName);
        var $jqXhr = $.ajax({
            url: materialForm.siteUrl + '_vti_bin/lists.asmx',
            type: 'POST',
            cache: false,
            dataType: "xml",
            data: packet,
            headers: {
                "SOAPAction": "http://schemas.microsoft.com/sharepoint/soap/GetList",
                "Content-Type": "text/xml; charset=utf-8"
            }
        });
        $jqXhr.done(function(xmlDoc, status, jqXhr) {
            deferred.resolve(xmlDoc);
        });
        $jqXhr.fail(function(jqXhr, status, error) {
            deferred.resolve(status + ': ' + error);
        });
        return deferred.promise;
    }
    /**
         * Check in file.
         * @param {string} pageUrl
         * @param {string} checkinType
         * @param {Function} callback
         * @param {string = ''} comment
         * @returns
         */
    this.checkInFile = function(pageUrl, checkinType, callback, comment) {
        if (comment === void 0) {
            comment = '';
        }
        var action = 'http://schemas.microsoft.com/sharepoint/soap/CheckInFile';
        var params = [pageUrl, comment, checkinType];
        var packet = '<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><CheckInFile xmlns="http://schemas.microsoft.com/sharepoint/soap/"><pageUrl>{0}</pageUrl><comment>{1}</comment><CheckinType>{2}</CheckinType></CheckInFile></soap:Body></soap:Envelope>';
        return this.executeSoapRequest(action, packet, params, null , callback);
    }
    /**
         * Check out file.
         * @param {string} pageUrl
         * @param {string} checkoutToLocal
         * @param {string} lastmodified
         * @param {Function} callback
         * @returns
         */
    this.checkOutFile = function(pageUrl, checkoutToLocal, lastmodified, callback) {
        var action = 'http://schemas.microsoft.com/sharepoint/soap/CheckOutFile';
        var params = [pageUrl, checkoutToLocal, lastmodified];
        var packet = '<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><CheckOutFile xmlns="http://schemas.microsoft.com/sharepoint/soap/"><pageUrl>{0}</pageUrl><checkoutToLocal>{1}</checkoutToLocal><lastmodified>{2}</lastmodified></CheckOutFile></soap:Body></soap:Envelope>';
        return this.executeSoapRequest(action, packet, params, null , callback);
    }
    /**
         * Execute SOAP Request
         * @param {string} action
         * @param {string} packet
         * @param {Array<any>} params
         * @param {string = '/'} siteUrl
         * @param {Function = undefined} callback
         * @param {string = 'lists.asmx'} service
         */
    this.executeSoapRequest = function(action, packet, params, siteUrl, callback, service) {
        if (siteUrl === void 0) {
            siteUrl = '/';
        }
        if (callback === void 0) {
            callback = undefined;
        }
        if (service === void 0) {
            service = 'lists.asmx';
        }
        siteUrl = Utility.formatSubsiteUrl(siteUrl);
        try {
            var serviceUrl = siteUrl + '_vti_bin/' + service;
            if (params != null ) {
                for (var i = 0; i < params.length; i++) {
                    packet = packet.replace('{' + i + '}', (params[i] == null  ? '' : params[i]));
                }
            }
            var $jqXhr = $.ajax({
                url: serviceUrl,
                cache: false,
                type: 'POST',
                data: packet,
                headers: {
                    'Content-Type': 'text/xml; charset=utf-8',
                    'SOAPAction': action
                }
            });
            if (callback) {
                $jqXhr.done(callback);
            }
            $jqXhr.fail(function(jqXhr, status, error) {
                var msg = 'Error in SPSoap.executeSoapRequest. ' + status + ': ' + error + ' ';
                console.error(msg);
                // if (callback) {
                //     callback(jqXhr, status, error);
                // }
            });
        }
        catch (e) {
            console.error('Error in SPSoap.executeSoapRequest.', JSON.stringify(e));
            console.warn(e);
        }
    }
    /**
         * Search for user accounts.
         * @param {string} term
         * @param {Function} callback
         * @param {number = 10} maxResults
         * @param {string = 'User'} principalType
         */
    this.searchPrincipals = function(term, callback, maxResults, principalType) {
        if (maxResults === void 0) {
            maxResults = 10;
        }
        if (principalType === void 0) {
            principalType = 'User';
        }
        var action = 'http://schemas.microsoft.com/sharepoint/soap/SearchPrincipals';
        var params = [term, maxResults, principalType];
        var packet = '<?xml version="1.0" encoding="utf-8"?>' +
        '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">' +
        '<soap:Body>' +
        '<SearchPrincipals xmlns="http://schemas.microsoft.com/sharepoint/soap/">' +
        '<searchText>{0}</searchText>' +
        '<maxResults>{1}</maxResults>' +
        '<principalType>{2}</principalType>' +
        '</SearchPrincipals>' +
        '</soap:Body>' +
        '</soap:Envelope>';
        this.executeSoapRequest(action, packet, params, '/', cb, 'People.asmx');
        function cb(xmlDoc, status, jqXhr) {
            var results = [];
            $(xmlDoc).find('PrincipalInfo').each(function(i, n) {
                var accountName = $('AccountName', n).text();
                //Only get claims people
                if (!String.prototype.startsWith) {
                    String.prototype.startsWith = function(searchString, position) {
                        position = position || 0;
                        return this.substr(position, searchString.length) === searchString;
                    }
                    ;
                }
                if (accountName.startsWith("i:0#")) {
                    results.push({
                        AccountName: $('AccountName', n).text(),
                        UserInfoID: parseInt($('UserInfoID', n).text()),
                        DisplayName: $('DisplayName', n).text(),
                        Email: $('Email', n).text(),
                        Title: $('Title', n).text(),
                        IsResolved: $('IsResolved', n).text() == 'true' ? !0 : !1,
                        PrincipalType: $('PrincipalType', n).text()
                    });
                }
            });
            callback(results);
        }
    }

    /**
         * Add Attachment
         * @param base64Data
         * @param fileName
         * @param listName
         * @param listItemId
         * @param siteUrl
         * @param callback
         */
    this.addAttachment = function(base64Data, fileName, listName, listItemId, siteUrl, callback) {
        // remove browser data file header, get base64 string after the comma... 'data:application/pdf;base64,<base64string>'
        var strData = base64Data.indexOf(',') > -1 ? base64Data.split(',')[1] : base64Data;
        var action = 'http://schemas.microsoft.com/sharepoint/soap/AddAttachment';
        var packet = '<?xml version="1.0" encoding="utf-8"?>' +
        '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">' +
        '<soap:Body>' +
        '<AddAttachment xmlns="http://schemas.microsoft.com/sharepoint/soap/">' +
        '<listName>{0}</listName>' +
        '<listItemID>{1}</listItemID>' +
        '<fileName>{2}</fileName>' +
        '<attachment>{3}</attachment>' +
        '</AddAttachment>' +
        '</soap:Body>' +
        '</soap:Envelope>';
        this.executeSoapRequest(action, packet, [listName, listItemId, fileName, strData], siteUrl, callback, 'lists.asmx');
    }


    this.updateListItem = function(itemId, listName, fields, isNew, siteUrl, callback) {
        if (isNew === void 0) {
            isNew = true;
        }
        if (siteUrl === void 0) {
            siteUrl = '/';
        }
        if (callback === void 0) {
            callback = undefined;
        }
        var action = 'http://schemas.microsoft.com/sharepoint/soap/UpdateListItems';
        var packet = '<?xml version="1.0" encoding="utf-8"?>' +
        '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">' +
        '<soap:Body>' +
        '<UpdateListItems xmlns="http://schemas.microsoft.com/sharepoint/soap/">' +
        '<listName>{0}</listName>' +
        '<updates>{1}</updates>' +
        '</UpdateListItems>' +
        '</soap:Body>' +
        '</soap:Envelope>';
        var command = isNew ? "New" : "Update";
        var params = [listName];
        var soapEnvelope = "<Batch OnError='Continue'><Method ID='1' Cmd='" + command + "'>";
        var itemArray = fields;
        for (var i = 0; i < fields.length; i++) {
            if(fields[i][1])
                soapEnvelope += "<Field Name='" + fields[i][0] + "'>" + Utility.escapeColumnValue(fields[i][1]) + "</Field>";
        }
        if (command !== "New") {
            soapEnvelope += "<Field Name='ID'>" + itemId + "</Field>";
        }
        soapEnvelope += "</Method></Batch>";
        params.push(soapEnvelope);
        this.executeSoapRequest(action, packet, params, siteUrl, callback);
    }
});
