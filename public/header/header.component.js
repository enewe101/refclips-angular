angular.module('header', ['filter', 'lr.upload', 'userStatus']);

angular.module('header').component('header', {
  templateUrl: 'header/header.template.html',
  controller: 'headerController'
});
angular.module('header').controller('headerController', function($scope, userStatusService){

  // Use "that" to reference this context in callbacks.
  let that = this;

  this.userStatusService = userStatusService;

  this.onaddbibtex = function() {
    $('#add-ref-dropdown').dropdown('toggle')
  };
  this.onaddmanual = function() {
    $('#add-ref-dropdown').dropdown('toggle')
  };

  this.onsignedin = function() {};

  this.capture_click = function(e) {
    console.log('captured');
    e.stopPropagation();
  }

  this.user_state = this.user_state || userStatusService.user? 'signed-in' : 'not-signed-in';
  $scope.$on('user-updated', function(){
    if(userStatusService.user) {
      that.user_state = 'signed-in';
    } else {
      that.user_state = 'not-signed-in'
    }
    console.log('new state is: ' + this.user_state);
  });

});
