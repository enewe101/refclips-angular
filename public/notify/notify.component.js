let notify = angular.module('notify', []);
notify.component('notifycomponent', {
  templateUrl: '/notify/notify.template.html',
  controller: 'notifycontroller'
});
notify.controller('notifycontroller', function(notifyservice){
  this.notifyservice = notifyservice;
});
notify.factory('notifyservice', function($timeout){
  let service = {
    notifications: {}
  };
  service.add = function (type, message) {
    let _id = random_chars(8);
    service.notifications[_id] = {type: type, message: message, _id: _id};
    $timeout(function(){
      service.remove(_id);
    }, 60000);
  };
  service.remove = function(_id) {
    console.log('deleting');
    delete service.notifications[_id];
  };
  return service;
});
