'use strict';

var should = require('should'),
    assert = require('assert'),
    echo = require('../../index.js');

describe("Echo Node Client Test Suite", function(){
    describe("- Constructor tests", function(){
      it("should throw error if config.echo_host is not supplied", function(done){
        var echoClient = function(){
          return echo.createClient({});
        };
        echoClient.should.throw("Missing Echo config: echo_host");
        done();
      });

      it("should throw error if config.echo_port is not supplied", function(done){
        var echoClient = function(){
          return echo.createClient({echo_host:'echo'});
        };
        echoClient.should.throw("Missing Echo config: echo_port");
        done();
      });
      it("should NOT throw any error if all config params are defined", function(done){
        var echoClient = function(){
          return echo.createClient({
            echo_host:"http://echo",
            echo_port:3000
          });
        };
        echoClient.should.not.throw();
        done();
      });
    });
});