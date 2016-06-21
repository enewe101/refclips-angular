angular.module('passwordauthenticate').directive('passwordRegister', function(){
  return {
    templateUrl: 'password-authenticate/password-register/password-register.template.html',
    scope: {
      'email': '=?',
    },
    controller: function($http, $scope, $timeout, $state, userStatusService) {

      $scope.prompt_forgot_password = false;

      $scope.reset_state = function() {
          $scope.message = '';
          $scope.prompt_forgot_password = false;
      };

      $scope.forgot_password = function() {
        $scope.$emit('forgot-password');
      };

      $scope.go_to_sign_in = function() {
        $scope.$emit('login');
      };

      $scope.create_user = function() {
        let new_user = {
          email:$scope.email,
          username:$scope.username,
          password:$scope.password
        };
        $http.post('/sapi/users', new_user).then(
          function(response){
            if (!response.data.success) {
              if(response.data.reason == 'dup_username') {
                $scope.prompt_forgot_password = false;
                $scope.message = "Sorry, that username is taken.";
              } else if(response.data.reason == 'dup_email') {
                console.log(response);
                $scope.prompt_forgot_password = true;
                $scope.message = "That email is already in use by another account.";
              }
            } else {
              // automatically sign in the user
              $scope.login(new_user);
            }
          },
          function(response){console.log(response)}
        );
      };

      $scope.login = function(new_user) {
        $http.post('/login', new_user).then(
          function(response){
            let user_data = response.data
            userStatusService.update(user_data);
            $scope.$emit('signed-in', user_data);
            $state.go('signedin');
          },
          function(response){
            console.log(response);
          }
        );
      }

      $scope.when_username_typing = function() {

        if ($scope.promise) {
          $timeout.cancel($scope.promise);
        }

          // Check if user name is taken (i.e. bad)
          if ($scope.username == '') {
            $scope.username_message = '';
            $scope.username_bad = false;
            $scope.username_good = false;
            return;
          }
          $scope.promise = $timeout($scope.check_username, 200);
      }

      $scope.username_message = '';
      $scope.check_username = function() {
        $http.get('/sapi/users/check-username?u=' + $scope.username).then(
          function(response){
            let username_taken = response.data;
            if (username_taken) {
              $scope.username_message = 'username taken';
              $scope.username_bad = true;
              $scope.username_good = false;
            } else {
              $scope.username_message = '';
              $scope.username_bad = false;
              $scope.username_good = true;
            }
          },
          function(response){console.log(response)}
        );
      }

    }
  }
});
