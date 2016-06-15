let uploader = angular.module('uploader', ['lr.upload'])

uploader.directive('uploader', function($parse) {
  return {
    scope: {
      formdata: '=',
      onupload: '&'
    },
    restrict: 'A',
    controller: 'uploadercontroller',
    link: function (scope, element, attrs) {
      var model = $parse(attrs.fileModel);
      var modelSetter = model.assign;

      element.bind('change', function(){
          scope.$apply(function(){
              modelSetter(scope, element[0].files[0]);
          });
          scope.uploadFile();
      });
    }
  };
});

uploader.controller('uploadercontroller', function(upload, $scope, $element, $http){
  $scope.uploadFile = function(){

    console.log($scope.formdata);
    var fd = new FormData();
    for (let fieldname in $scope.formdata) {
      fd.append(fieldname, $scope.formdata[fieldname]);
    }
    fd.append('file', $scope.myFile);
    console.log('file is');
    console.dir($scope.myFile);
    $http.post('/upload', fd, {
        transformRequest: angular.identity,
        headers: {'Content-Type': undefined}
    }).then(
      function(response){
        console.log(response)
        $scope.onupload()(response.data);
      },
      function(response){console.log(response)}
    );

    //upload({
    //    url: '/upload',
    //    method: 'POST',
    //    data: {
    //      anint: 123,
    //      aFile: $element, // a jqLite type="file" element, upload() will extract all the files from the input and put them into the FormData object before sending.
    //    }
    //}).then(
    //  function (response) {console.log(response.data);},
    //  function (response) {console.error(response);}
    //);
  }
});
