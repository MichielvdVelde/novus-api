'use strict';

var _util = require('util');

var _novusComponent = require('novus-component');

var _hapi = require('hapi');

var _configPlugin = require('./lib/configPlugin');

var config = _interopRequireWildcard(_configPlugin);

var _httpPlugin = require('./lib/httpPlugin');

var httpPlugin = _interopRequireWildcard(_httpPlugin);

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

// Register HTTP plugin
server.register({
  register: httpPlugin,
  options: {
    component: component
  }
}, function (err) {
  if (err) {
    console.error('Error loading HTTP plugin:', err.message);
    process.exit(-1);
  }
});

component.start().then(server.start()).then(function () {
  console.log('Server running at:', server.info.uri);
});