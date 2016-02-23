'use strict';

import { format } from 'util';

import { Component } from 'novus-component';
import { Server } from 'hapi';

import * as config from './lib/configPlugin';
import * as httpPlugin from './lib/httpPlugin';

const component = new Component('novus-api', {
  url: process.env.MQTT_BROKER_URL
});

// Register config plugin
component.register(config.register);

const server = new Server();
server.connection({
  port: 3030
});

// Register HTTP plugin
server.register({
  register: httpPlugin,
  options: {
    component: component
  }
}, (err) => {
	if(err) {
    console.error('Error loading HTTP plugin:', err.message);
    process.exit(-1);
  }
});


component.start()
  .then(server.start())
  .then(() => {
    console.log('Server running at:', server.info.uri);
  });
