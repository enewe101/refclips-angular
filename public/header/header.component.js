angular.module('header', ['signin']);

angular.module('header').component('header', {
  templateUrl: 'header/header.template.html',
  controller: 'headerController'
});
angular.module('header').controller('headerController', function(){

  // Initialize sign in
  this.initializesignin = function() {
    console.log('initilizing signin');
    gapi.signin.go();
  }

  // Shows / hides menu items
  this.showing = null;
  this.menu_toggle = function(menu_item) {
    if (menu_item == this.showing) {
      this.showing = null;
    } else {
      this.showing = menu_item;
    }
  };

  this.onaddbibtex = function() {
    $('#add-ref-dropdown').dropdown('toggle')
  };
  this.onaddmanual = function() {
    $('#add-ref-dropdown').dropdown('toggle')
  };

});
