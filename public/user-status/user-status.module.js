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
    user: null
  }

  // Update user data and broadcast 'user-updated'
  service.update = function(new_user) {
    let old_user = service.user;
    service.user = new_user;
    $rootScope.$broadcast('user-updated', [new_user, old_user]);
  }

  service.check_status = function() {
    $http.get('/api/users/check-if-signed-in').then(
      function(response){
        service.update(response.data.user);
      },
      function(response){console.log(response);}
    )
  }

  service.check_status();
  return service
})
