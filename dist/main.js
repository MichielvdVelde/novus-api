'use strict';

var _util = require('util');

var _novusComponent = require('novus-component');

var _hapi = require('hapi');

var _configPlugin = require('./lib/configPlugin');

var config = _interopRequireWildcard(_configPlugin);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var component = new _novusComponent.Component('novus-api', {
  url: process.env.MQTT_BROKER_URL
});

// Register config plugin
component.register(config.register);

var server = new _hapi.Server();
server.connection({
  port: 3030
});

/**
 * Returns an error response to the client
**/
var replyError = function replyError(reply, error) {
  return reply({
    error: error
  });
};

/**
 *
**/
var handleStatusRequest = function handleStatusRequest(request, reply) {
  var key = ['status', request.params.device, request.params.type, request.params.name].join(':');
  var sensor = component.get(key);

  if (sensor === null) {
    return replyError(reply, 'unknown ' + request.params.type + ': ' + request.params.name);
  }

  return reply(sensor);
};

/**
 *
**/
var handleStatusUpdate = function handleStatusUpdate(request, reply) {
  var status = request.payload.status;
  var key = ['status', request.params.device, request.params.type, request.params.name].join(':');
  var sensor = component.get(key);

  if (sensor === null) {
    return replyError(reply, (0, _util.format)('unknown %s: %s', request.params.type, request.params.name));
  }

  if (sensor.status == status) {
    return replyError(reply, (0, _util.format)('status already %s', status));
  }

  var topic = (0, _util.format)('dev/%s/actuators/%s/%s', request.params.device, request.params.type, request.params.name);
  var payload = {
    source: request.payload.source ? ['api', request.payload.source].join(':') : 'api',
    status: status,
    date: new Date()
  };

  component.publish(topic, JSON.stringify(payload)).then(function () {
    return reply(payload);
  }).catch(function (err) {
    return reply({
      error: 'publish fail',
      message: err.message
    });
  });
};

/**
 *
**/
var handleSettingsRequest = function handleSettingsRequest(request, reply) {
  var key = ['config', request.params.device, request.params.type].join(':');
  var value = component.get(key);

  if (value === null) {
    return replyError(reply, (0, _util.format)('unknown settings for %s: %s', request.params.device, request.params.type));
  }

  return reply(value);
};

server.route([{
  method: 'GET',
  path: '/{device}/{type}',
  handler: handleSettingsRequest
}, {
  method: 'GET',
  path: '/{device}/{type}/{name}',
  handler: handleStatusRequest
}, {
  method: 'GET',
  path: '/{device}/actuators/{type}/{name}',
  handler: handleStatusRequest
}, {
  method: 'POST',
  path: '/{device}/actuators/{type}/{name}',
  handler: handleStatusUpdate
}]);

component.start().then(server.start()).then(function () {
  console.log('Server running at:', server.info.uri);
});