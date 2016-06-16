angular.module('files').component('file', {
  bindings: {
    file: '=',
    changed: '&',
    deleted: '&'
  },
  controller: 'filecontroller',
  templateUrl: '/files/file/file.template.html'
});

angular.module('files').controller('filecontroller', function($element, $http, $timeout){

  // Use "that" to reference this context in callbacks.
  let that = this;

  // Register the callbacks.  If none given, set to no-op.
  this.changed = this.changed() ? this.changed() : function(){};
  this.deleted = this.deleted() ? this.deleted() : function(){};

  this.target = this.file.type === 'pdf' ? '_blank' : '_self';
  let LENGTH=16;
  this.screen = function(string) {
    if(string.length > LENGTH) {
      return string.substring(0,LENGTH) + '...';
    }
    return string;
  }

  this.download = function(file_id) {
    let request_path = 'uploads/refs?fid=' + file_id + '&mode=dl';
    console.log(request_path);
    $http.get(request_path,
      function(response){console.log('ok')},
      function(response){console.log('problem')}
    );
  }

  this.edit_fname = this.file.sent_name;
  this.editing = false;
  this.start_editing = function() {
    this.editing = true;
    $timeout(function(){
      console.log($($element.context).find('.edit-filename'));
      $($element.context).find('.edit-filename').select();
    }, 100);
  }

  this.protected = false
  this.watch_for_escape = function(e) {
    if ((e.keyCode) == 27) {
      this.protected = true;
      $(e.target).blur();
      this.editing = false;
    }
  }

  this.on_blur = function() {
    if(!this.protected) {
      this.file.sent_name = this.edit_fname;
      this.save_fname();
      this.editing = false;
    } else {
      this.protected = false;
    }
  }

  this.save_fname = function() {
    $http.put('/api/files', this.file).then(
      function(response){console.log(response)},
      function(response){console.log(response)}
    );

    this.changed();
  }

  this.delete = function() {
    if(confirm('Really delete "' + this.file.sent_name + '"?')) {
      $http({url: '/api/files', method: 'DELETE', params: {_id:this.file._id}}).then(
        function(response){
          that.deleted(that.file._id);
        },
        function(response){console.log(response)}
      )
    }
  }

});
