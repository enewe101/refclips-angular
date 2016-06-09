angular.module('refs').component('ref', {
  templateUrl: 'refs/ref/ref.template.html',
  bindings: {
    'ref': '=',
    'deleteCallback': '&'
  },
  controller: function RefsController($http, $timeout, $scope) {

    // Use 'that' to pass context to callbacks
    let that = this;

    // Temporary model for holding edits.  It's bound to the edit form.
    this.edited_ref = this.ref;

    // Listen for the signal to remove given labels when the the label is
    // being deleted outright.  Note that for this event, deleting the label
    // from the db was handled elsewhere.  We just need to remove it locally.
    $scope.$on('removeLabelNow', function(event, data) {
      let label = data;
      console.log('received removeLabelNow signal.');
      that.remove_label_locally(label);
    });

    // This bit of procedure runs when the component is first compiled.
    // Works out what labels are initially active in this ref.
    this.activelabels = {}
    for (let i in this.ref.labels) {
      console.log('loggin all labels: ' + this.ref.labels[i].toSource());
      let _id = this.ref.labels[i]._id;
      this.activelabels[_id] = true;
    }
    console.log('activelabels: ' + this.activelabels.toSource());

    // Responsible for responding to the event that notes were changed.
    // After a timeout, initiates updating of notes in db.
    this.notes_changed = function() {
      if (this.notes_changed_timer) {
        clearTimeout(this.notes_changed_timer);
      }
      this.notes_changed_timer = setTimeout(function(){
        that.update_notes();
      }, 2000);
    }

    // Send updated notes for the reference
    this.update_notes = function() {
      $http.put('/api/refs', this.ref).then(
        function(response){console.log('updated notes'); that.flash_notes_saved()},
        function(response){console.log('error updating notes')}
      )
    }

    // Show a "saved" message when the ref details were saved
    this.show_details_saved = false;
    this.flash_details_saved = function() {
      this.show_details_saved = true;
      $timeout(function(){
        that.show_details_saved = false;
      }, 2000);
    };

    // Show a "saved" message when the ref notes were saved
    this.show_notes_saved = false;
    this.flash_notes_saved = function() {
      this.show_notes_saved = true;
      $timeout(function(){
        that.show_notes_saved = false;
      }, 2000);
    };

    // Ask user if they really want to delete.
    // If so call the parent controllers' delete callback (a binding)
    this.confirm_delete = function() {
      if(confirm('delete "' + this.ref.title + '"?')) {
        this.deleteCallback()(this.ref._id);
      } else {
        console.log('cancelled');
      }
    };

    // Manage the editing state of reference.
    // Template responds by either displaying editable or uneditable content.
    this.editing = false;
    this.start_edit = function(){
      this.editing = true;
    };
    this.cancel_edit = function(){
      this.editing = false;
    };

    this.save_edit = function() {
      $http.put('/api/refs', this.edited_ref).then(
        function(response){
          console.log('updated notes');
          that.flash_details_saved();
          that.ref = that.edited_ref;
          that.editing = false;
        },
        function(response){console.log('error updating notes')}
      );
    }


    this.remove_label = function(label) {
      this.remove_label_remotely(label);
      this.remove_label_locally(label);
    };
    this.remove_label_locally = function(label) {
        this.ref.labels = this.ref.labels.filter(function(x) {
          return x._id !== label._id;
        });
    }
    this.remove_label_remotely = function(label) {
      $http.put(
        '/api/refs/labels', {"_id":that.ref._id, "label":label, "state":false}
      ).then(
        function(response) {console.log('label removed remotely: ' + label.toSource())},
        function(response) {console.log('there was an error: ' + error.toSource());}
      );
    }

    this.add_label = function(label) {
      this.add_label_remotely(label);
      this.add_label_locally(label);
    }
    this.add_label_remotely = function(label) {
      $http.put(
        '/api/refs/labels',{"_id":that.ref._id, "label":label, "state":true}
      ).then(
        function(response) {console.log('label added remotely to: ' + response.data._id);},
        function(response) {console.log('there was an error: ' + error.toSource());}
      );
    }
    this.add_label_locally = function(label) {
        that.ref.labels.push(label);
    }

    // Handle adding and removing label.  If state is true, add, else remove.
    this.update_label = function(label, state) {
      if (state) {
        that.add_label(label);
      } else {
        that.remove_label(label);
      }
    };

  }
});
