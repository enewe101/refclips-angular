var labelpicker = angular.module('labelpicker', []);


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


//labelpicker.factory('labelservice', ['$http', function($http){
//  function theService() {


//    // For passing context into $http callback
//    let that = this;

//    this.has_labels = false;
//    this.labels = [];

//    // Refreshes the list of labels from the database
//    this.registered = []

//    // Let label subscribers subscribe.
//    this.register = function(callback) {
//      console.log('registering');
//      this.registered.push(callback);
//    }

//    // Send new labels
//    this.notify = function() {
//      console.log('notifying ' + this.registered.length + ' subscribers');

//      for(let i=0; i<this.registered.length; i++) {
//        console.log('attempting to call a ' + typeof this.registered[i]);
//        this.registered[i](this.labels);
//      }
//    }

//    // Get the labels, then notify the subscribers
//    this.get_labels = function(callback) {
//      console.log('get labels called');
//      $http.get('/api/labels').then(
//        function(response){
//          console.log('services callback firing');
//          that.labels=response.data;
//          that.notify();
//        },
//        function(response){console.log(response)}
//      );
//    };

//    // Fetch all the labels now.
//    this.get_labels();
//  }

//  return new theService();

//}]);
