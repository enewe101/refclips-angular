let userStatus = angular.module('userStatus', ['dropmenu', 'passwordauthenticate']);

userStatus.directive('userStatusIndicator', function(){
  return {
    controller: 'userStatusIndicatorController',
    templateUrl: 'user-status/user-status-indicator.template.html'
  };
});

userStatus.controller('userStatusIndicatorController', function($scope, userStatusService){
  $scope.user = userStatusService.user;
});

userStatus.factory('userStatusService', function($http, $rootScope){
  let service = {
    user: user
  }
  return service
})
