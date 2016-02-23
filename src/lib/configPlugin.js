'use strict';

export function register(component, options) {
  return new Promise(function(resolve, reject) {

    const saveConfigSetting = function(packet) {
      let key = [ 'config', packet.params.device, packet.params.type ].join('/');
      component.set(key, JSON.parse(packet.payload.toString()));
    };

    const saveStatusSetting = function(packet) {
      let key = [ 'status', packet.params.device, packet.params.type, packet.params.name ].join('/');
      component.set(key, JSON.parse(packet.payload.toString()));
    };

    component.route([
      {
        route: 'sys/settings/+device/actuators/+type',
        handler: saveConfigSetting
      },
      {
        route: 'sys/settings/+device/+type',
        handler: saveConfigSetting
      },
      {
        route: 'dev/+device/+type/+name',
        handler: saveStatusSetting
      },
      {
        route: 'dev/+device/actuators/+type/+name/status',
        handler: saveStatusSetting
      }
    ]);

    return resolve();

  });
}
