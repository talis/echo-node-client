'use strict';

var request = require('request');

// log severities
var DEBUG = "debug";
var ERROR = "error";

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
    if(!data.class){
        throw new Error('Missing field data.class');
    }
    if(!data.source){
        throw new Error('Missing field data.source');
    }

    var requestOptions = {
        url: this.config.echo_endpoint+'/1/events',
        headers: {
            'Accept': 'application/json',
            'Authorization':'Bearer '+token
        },
        body:data,
        method:'POST',
        json:true
    };

    request.post(requestOptions, function(err, response, body){
        if(err){
            callback(err);
        } else{
            callback(null, body);
        }
    });

    this.debug(JSON.stringify(requestOptions));

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