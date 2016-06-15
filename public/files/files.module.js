let files = angular.module('files', ['myupload']);

files.component('filebunch', {
  bindings: {
    files: '=',
    formdata: '='
  },
  templateUrl: 'files/files.template.html',
  controller: 'filescontroller'
});

files.controller('filescontroller', function($timeout){
  let that = this;
  this.add_file = function(file) {
    that.files.push(file);
  }
});
