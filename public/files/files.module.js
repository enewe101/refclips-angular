let files = angular.module('files', ['myupload']);

files.component('filebunch', {
  bindings: {
    files: '=',
    formdata: '=',
    changed: '&'
  },
  templateUrl: 'files/files.template.html',
  controller: 'filescontroller'
});

files.controller('filescontroller', function($timeout){

  // Register the callback for onchange.  It will be passed down to each of the
  // <file> directives, who fire them if a change is encountered. If no such
  // callback was given, set to no-op.
  this.relay_onchange = this.changed() ? this.changed() : function() {}

  let that = this;
  this.add_file = function(file) {
    that.files.push(file);
  }

  // Removes a file from the ref.files model, then asks refs to sync with the db
  this.delete_file = function(file_id) {
    let remove_index = null;
    for (let f_index in that.files) {
      let f = that.files[f_index];
      if (f._id == file_id) {
        remove_index = f_index;
      }
    }
    that.files.splice(remove_index, 1);
    that.changed()();
  }

});
