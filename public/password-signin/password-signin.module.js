var passwordsignin = angular.module('passwordsignin', []);

passwordsignin.component('passwordsignin', {
  templateUrl: '/password-signin/password-signin.template.html',
  controller: 'passwordsignincontroller'
});

passwordsignin.controller('passwordsignincontroller', function($http, $state, $timeout){
  // Use "that" to access controller's context in callbacks
  let that = this;

  this.credentials = {}
  this.message = '';
  this.submit = function(){
    $http.post('/login', that.credentials).then(
      function(response){
        user = response.data;
        $state.go('signedin');
      },
      function(response){
        that.message = 'Sorry, the email and password did not match!';
      }
    );
  }
});

//passwordsignin.component('signedinuser', {
//  templateUrl: '/password-signin/signed-in-user.template.html',
//  controller: 'signedinusercontroller'
//})

//passwordsignin.controller('signedinusercontroller', function($http){
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
