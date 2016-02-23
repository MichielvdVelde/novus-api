'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.register = register;
function register(component, options) {
  return new Promise(function (resolve, reject) {

    var saveConfigSetting = function saveConfigSetting(packet) {
      var key = ['config', packet.params.device, packet.params.type].join('/');
      component.set(key, JSON.parse(packet.payload.toString()));
    };

    var saveStatusSetting = function saveStatusSetting(packet) {
      var key = ['status', packet.params.device, packet.params.type, packet.params.name].join('/');
      component.set(key, JSON.parse(packet.payload.toString()));
    };

    component.route([{
      route: 'sys/settings/+device/actuators/+type',
      handler: saveConfigSetting
    }, {
      route: 'sys/settings/+device/+type',
      handler: saveConfigSetting
    }, {
      route: 'dev/+device/+type/+name',
      handler: saveStatusSetting
    }, {
      route: 'dev/+device/actuators/+type/+name/status',
      handler: saveStatusSetting
    }]);

    return resolve();
  });
}