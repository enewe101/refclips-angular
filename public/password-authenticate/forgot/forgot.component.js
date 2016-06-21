angular.module('passwordauthenticate').directive('forgotPassword', function(){
  return {
    'scope': {
      model: '=?',
      state: '=?'
    },
    'templateUrl': 'password-authenticate/forgot/forgot.template.html',
    'controller': 'forgotPasswordController',
  }
});

angular.module('passwordauthenticate').controller('forgotPasswordController', function($scope){

  $scope.registering = function() {
    console.log('registering');
    $scope.$emit('registering');
  }

  $scope.login = function() {
    console.log('login');
    $scope.$emit('login')
  }
});
