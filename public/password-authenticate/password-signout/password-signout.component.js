var passwordauthenticate = angular.module('passwordauthenticate');

passwordauthenticate.component('passwordSignout', {
  templateUrl: '/password-authenticate/password-signout/password-signout.template.html',
  controller: 'passwordsignoutcontroller'
});

passwordauthenticate.controller('passwordsignoutcontroller', function($http, $state, $timeout, userStatusService){
  // Use "that" to access controller's context in callbacks
  let that = this;

  this.logout = function(){
    console.log('signing out');
    $http.get('/logout').then(
      function(response){
        userStatusService.update(null);
        $state.go('signedout');
      },
      function(response){console.log(response);}
    );
  };

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
