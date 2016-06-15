angular.module('files').component('file', {
  bindings: {
    file: '=',
  },
  controller: 'filecontroller',
  templateUrl: '/files/file/file.template.html'
});

angular.module('files').controller('filecontroller', function(){
  this.target = this.file.type === 'pdf' ? '_blank' : '_self';
  let LENGTH=16;
  this.screen = function(string) {
    if(string.length > LENGTH) {
      return string.substring(0,LENGTH) + '...';
    }
    return string;
  }
});
