'use strict';

export function register(component, options) {
  return new Promise((resolve, reject) => {

    /**
     * Store a system setting
     * NOTE: Payload is assumed to be JSON!
    **/
    const storeSystemSetting = function(packet) {
      let key = [ 'system' ].concat(packet.param.key).join('/');
      let value = JSON.parse(packet.payload.toString());
      component.set(key, value);
    };

    /**
     * Store a device setting
     * NOTE: Payload is assumed to be JSON!
    **/
    const storeDeviceSetting = function(packet) {
      let key = [ 'device' ].concat(packet.params.device, packet.param.key).join('/');
      let value = JSON.parse(packet.payload.toString());
      component.set(key, value);
    };

    /**
     * Register routes
    **/
    component.route([
      {
        route: 'sys/settings/#key',
        handler: storeSystemSetting
      },
      {
        register: 'dev/+device/settings/#key',
        handler: storeDeviceSetting
      }
    ]);

    return resolve();

  });
}
