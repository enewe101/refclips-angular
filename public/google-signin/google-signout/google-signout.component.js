angular.module('signin').directive('signout', function(){
  return {
    scope: {
        onsignout: '&'
    },
    link: function(scope, element, attrs, controller, transcludefn){
      $(element.context).on('click', function(){
        var auth2 = gapi.auth2.getAuthInstance();
        auth2.signOut().then(function () {
          scope.$emit('signedout', 'user');
          console.log('User signed out.');
        });
      })
    },
  };
});
