angular.module('myupload', ['uploader']).directive('uploadbutton', function(){
  return {
    scope: {
      formdata: '=',
      onupload: '&'
    },
    templateUrl: '/uploader/uploader.template.html',
    link: function(scope, element) {
      let rand_id = random_chars(8);
      $(element.context).find('label').attr('for', rand_id);
      $(element.context).find('input').attr('id', rand_id);
    },
    controller: function($scope) {
      $scope.relayedonupload = $scope.onupload();
    }
  };
});
