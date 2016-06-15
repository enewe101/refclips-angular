var passwordsignin = angular.module('passwordsignin');

passwordsignin.component('passwordsignout', {
  templateUrl: '/password-signin/password-signout.template.html',
  controller: 'passwordsignoutcontroller'
});

passwordsignin.controller('passwordsignoutcontroller', function($http, $state, $timeout){
  // Use "that" to access controller's context in callbacks
  let that = this;

  this.logout = function(){
    $http.get('/logout').then(
      function(response){$state.go('signedout');},
      function(response){console.log(response);}
    );
  };

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
