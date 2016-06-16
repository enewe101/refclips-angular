var labelpicker = angular.module('labelpicker', ['dropmenu']);


labelpicker.factory('labelservice', ['$http', function($http){
  var service = {};
  service.labels = [];
  service.refresh = function(callback) {
    $http.get('/api/labels').then(
      function(response){
        service.labels=response.data;
        callback ? callback() : 0;
      },
      function(response){console.log(response)}
    );
  };
  service.refresh();
  return service;
}]);
