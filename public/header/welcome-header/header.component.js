angular.module('welcomeheader', [
  'dropmenu', 'passwordauthenticate'
]);

angular.module('welcomeheader').directive('welcomeHeader', function(){
  return {
    scope: false,
    templateUrl: 'header/welcome-header/header.template.html',
    controller: 'welcomeHeaderController'
  };
});
angular.module('welcomeheader').controller('welcomeHeaderController', function($scope){

  $scope.onaddbibtex = function() {
    $('#add-ref-dropdown').dropdown('toggle')
  };
  $scope.onaddmanual = function() {
    $('#add-ref-dropdown').dropdown('toggle')
  };

  $scope.capture_click = function(e) {
    console.log('captured');
    e.stopPropagation();
  }

});
