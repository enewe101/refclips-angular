angular.module('passwordauthenticate').directive('password', function(){
  return {
    scope: false,
    templateUrl: 'password-authenticate/password-field/password-field.template.html',
    link: function(scope, element){
      let input = element.find('input');
      let toggle = element.find('.toggle');
      let is_password = true;
      element.find('.toggle').on('click', function(){
        if(is_password){
          toggle.addClass('glyphicon-eye-close');
          toggle.removeClass('glyphicon-eye-open');
          input.attr('type', 'text');
        } else {
          toggle.addClass('glyphicon-eye-open');
          toggle.removeClass('glyphicon-eye-close');
          input.attr('type', 'password');
        }
        is_password = !is_password;
      });
    }
  };
});
