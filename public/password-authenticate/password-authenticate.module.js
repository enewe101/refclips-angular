var passwordAuthenticate = angular.module('passwordauthenticate', ['userStatus']);

angular.module('passwordauthenticate').directive('authentication', function($http, userStatusService){
  return {
    scope: {
      'initialState': '&?'
    },
    templateUrl: 'password-authenticate/authentication.template.html',
    link: function(scope, element) {

      // Work out what the initial state should be
      let initialState = scope.initialState? scope.initialState() : user? 'logout' : 'login';

      // Get the various authentication widgets
      let logout = element.find('.logout');
      let login = element.find('.authenticate');
      let register = element.find('.register');
      let forgot = element.find('.forgot');

      // Get the login elements:
      let login_email = login.find('.email');
      let login_password = login.find('password input');
      let login_submit = login.find('.submit');
      let login_message = login.find('.form-message');

      // Get the register elements;
      let register_email = register.find('.email');
      let register_password = register.find('password input');
      let register_username = register.find('.username');
      let register_submit = register.find('.submit');
      let register_username_bad = register.find('.username-bad');
      let register_username_ok = register.find('.username-ok');
      let register_email_bad = register.find('.email-bad');
      let register_email_ok = register.find('.email-ok');
      let register_username_message = register.find('.username-message')
      let register_message = register.find('.form-message');
      let register_password_bad = register.find('.password-bad');
      let register_password_ok = register.find('.password-ok');

      // Get the forgot elements:
      let forgot_email = forgot.find('.email');
      let forgot_submit = forgot.find('.submit');

      // Keep all email fields sync'd
      let email_sync_debouncer = null;
      element.find('.email').on('input', function(){
        let that = $(this);
        if(email_sync_debouncer) {
          clearTimeout(email_sync_debouncer);
        }
        email_sync_debouncer = setTimeout(function(){
          login_email.val(that.val());
          forgot_email.val(that.val());
          register_email.val(that.val());
        }, 200);
      })

      // Get auth navigation links
      let show_forgot = element.find('.forgot-link');
      let show_register = element.find('.register-link');
      let show_login = element.find('.login-link');

      // shows the specified authentication widget
      let show = function(which) {

        logout.css('display', 'none');
        login.css('display', 'none');
        register.css('display', 'none');
        forgot.css('display', 'none');

        switch (which) {
          case 'logout':
            logout.css('display', 'block');
            break;
          case 'login':
            login.css('display', 'block');
            break;
          case 'register':
            register.css('display', 'block');
            break;
          case 'forgot':
            forgot.css('display', 'block');
            break;
        }
      };

      // Arm the widget transition links (these are used to go between the
      // login form, registration form, and forgot-password form)
      element.on('click', '.forgot-link', function(){
        show('forgot');
      });
      element.on('click', '.login-link', function(){
        show('login');
      });
      element.on('click', '.register-link', function(){
        show('register');
      });

      // Show the initial state
      show(initialState);

      // arm submission of the forgot password form
      forgot_submit.on('click', function(){
        do_forgot_email();
      });
      forgot_email.on('keydown', function(e){
        if(e.keyCode === 13) {do_forgot_email();}
      })
      let do_forgot_email = function(){
        console.log(forgot_email.val());
      }

      // Arm submission of the login form
      login.on('click', '.submit', function(){login_form_login();});
      login.on('keydown', '.email', function(e){if(e.keyCode === 13) {login_form_login();}});
      login.on('keydown', 'password input', function(e){if(e.keyCode === 13) {login_form_login();}});
      let login_form_login = function() {
        let credentials = {
          email: login_email.val(),
          password: login.find('password input').val()
        };
        do_login(credentials);
      };
      let do_login = function(credentials) {
        $.ajax({
          url: '/login',
          method: 'POST',
          contentType: 'application/json',
          dataType: 'json',
          data: JSON.stringify(credentials),
          success: function(response){
            login_message.text('');
            window.location.reload();
          },
          error: function(response){
            login_message.text('Sorry, the email and password did not match!');
          }
        });
      }

      // Arm client-side validation for registration email.  Only put an 'x'
      // if the email is bad when the user blurs the input.
      let check_email_bad = function() {
        if(register_email.val().trim()==='') {
          register_email_ok.css('display', 'none');
          register_email_bad.css('display', 'none');
        } else if(!email_is_valid(register_email.val())) {
          register_email_ok.css('display', 'none');
          register_email_bad.css('display', 'inline-block');
        }
      }
      register.on('blur', '.email', check_email_bad);

      // Put a checkmark if the email is good after user input (debounced),
      // or clear any 'x' or checkmark if the email field is blank
      let check_email_promise = null
      let debounce_check_email_good = function() {
        if(check_email_promise) {
          clearTimeout(check_email_promise);
        }
        if(register_email.val().trim()==='') {
          register_email_ok.css('display', 'none');
          register_email_bad.css('display', 'none');
        } else {
          setTimeout(function(){
            if(email_is_valid(register_email.val())) {
              register_email_ok.css('display', 'inline-block');
              register_email_bad.css('display', 'none');
            }
          }, 200);
        }

      }
      register.on('input', '.email', debounce_check_email_good)

      // Arm submission of register form
      register.on('click', '.submit', function(){do_register();});
      register.on('keydown', '.email', function(e){if(e.keyCode === 13) {do_register();}});
      register.on('keydown', '.username', function(e){if(e.keyCode === 13) {do_register();}});
      register.on('keydown', 'password input', function(e){if(e.keyCode === 13) {do_register();}});
      let do_register = function() {

        // clear any "bad"ness on fields that could be around from a previous
        // attempt to submit
        register_username.removeClass('bad');
        register_email.removeClass('bad');
        register.find('password input').removeClass('bad');
        register_message.empty();

        // Get the user data from the form
        let new_user = {
          email: register_email.val(),
          username: register_username.val(),
          password: register.find('password input').val()
        };

        // Ask the server to make a new user
        $http.post('/sapi/users', new_user).then(
          function(response){
            let success = response.data.success;
            if (!response.data.success) {
              let reason = response.data.reason;
              let message_text = [];
              console.log('success: ' + success);
              console.log('reason: ' + reason);

              // Look for email mistakes
              if(reason.indexOf('dup_email') > -1) {
                message_text.push('That email is already in use.');
                register_username.addClass('bad');
              } else if(reason.indexOf('bad-email') > -1) {
                message_text.push('Double check that email!');
                register_email.addClass('bad');
              }

              // Look for username mistakes
              if(reason.indexOf('dup_username') > -1) {
                message_text.push('Sorry, that username is taken.');
                register_username.addClass('bad');
              } else if(reason.indexOf('bad-username') > -1) {
                message_text.push('You forgot to choose a username!');
                register_username.addClass('bad');
              }
              // Look for password mistakes
              if(reason.indexOf('bad-password') > -1) {
                message_text.push('You forgot to choose a password!');
                register.find('password input').addClass('bad');
              } else if(reason.indexOf('short-password') > -1) {
                message_text.push('Please use at least 8 characters in your password!');
                register.find('password input').addClass('bad');
              }
              register_message.html('Whoops! ' + message_text.join('<br>'));
            } else {
              // If making the user succeeded, go ahead and sign them in
              do_login(new_user);
            }
          },
          function(response){console.log(response)}
        );
      };

      // Arm checking username in register form
      let username_check_promise = null
      let debounce_check_username = function() {
        if (username_check_promise) {
          clearTimeout(username_check_promise);
        }
        // Check if user name is taken (i.e. bad)
        if (register_username.val() == '') {
          register_username_message.text('');
          register_username_bad.css('display', 'none');
          register_username_ok.css('display', 'none');
        } else {
          username_check_promise = setTimeout(check_username, 200);
        }
      }
      register.on('input', '.username', debounce_check_username);

      // Check a username that's typed into the username field (after delay)
      let check_username = function(){
        console.log('checking username');
        // todo: GET THE USERNAME FIRST
        $.ajax({
          url: '/sapi/users/check-username?u=' + register_username.val(),
          method: 'GET',
          success: display_username_status,
          error: function(response){console.log(response)}
        });
      };

      // Show the response about whether the username is taken
      let display_username_status = function(username_taken) {
        if (username_taken) {
          register_username_message.text('taken');
          register_username_bad.css('display', 'inline-block');
          register_username_ok.css('display', 'none');
        } else {
          register_username_message.text('');
          register_username_bad.css('display', 'none');
          register_username_ok.css('display', 'inline-block');
        }
      }

      // Arm client-side validation of registration password.
      // Only put an 'x' if the password is bad when the user blurs the input.
      let check_password_bad = function() {
        if(register.find('password input').val()==='') {
          register_password_ok.css('display', 'none');
          register_password_bad.css('display', 'none');
        } else if(register.find('password input').val().length < 8){
          register_password_ok.css('display', 'none');
          register_password_bad.css('display', 'inline-block');
        }
      }
      register.on('blur', 'password input', check_password_bad);

      // Put a checkmark if the password is good after user input (debounced),
      // or clear any 'x' or checkmark if the password field is blank
      let check_password_promise = null
      let debounce_check_password_good = function() {
        if(check_password_promise) {
          clearTimeout(check_password_promise);
        }
        if(register.find('password input').val()==='') {
          register_password_ok.css('display', 'none');
          register_password_bad.css('display', 'none');
        } else {
          setTimeout(function(){
            if(register.find('password input').val().length >= 8) {
              register_password_ok.css('display', 'inline-block');
              register_password_bad.css('display', 'none');
            }
          }, 200);
        }
      }
      register.on('input', 'password input', debounce_check_password_good)



      // Arm logout widget
      logout.on('click', function(){
        $.ajax({
          url: '/logout',
          method: 'GET',
          success: function(){window.location.reload();},
          error: function(response){console.log(response);}
        });
      });

    }
  };
});
