angular.module('refs').directive('ref', function(){
  return {
    templateUrl: 'refs/ref/ref.template.html',
    restrict: 'E',
    scope: {
      'thisref': '=',
      'deleteCallback': '&'
    },
    controller: 'refcontroller',
    link: function(scope, element){
      // Now make the reference element itself (not the textarea) expand if
      // the user types in a textarea that is partially hidden.
      let textarea = element.find('textarea');
      let retainer = element.find('.retainer');
      let expander = element.find('.expander');
      textarea.on('keyup', function(){
        scope.$apply(function(){scope.retained = false;});
      });

    }
  };
});

angular.module('refs').controller('refcontroller',
  function RefsController($http, $timeout, $scope) {

    // Temporary model for holding edits.  It's bound to the edit form.
    $scope.edited_ref = $.extend({},$scope.thisref);
    $scope.upload_data = [{refid: $scope.thisref}];

    $scope.save_ref = function() {
      console.log($scope.thisref);
      $http.put('/api/refs', $scope.thisref).then(
        function(response){console.log(response);},
        function(response){console.log(response);}
      )
    }

    // used to constrain the height of the refs
    $scope.retained = true;
    $scope.toggle_retained = function() {
      $scope.retained = !$scope.retained;
    }

    // Listen for the signal to remove given labels when the the label is
    // being deleted outright.  Note that for this event, deleting the label
    // from the db was handled elsewhere.  We just need to remove it locally.
    $scope.$on('removeLabelNow', function(event, data) {
      let label = data;
      $scope.remove_label_locally(label);
    });

    // This bit of procedure runs when the component is first compiled.
    // Works out what labels are initially active in this ref.
    $scope.activelabels = {}
    for (let i in $scope.thisref.labels) {
      let _id = $scope.thisref.labels[i]._id;
      $scope.activelabels[_id] = true;
    }

    // Responsible for responding to the event that notes were changed.
    // After a timeout, initiates updating of notes in db.
    $scope.notes_changed = function() {
      if ($scope.notes_changed_timer) {
        clearTimeout($scope.notes_changed_timer);
      }
      $scope.notes_changed_timer = setTimeout(function(){
        $scope.update_notes();
      }, 2000);
    }

    // Send updated notes for the reference
    $scope.update_notes = function() {
      $http.put('/api/refs', $scope.thisref).then(
        function(response){$scope.flash_notes_saved()},
        function(response){console.log(response);}
      )
    }

    // Show a "saved" message when the ref details were saved
    $scope.show_details_saved = false;
    $scope.flash_details_saved = function() {
      $scope.show_details_saved = true;
      $timeout(function(){
        $scope.show_details_saved = false;
      }, 2000);
    };

    // Show a "saved" message when the ref notes were saved
    $scope.show_notes_saved = false;
    $scope.flash_notes_saved = function() {
      $scope.flash_details_saved();
      //$scope.show_notes_saved = true;
      //$timeout(function(){
      //  $scope.show_notes_saved = false;
      //}, 2000);
    };

    // Ask user if they really want to delete.
    // If so call the parent controllers' delete callback (a binding)
    $scope.confirm_delete = function() {
      if(confirm('delete "' + $scope.thisref.title + '"?')) {
        $scope.deleteCallback()($scope.thisref._id);
      }
    };

    // Manage the editing state of reference.
    // Template responds by either displaying editable or uneditable content.
    $scope.editing = false;
    $scope.start_edit = function(){
      $scope.editing = true;
    };
    $scope.cancel_edit = function(){
      $scope.editing = false;
      $scope.edited_ref = $.extend({}, $scope.thisref);
    };

    $scope.save_edit = function() {
      $http.put('/api/refs', $scope.edited_ref).then(
        function(response){
          $scope.flash_details_saved();
          $scope.thisref = $scope.edited_ref;
          $scope.editing = false;
        },
        function(response){console.log(response);}
      );
    }


    $scope.remove_label = function(label) {
      $scope.remove_label_remotely(label);
      $scope.remove_label_locally(label);
    };
    $scope.remove_label_locally = function(label) {
        $scope.thisref.labels = $scope.thisref.labels.filter(function(x) {
          return x._id !== label._id;
        });
    }
    $scope.remove_label_remotely = function(label) {
      $http.put(
        '/api/refs/remove-label', {"_id":$scope.thisref._id, "label":label}
      ).then(
        function(response) {},
        function(response) {console.log(response);}
      );
    }

    $scope.add_label = function(label) {
      $scope.add_label_remotely(label);
      $scope.add_label_locally(label);
    }
    $scope.add_label_remotely = function(label) {
      $http.put(
        '/api/refs/add-label',{"_id":$scope.thisref._id, "label":label}
      ).then(
        function(response) {},
        function(response) {response}
      );
    }
    $scope.add_label_locally = function(label) {
        $scope.thisref.labels.push(label);
    }

    // Handle adding and removing label.  If state is true, add, else remove.
    $scope.update_label = function(label, state) {
      if (state) {
        $scope.add_label(label);
      } else {
        $scope.remove_label(label);
      }
    };

  });
