/*global define*/
define([
    'fx-common/config/errors',
    'fx-common/config/events',
    'fx-common/config/config',
    'fx-common/config/config-default',
    'jquery',
    'underscore',
    'q',
    'loglevel',
    'amplify'
], function (ERR, EVT, C, DC, $, _, Q, log) {

    'use strict';

    function Bridge() {
    }

    Bridge.prototype.find = function (obj) {

        var key = $.extend({type: "find"}, obj.body),
            cached = this._getCacheItem(key),
            self = this;

        if (cached) {
             return Q.promise(function (resolve) {
                return resolve(cached);
            });
        }

        var serviceProvider = obj.SERVICE_PROVIDER || C.SERVICE_PROVIDER || DC.SERVICE_PROVIDER,
            filterService = obj.FIND_SERVICE || C.FIND_SERVICE || DC.FIND_SERVICE,
            body = obj.body;

        return Q($.ajax({
            url: serviceProvider + filterService + this._parseQueryParams(obj.params),
            type: obj.type || "POST",
            contentType: obj.dataType || "application/json",
            data: JSON.stringify(body),
            dataType: obj.dataType || 'json'
        })).then(function (data) {

            self._setCacheItem(key, data);

            return Q.promise(function (resolve, reject, notify) {
                return resolve(self._getCacheItem(key));
            });

        }, function (error) {

            return Q.promise(function (resolve, reject, notify) {
                return reject(error);
            });

        });
    };

    Bridge.prototype.getEnumeration = function (obj) {

        var key = {
                type: "enumeration",
                uid: obj.uid
            },
            cached = this._getCacheItem(key),
            self = this;

        if (cached) {
            return Q.promise(function (resolve) {
                return resolve(cached);
            });
        }

        var serviceProvider = obj.serviceProvider || C.SERVICE_PROVIDER || DC.SERVICE_PROVIDER,
            enumerationService = obj.enumerationService || C.ENUMERATION_SERVICE || DC.ENUMERATION_SERVICE;

        return Q($.ajax({
            url: serviceProvider + enumerationService + obj.uid,
            type: obj.type || "GET",
            dataType: obj.dataType || 'json'
        })).then(function (data) {

            self._setCacheItem(key, data);

            return Q.promise(function (resolve, reject, notify) {
                return resolve(self._getCacheItem(key));
            });

        }, function (error) {

            return Q.promise(function (resolve, reject, notify) {
                return reject(error);
            });

        });
    };

    Bridge.prototype.getCodeList = function (obj) {

        var key = $.extend({type: "codelist"}, obj.body),
            cached = this._getCacheItem(key),
            self = this;

        if (cached) {
            return Q.promise(function (resolve) {
                return resolve(cached);
            });
        }

        var serviceProvider = obj.serviceProvider || C.SERVICE_PROVIDER || DC.SERVICE_PROVIDER,
            codeListService = obj.codeListService || C.CODELIST_SERVICE || DC.CODELIST_SERVICE,
            body = obj.body;

        return Q($.ajax({
            url: serviceProvider + codeListService + this._parseQueryParams(obj.params),
            type: obj.type || "POST",
            dataType: obj.dataType || 'json',
            contentType: obj.contentType || "application/json",
            data: JSON.stringify(body)
        })).then(function (data) {

            self._setCacheItem(key, data);

            return Q.promise(function (resolve, reject, notify) {
                return resolve(self._getCacheItem(key));
            });

        }, function (error) {

            return Q.promise(function (resolve, reject, notify) {
                return reject(error);
            });

        });

    };

    Bridge.prototype.getResource = function (obj) {

        var serviceProvider = obj.serviceProvider || C.SERVICE_PROVIDER || DC.SERVICE_PROVIDER,
            processesService = obj.processesService || C.PROCESSES_SERVICE || DC.PROCESSES_SERVICE;

        return Q($.ajax({
            url: serviceProvider + processesService + this._parseUidAndVersion(obj) + this._parseQueryParams(obj.params),
            type: obj.type || "POST",
            dataType: obj.dataType || 'json',
            contentType: obj.contentType || "application/json",
            data: JSON.stringify(obj.body)
        }));

    };

    Bridge.prototype.getMetadata = function (obj) {

        var serviceProvider = obj.serviceProvider || C.SERVICE_PROVIDER || DC.SERVICE_PROVIDER,
            processesService = obj.metadataService || C.METADATA_SERVICE || DC.METADATA_SERVICE;

        return Q($.ajax({
            url: serviceProvider + processesService + this._parseUidAndVersion(obj, true) + this._parseQueryParams(obj.params),
            type: obj.type || "GET",
            dataType: obj.dataType || 'json'
        }));

    };

    Bridge.prototype.all = function (promises) {

        return Q.all(promises);
    };

    Bridge.prototype._parseQueryParams = function (params) {

        if (!params) {
            return '';
        }

        var result = '?';

        _.each(params, function (value, key) {
            result += key + '=' + value + '&'
        });

        return result.substring(0, result.length - 1);

    };

    Bridge.prototype._parseUidAndVersion = function (params, appendUid) {

        var result = '',
            versionFound = false;

        if (!params.uid) {
            log.warn("Impossible to find uid")
        }

        result = result.concat(params.uid);

        if (params.version) {
            result = result.concat("/").concat(params.version);
            versionFound = true
        }

        return (appendUid === true && versionFound !== true) ? 'uid/' + result : result;

    };

    Bridge.prototype._setCacheItem = function (key, value) {

        return amplify.store.sessionStorage(this._getCacheKey(key), value);
    };

    Bridge.prototype._getCacheItem = function (key) {

        return key ? amplify.store.sessionStorage(this._getCacheKey(key)) : null;
    };

    Bridge.prototype._getCacheKey = function (obj) {

        var key = "_",
            keys = Object.keys(obj).sort();

        for (var i = 0; i < keys.length; i++) {
            key += "_" + keys[i] + ":" + obj[keys[i]];
        }

        return key;


    };

    return new Bridge();

});