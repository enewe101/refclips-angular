let signin = angular.module('signin', []);

signin.controller('signincontroller', ['$state', '$http', function($state, $http){

  // Callback function that fires once the user has been authenticated
  // by clicking the "sign-in with google button".
  this.success = function(googleUser) {
    var profile = googleUser.getBasicProfile();
    var id_token = googleUser.getAuthResponse().id_token;
    console.log('Full Name: ' + profile.getName());

    $http.post('/api/users/google-signin', {id_token: id_token}).then(
      function(response){$state.go('signedin');},
      function(response){console.log(response);}
    )
  }
}]);

// Link function that builds the google sign-in button on top of the
// main element constituting the directive.
// Building the button needs to happen after the template is rendered which
// is why it is handled in the directive's link function.
// The button is built using google's api, by supplying the id for the html
// element on which the button should be built. We dynamically generate this
// id within the link function so multiple signing buttons can coexist on a
// page without colliding ids, and without ids needing to be set manually.
let link = function ($scope, element, attrs, controller, transcludefn) {
  //let options  = {
  //  'immediate': false,
  //  'scope': 'email',
  //  'width': 200,
  //  'height': 50,
  //  'longtitle': true,
  //  'theme': 'dark',
  //  'onsuccess': controller.success,
  //  'onfailure': function(){console.log('failure');}
  //};
  //console.log(controller);
  //let signin_element_id = random_chars(8);
  //$(element.context).attr('id',signin_element_id);
  //gapi.signin2.render(signin_element_id, options);
}

// The signin directive.
signin.directive('signin', function(){
    return {
      templateUrl: '/signin/signin.template.html',
      link: link,
      controller: 'signincontroller'
    };
})
