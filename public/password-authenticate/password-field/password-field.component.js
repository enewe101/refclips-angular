angular.module('passwordauthenticate').directive('password', function(){
  return {
    templateUrl: 'password-authenticate/password-field/password-field.template.html',
    scope: {
      model: '='
    },
    controller: function($scope){
      $scope.type = 'password';
      $scope.toggle = function() {
        if($scope.is_text) {
          $scope.type = 'password';
        } else {
          $scope.type = 'text';
        }
        $scope.is_text = !$scope.is_text;
      }
    }
  };
});
