'use strict';

import { Component } from 'novus-component';

import { ConfigPlugin } from './lib/ConfigPlugin';
import { StatusPlugin } from './lib/StatusPlugin';

/**
 * Initialize the Component
**/
const component = new Component(process.env.API_COMPONENT_ID, {
  url: process.env.MQTT_BROKER_URL,
  username: process.env.API_COMPONENT_ID,
  password: new Buffer(process.env.API_COMPONENT_PASSWORD)
});

/**
 * Register plugins
**/
component.register([
  {
    register: ConfigPlugin
  },
  {
    register: StatusPlugin
  }
]);
