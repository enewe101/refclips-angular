angular.module('passwordauthenticate').component('passwordAuthenticate', {
  bindings: {
    'email': '=?',
    'state': '=?',
  },
  templateUrl: '/password-authenticate/password-authenticate/password-authenticate.template.html',
  controller: 'passwordAuthentiCatecontroller'
});

angular.module('passwordauthenticate').controller('passwordAuthentiCatecontroller', function($http, $state, $timeout, $scope, userStatusService){
  // Use "that" to access controller's context in callbacks
  let that = this;

  this.register = function() {
    $scope.$emit('registering');
  };
  
  this.forgot_password = function() {
    console.log('forgot password');
    $scope.$emit('forgot-password');
  };

  this.message = '';
  this.submit = function(){
    let credentials = {email: this.email, password: this.password};

    $http.post('/login', credentials).then(
      function(response){
        let user_data = response.data
        userStatusService.update(user_data);
        $scope.$emit('signed-in', user_data);
        $state.go('signedin');
      },
      function(response){
        that.message = 'Sorry, the email and password did not match!';
      }
    );
  }
});






//passwordauthenticate.component('signedinuser', {
//  templateUrl: '/password-authenticate/signed-in-user.template.html',
//  controller: 'signedinusercontroller'
//})

//passwordauthenticate.controller('signedinusercontroller', function($http){
//  $http.get('/check-if-signed-in').then(
//    function(response){
//      console.log('sucess');
//      console.log(response.data);
//    },
//    function(response){
//      console.log('fail');
//    }
//  )
//});
