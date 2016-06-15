'use strict';

var app = angular.module('refclips',[
  'ngAnimate', 'ui.router', 'refs', 'labelpicker', 'header', 'notify',
  'passwordsignin'
]);

app.controller('signedincontroller', function($rootScope, $scope, reflistservice){
  $scope.$on('$viewContentLoaded', function(){
    reflistservice.get_refs();
  });
});

app.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('signedout', {
      templateUrl: '/signed-out.template.html'
    })
    .state('signedin', {
      templateUrl: '/signed-in.template.html',
      controller: 'signedincontroller'
    });
});

app.controller('refclipscontroller', function($rootScope, reflistservice){
  $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams, options){
    if(toState.name == 'signedout') {
      reflistservice.flush_refs();
    }
  });
});

// Ensure the default state is signed out.
app.run(['$state', function($state) {
  if(user) {
    $state.go('signedin');
  } else {
    $state.go('signedout');
  }
}]);
