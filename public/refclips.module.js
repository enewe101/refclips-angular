'use strict';

var app = angular.module('refclips',[
  'ngAnimate', 'ui.router', 'refs', 'labelpicker', 'header', 'notify',
  'signin'
]);

app.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('signedout', {templateUrl: '/signed-out.template.html'})
    .state('signedin', {templateUrl: '/signed-in.template.html'});
});

app.controller('refclipscontroller', function($scope, $state){
  $scope.$on('signedout', function(event, next){
    console.log('caught signed out event');
    $state.go('signedout');
  });
});

// Ensure the default state is signed out.
app.run(['$state', function($state) {
  $state.go('signedout');
}]);
