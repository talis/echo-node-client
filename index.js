'use strict';

var request = require('request');
var _ = require('lodash');

// log severities
var DEBUG = 'debug';
var ERROR = 'error';

/**
 * Create an Echo client
 *
 * @param {object} config Echo Client config
 * @param {string} config.echo_host Echo host
 * @param {string} config.echo_port Echo port
 * @constructor
 */
var EchoClient = function(config){
    this.config = config || {};

    var requiredParams = ['echo_endpoint'];

    for(var i in requiredParams){
        if (this.config[requiredParams[i]] === undefined) {
            throw new Error("Missing Echo config: "+requiredParams[i]);
        }
    }
};

/**
 * Add an event or events
 * @param {string} token
 * @param {object} data Event data
 * @param {string} data.class Classify the event
 * @param {string} data.source Event source (usually the app it originates from
 * @param {string} data.timestamp Event timestamp
 * @param {string} data.user User performing the event
 * @param {object} data.props Other properties associated with the event
 * @callback callback
 */
 EchoClient.prototype.addEvents = function(token, data, callback){
     if(!token){
         throw new Error('Missing Persona token');
     }

     if(!data){
         throw new Error('Missing data');
     }

     // multiple events can be written by posting an array
     // if not an array, check data looks ok
     if (!(data instanceof Array)) {
         if(!data.class){
             throw new Error('Missing field data.class');
         }
         if(!data.source){
             throw new Error('Missing field data.source');
         }
     }

     var requestOptions = {
         url: this.config.echo_endpoint + '/1/events',
         headers: {
             'Accept': 'application/json',
             'Authorization': 'Bearer ' + token
         },
         body: data,
         method: 'POST',
         json: true
     };

     this.debug(JSON.stringify(requestOptions));

     request.post(requestOptions, function(err, response, body){
         if(err){
             this.error('[echoClient] addEvents error: ' + JSON.stringify(err));
             callback(err);
         } else{
             callback(null, body);
         }
     });
 };

/**
 * Query analytics using a passed operator and parameters
 * @param  {string}   token             Persona token
 * @param  {string}   queryOperator     Query operator (hits, average, sum, max or funnel)
 * @param  {object}   queryParams       Hash of parameters to add to the query
 * @param  {boolean}  useCache          Indicates if cache should be used or not
 * @callback callback
 */
EchoClient.prototype.queryAnalytics = function(token, queryOperator, queryParams, useCache, callback) {
    if (!token) {
        throw new Error('Missing Persona token');
    }

    if (!queryOperator) {
        throw new Error('Missing Analytics queryOperator');
    }

    var validOperators = ['hits', 'average', 'sum', 'max', 'funnel'];

    if (validOperators.indexOf(queryOperator) === -1) {
        throw new Error('Invalid Analytics queryOperator');
    }

    if (!queryParams) {
        throw new Error('Missing Analytics queryParams');
    }

    var constructQueryStringResponse = this._queryStringParams(queryParams);

    if (constructQueryStringResponse.errors) {
        throw new Error('Invalid Analytics queryParams');
    }

    var requestOptions = {
        url: this.config.echo_endpoint + '/1/analytics/' + queryOperator + '?' + constructQueryStringResponse.queryString,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    };

    if (useCache === false) {
        requestOptions.headers['cache-control'] = 'none';
    }

    this.debug(JSON.stringify(requestOptions));

    request.get(requestOptions, function(err, response, body) {
        if (err) {
             this.error('[echoClient] queryAnalytics error: ' + JSON.stringify(err));
            callback(err);
        } else {
            callback(null, body);
        }
    });
};

/**
 * Build up a query string
 * @param {object} params
 * @returns {string}
 * @private
 */
EchoClient.prototype._queryStringParams = function(params) {
    var queryString = '';
    var queryStringParams = [];
    var paramErrors = null;

    var isValidParameter = function (parameter) {
        var validParameters = [
            'class',
            'source',
            'property',
            'interval',
            'group_by',
            'key',
            'value',
            'from',
            'to',
            'percentile',
            'user',
            'filter',
            'n'
        ];

        var hasDot = parameter.indexOf('.');

        if (hasDot > -1) {
            parameter = parameter.substring(0, hasDot);
        }

        if (validParameters.indexOf(parameter) === -1) {
            return false;
        } else {
            return true;
        }
    }

    if (!_.isEmpty(params)) {
        for (var param in params) {
            if (params.hasOwnProperty(param)) {
                if (isValidParameter(param)) {
                    queryStringParams.push(encodeURIComponent(param) + '=' + encodeURIComponent(params[param]));
                } else {
                    if (!paramErrors) {
                        paramErrors = [];
                    }
                    paramErrors.push([param]);
                }
            }
        }
        queryString += queryStringParams.join('&');
    }

    return { errors: paramErrors, queryString: queryString };
};

/**
 * Log wrapping functions
 *
 * @param severity ( debug or error )
 * @param message
 * @returns {boolean}
 * @private
 */
EchoClient.prototype._log = function (severity, message) {
    if (!this.config.enable_debug) {
        return true;
    }

    if (this.config.logger) {
        if (severity === DEBUG) {
            this.config.logger.debug("[echo_node_client] " + message);
        } else if (severity === ERROR) {
            this.config.logger.error("[echo_node_client] " + message);
        } else {
            console.log(severity + ": [echo_node_client] " + message);
        }
    } else {
        console.log(severity + ": [echo_node_client] " + message);
    }
};

EchoClient.prototype.debug = function (message) {
    this._log(DEBUG, message);
};
EchoClient.prototype.error = function (message) {
    this._log(ERROR, message);
};

/**
 * The only way to get an instance of the Echo Client is through this method
 * @param config
 * @returns {EchoClient}
 */
exports.createClient = function (config) {
    return new EchoClient(config);
};
