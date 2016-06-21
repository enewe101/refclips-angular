var passwordAuthenticate = angular.module('passwordauthenticate', ['userStatus']);

angular.module('passwordauthenticate').directive('authentication', function(userStatusService){
  return {
    templateUrl: 'password-authenticate/authentication.template.html',
    controller: function($scope){
      $scope.$on('forgot-password', function(){
        $scope.state = 'forgot-password';
      });
      $scope.$on('registering', function(){
        $scope.state = 'registering';
      })
      $scope.$on('login', function(){
        $scope.state = 'not-signed-in';
      })
      $scope.$on('logged_in', function(){
        $scope.state = 'signed-in';
      })
    },
    scope: {
      state: '=?'
    },
    link: function(scope){
      scope.state = scope.state || (userStatusService.user? 'signed-in' : 'not-signed-in');
    }
  };
});
