'use strict';

var should = require('should'),
    assert = require('assert'),
    echo = require('../../index.js'),
    rewire = require('rewire');

describe("Echo Node Client Test Suite", function(){
    describe("- Constructor tests", function(){
        it("- should throw error if config.echo_endpoint is not supplied", function(done){
            var echoClient = function(){
                return echo.createClient({});
            };
            echoClient.should.throw("Missing Echo config: echo_endpoint");
            done();
        });
        it("- should NOT throw any error if all config params are defined", function(done){
            var echoClient = function(){
                return echo.createClient({
                    echo_endpoint:"http://echo:3002"
            });
            };
            echoClient.should.not.throw();
            done();
        });
    });

    describe("- add events test", function(){
        it("- should throw error if no persona token supplied", function(done){
            var echoClient = echo.createClient({
                echo_endpoint:"http://echo:3002"
            });

            var addEvents = function(){
                return echoClient.addEvents(null, null, function(err, result){});
            };

            addEvents.should.throw("Missing Persona token");
            done();
        });
        it("- should throw error if no data supplied", function(done){
            var echoClient = echo.createClient({
                echo_endpoint:"http://echo:3002"
            });

            var addEvents = function(){
                return echoClient.addEvents('secret', null, function(err, result){});
            };

            addEvents.should.throw("Missing data");
            done();
        });
        it("- should throw error if data.class not supplied", function(done){
            var echoClient = echo.createClient({
                echo_endpoint:"http://echo:3002"
            });

            var addEvents = function(){
                return echoClient.addEvents('secret', {}, function(err, result){});
            };

            addEvents.should.throw("Missing field data.class");
            done();
        });
        it("- should throw error if data.source not supplied", function(done){
            var echoClient = echo.createClient({
                echo_endpoint:"http://echo:3002"
            });

            var addEvents = function(){
                return echoClient.addEvents('secret', {class:'test'}, function(err, result){});
            };

            addEvents.should.throw("Missing field data.source");
            done();
        });
        it("- add events should return an error if call to request returns an error", function(done){
            var echo = rewire("../../index.js");

            var echoClient = echo.createClient({
                echo_endpoint:"http://echo:3002"
            });
            var requestStub = {
                post:function(options, callback){
                    var error = new Error('Error communicating with Echo');
                    callback(error);
                }
            };

            echo.__set__("request", requestStub);

            echoClient.addEvents('secret', {class:'class', source:'source'}, function(err, result){

                (err === null).should.be.false;
                err.message.should.equal('Error communicating with Echo');
                (typeof result).should.equal('undefined');
            });
            done();
        });
        it("- add events should return an error if call to request has missing option.body", function(done){
            var echo = rewire("../../index.js");

            var echoClient = echo.createClient({
                echo_endpoint:"http://echo:3002"
            });
            var requestStub = {
                post:function(options, callback){
                    if(!options.body){
                        var error = new Error('Missing field: options.body');
                        callback(error);
                    } else{
                        callback(null);
                    }
                }
            };

            echo.__set__("request", requestStub);

            echoClient.addEvents('secret', {class:'class', source:'source'}, function(err){
                (err === null).should.be.true;
            });
            done();
        });
        it("- add events should return an error if call to request has missing option.method", function(done){
            var echo = rewire("../../index.js");

            var echoClient = echo.createClient({
                echo_endpoint:"http://echo:3002"
            });
            var requestStub = {
                post:function(options, callback){
                    if(!options.method){
                        var error = new Error('Missing field: options.method');
                        callback(error);
                    } else{
                        callback(null);
                    }
                }
            };

            echo.__set__("request", requestStub);

            echoClient.addEvents('secret', {class:'class', source:'source'}, function(err){
                (err === null).should.be.true;
            });
            done();
        });
        it("- add events should return an error if call to request has option.method != POST", function(done){
            var echo = rewire("../../index.js");

            var echoClient = echo.createClient({
                echo_endpoint:"http://echo:3002"
            });
            var requestStub = {
                post:function(options, callback){
                    if(options.method !== 'POST'){
                        var error = new Error('Invalid field: options.method');
                        callback(error);
                    } else{
                        callback(null);
                    }
                }
            };

            echo.__set__("request", requestStub);

            echoClient.addEvents('secret', {class:'class', source:'source'}, function(err){
                (err === null).should.be.true;
            });
            done();
        });
        it("- add events should return an error if call to request has missing option.json", function(done){
            var echo = rewire("../../index.js");

            var echoClient = echo.createClient({
                echo_endpoint:"http://echo:3002"
            });
            var requestStub = {
                post:function(options, callback){
                    if(!options.json){
                        var error = new Error('Missing field: options.json');
                        callback(error);
                    } else{
                        callback(null);
                    }
                }
            };

            echo.__set__("request", requestStub);

            echoClient.addEvents('secret', {class:'class', source:'source'}, function(err){
                (err === null).should.be.true;
            });
            done();
        });
        it("- add events should return no errors if everything is successful", function(done){

            var echo = rewire("../../index.js");

            var echoClient = echo.createClient({
                echo_endpoint:"http://echo:3002"
            });

            var requestMock = {};
            requestMock.post = function(options, callback){
                callback(null, {}, {
                    "class": "page.views",
                    "timestamp": 1324524509,
                    "user": "1234-5678-9012-3456",
                    "source" : "rl-app",
                    "props": {
                        "url" : "https://foo.bar/baz.html"
                    }
                });
            };

            echo.__set__("request", requestMock);

            echoClient.addEvents('secret', {class:'class', source:'source'}, function(err, result){

                (err === null).should.be.true;

                result.timestamp.should.equal(1324524509);
                result.user.should.equal("1234-5678-9012-3456");
                result.source.should.equal("rl-app");
                result.props.should.be.an.object;
                result.props.url.should.equal("https://foo.bar/baz.html");

                done();
            });
        });
    });

    describe('- query analytics tests', function(){
        it('- should throw error if no persona token supplied', function(done){
            var echoClient = echo.createClient({
                echo_endpoint: 'http://echo:3002'
            });

            var queryAnalytics = function(){
                return echoClient.queryAnalytics(null, null, false, function(err, result){});
            };

            queryAnalytics.should.throw('Missing Persona token');
            done();
        });
        it('- should throw error if no query string supplied', function(done){
            var echoClient = echo.createClient({
                echo_endpoint: 'http://echo:3002'
            });

            var queryAnalytics = function(){
                return echoClient.queryAnalytics('secret', null, false, function(err, result){});
            };

            queryAnalytics.should.throw('Missing Analytics queryPath');
            done();
        });
        it('- query analytics should return an error if call to request returns an error', function(done){
            var echo = rewire('../../index.js');

            var echoClient = echo.createClient({
                echo_endpoint: 'http://echo:3002'
            });
            var requestStub = {
                get:function(options, callback){
                    var error = new Error('Error communicating with Echo');
                    callback(error);
                }
            };

            echo.__set__('request', requestStub);

            echoClient.queryAnalytics('secret', 'query', false, function(err, result){
                (err === null).should.be.false;
                err.message.should.equal('Error communicating with Echo');
                (typeof result).should.equal('undefined');
            });
            done();
        });
        it("- query analytics should return no errors if everything is successful", function(done){
            var echo = rewire('../../index.js');

            var echoClient = echo.createClient({
                echo_endpoint: 'http://echo:3002'
            });

            var requestMock = {};
            requestMock.get = function(options, callback){
                var data = {
                      "head": {
                        "type": "sum",
                        "class": "player.timer.2",
                        "property": "interval_with_decay",
                        "group_by": "user",
                        "filter": {
                          "module_id": "589c8c0e8bbcb8ae13000001"
                        },
                        "user": {
                          "exclude": "qVyfsQhlMY0T2_Bl7eotrg"
                        },
                        "from": "2017-02-01T00:00:00",
                        "to": "2017-02-13T00:00:00",
                        "count": 1
                      },
                      "results": [
                        {
                          "user": "MPWubWyXy84sHl8SY5ub4A",
                          "interval_with_decay": 209726
                        }
                      ]
                };
                callback(null, {}, data);
            };

            echo.__set__("request", requestMock);

            echoClient.queryAnalytics('secret', 'query', false, function(err, result){
                (err === null).should.be.true;
                (result.results instanceof Array).should.be.true;
                result.results.length.should.equal(1);
                result.results[0].user.should.equal("MPWubWyXy84sHl8SY5ub4A");
                done();
            });
        });
    });
});
