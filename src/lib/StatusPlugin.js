'use strict';

export function register(component, options) {
  return new Promise((resolve, reject) => {

    /**
     * Store the status of a sensor
    **/
    const storeSensorStatus = function(packet) {
      // status/serialtomqtt3/sensor/temperature
      let key = [ 'status', packet.params.device, 'sensor', packet.params.sensor ].join('/');
      let value = JSON.parse(packet.payload.toString());
      component.set(key, value);
    };

    /**
     * Store the status of a sensor
    **/
    const storeActuatorStatus = function(packet) {
      let params = packet.params;
      // status/serialtomqtt3/switch/main_light
      let key = [ 'status', params.device, params.actuator, params.name ].join('/');
      let value = JSON.parse(packet.payload.toString());
      component.set(key, value);
    };

    component.route([
      {
        // dev/serialtomqtt3/sensor/temperature
        route: 'dev/+device/sensor/+sensor',
        handler: storeSensorStatus
      },
      {
        // dev/serialtomqtt3/actuator/switch/main_light
        route: 'dev/+device/actuator/+actuator/+name',
        handler: storeActuatorStatus
      }
    ]);

    return resolve();

  });
}
