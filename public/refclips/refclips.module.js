'use strict';

var app = angular.module('refclips',[
  'ngAnimate', 'ui.router', 'refs', 'labelpicker', 'header', 'notify',
  'passwordauthenticate', 'userStatus', 'paginator'
]);


app.config(function($httpProvider, $stateProvider, $urlRouterProvider) {

  // Supposed to speed loading time by grouping together template loads into
  // small batches that then trigger only one digest cycle.
  // see https://docs.angularjs.org/api/ng/provider/$httpProvider
  $httpProvider.useApplyAsync(true);

  $stateProvider
    .state('signedout', {
      templateUrl: 'refclips/signed-out.template.html',
      controller: function($scope) {
        $scope.state = 'arrived';
        $scope.auth_state = 'registering';
        $scope.get_started = function(){
          $scope.state = 'get-started';
        }
      }
    })
    .state('signedin', {
      templateUrl: 'refclips/signed-in.template.html',
      controller: 'signedincontroller'
    });
});


app.controller('signedincontroller', function($rootScope, $scope, reflistservice){
  $scope.$on('$viewContentLoaded', function(){
    reflistservice.get_refs();
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
