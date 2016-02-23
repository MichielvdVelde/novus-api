'use strict';

import { format } from 'util';

import { Component } from 'novus-component';
import { Server } from 'hapi';

import * as config from './lib/configPlugin';

const component = new Component('novus-api', {
  url: process.env.MQTT_BROKER_URL
});

// Register config plugin
component.register(config.register);

const server = new Server();
server.connection({
  port: 3030
});

/**
 * Returns an error response to the client
**/
const replyError = function(reply, error) {
  return reply({
    error: error
  });
};

/**
 *
**/
const handleStatusRequest = function(request, reply) {
  let key = [ 'status', request.params.device, request.params.type, request.params.name ].join(':');
  let sensor = component.get(key);

  if(sensor === null) {
    return replyError(reply, 'unknown ' + request.params.type + ': ' + request.params.name);
  }

  return reply(sensor);
};

/**
 *
**/
const handleStatusUpdate = function(request, reply) {
  let status = request.payload.status;
  let key = [ 'status', request.params.device, request.params.type, request.params.name ].join(':');
  let sensor = component.get(key);

  if(sensor === null) {
    return replyError(reply, format('unknown %s: %s', request.params.type, request.params.name));
  }

  if(sensor.status == status) {
    return replyError(reply, format('status already %s', status));
  }

  let topic = format('dev/%s/actuators/%s/%s', request.params.device, request.params.type, request.params.name);
  let payload = {
    source: (request.payload.source) ? [ 'api', request.payload.source ].join(':') : 'api',
    status: status,
    date: new Date()
  };

  component.publish(topic, JSON.stringify(payload))
    .then(() => {
      return reply(payload);
    })
    .catch((err) => {
      return reply({
        error: 'publish fail',
        message: err.message
      });
    });
};

/**
 *
**/
const handleSettingsRequest = function(request, reply) {
  let key = [ 'config', request.params.device, request.params.type ].join(':');
  let value = component.get(key);

  if(value === null) {
    return replyError(reply, format('unknown settings for %s: %s', request.params.device, request.params.type));
  }

  return reply(value);
};

server.route([
  {
    method: 'GET',
    path: '/{device}/{type}',
    handler: handleSettingsRequest
  },
  {
    method: 'GET',
    path: '/{device}/{type}/{name}',
    handler: handleStatusRequest
  },
  {
    method: 'GET',
    path: '/{device}/actuators/{type}/{name}',
    handler: handleStatusRequest
  },
  {
    method: 'POST',
    path: '/{device}/actuators/{type}/{name}',
    handler: handleStatusUpdate
  }
]);


component.start()
  .then(server.start())
  .then(() => {
    console.log('Server running at:', server.info.uri);
  });
