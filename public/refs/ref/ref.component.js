angular.module('refs').directive('ref', function($http){
  return {
    templateUrl: 'refs/ref/ref.template.html',
    restrict: 'E',
    scope: {
      'thisref': '=',
      'deleteCallback': '&'
    },
    controller: 'refcontroller',
    link: function(scope, element){

      // Behavior for the expansion of the ref when clicking on the small
      // downward-pointing arrow or writin in the text area is set up in the
      // link function for the reflist (refs.module.js) (note "refs" is plural)

      // Bind a reference to the dom elements needed to sync edit form and model
      let form_title = element.find('.form-title')
      let reftype_select = element.find('reftype select')
      let form_author = element.find('.form-author')
      let form_year = element.find('.form-year')
      let form_booktitle = element.find('.form-booktitle')
      let form_url = element.find('.form-url')
      let form_citation_key = element.find('.form-citation_key')

      // Bind reference to DOM elm's needed to sync non-editable display and model
      let show_title = element.find('.show-title');
      let show_ref_type = element.find('.show-ref_type');
      let show_author = element.find('.show-author');
      let show_year = element.find('.show-year');
      let show_booktitle = element.find('.show-booktitle');
      let show_url = element.find('.show-url');
      let show_citation_key = element.find('.show-citation_key');

      // Bind reference to DOM elm's for syncing ref's notes
      let form_notes = element.find('.notes');

      // Syncs: form gets model's values
      let copy_form_to_model = function(){
        form_title.val(scope.thisref.title);
        reftype_select.val(scope.thisref.reftype);
        form_author.val(scope.thisref.author);
        form_year.val(scope.thisref.year);
        form_booktitle.val(scope.thisref.booktitle);
        form_url.val(scope.thisref.form_url);
        form_citation_key.val(scope.thisref.citation_key);
      };

      // Syncs: model gets form's values
      let copy_model_to_form = function(){
        scope.thisref.title = form_title.val();
        scope.thisref.reftype = reftype_select.val();
        scope.thisref.author = form_author.val();
        scope.thisref.year = form_year.val();
        scope.thisref.booktitle = form_booktitle.val();
        scope.thisref.form_url = form_url.val();
        scope.thisref.citation_key = form_citation_key.val();
      };

      // Syncs: display gets model's values
      let copy_display_to_model = function() {
        show_title.text(scope.thisref.title);
        show_ref_type.text(scope.thisref.ref_type);
        show_author.text(scope.thisref.author);
        show_year.text(scope.thisref.year);
        show_booktitle.text(scope.thisref.booktitle);
        show_url.text(scope.thisref.url);
        show_citation_key.text(scope.thisref.citation_key);
      }

      let copy_notes_to_model = function() {
        scope.thisref.notes = form_notes.val();
      }

      // Bind a reference to dom elements needed to show/hide edit form
      let ref_details = element.find('.show-ref-details');
      let ref_form = element.find('.ref-form')

      // Shows the form to edit the ref's details
      let show_form = function(){
        ref_details.css('display', 'none');
        ref_form.css('display', 'block');
      };

      // Hides the form to edit ref; shows non-editable view
      let hide_form = function(){
        ref_details.css('display', 'block');
        ref_form.css('display', 'none');
      };

      // When "edit" button clicked, show a form for editing ref's details
      element.find('.click-start-edit').on('click', function(){
        // Make sure the form reflects the current state of the model
        copy_form_to_model();
        // Display the form for editing ref's details
        show_form();
      });

      // When "cancel" button clicked, hide edit form
      element.find('.click-cancel-edit').on('click', function(){
        // Display the edit form
        hide_form();
      });

      // When "save" button clicked do the following:
      //  - copy form's values onto model
      //  - then update the database,
      //  - hide the edit form
      element.find('.click-save-edit').on('click', function() {
        // Copy the form values to the model
        copy_model_to_form();
        // Update the database entry for this ref
        $http.put('/api/refs', scope.thisref).then(
          // On successful db update, hide form, make regular dislay reflect
          // model, and flash a "saved" message.
          function(response){
            hide_form();
            copy_display_to_model();
            flash_saved();
          },
          // On error during db update, log the response to the console
          function(response){console.log(response);}
        );
      });

      // Responsible for responding to the event that notes were changed.
      // After a timeout, initiates updating of notes in db.
      element.find('.notes').on('keyup', function(){
        console.log('notes changed');
        if (typeof notes_changed_timer !== 'undefined') {
          clearTimeout(notes_changed_timer);
        }
        notes_changed_timer = setTimeout(function(){
          update_notes();
        }, 2000);
      });

      // Send updated notes for the reference
      let update_notes = function() {
        copy_notes_to_model();
        console.log('updating notes');
        $http.put('/api/refs', scope.thisref).then(
          function(response){
            flash_saved()
            console.log('success');
          },
          function(response){console.log(response);}
        )
      }

      // bind elm's needed to display a "saved" message
      let show_saved = element.find('.show-saved');

      // Show a "saved" message on the ref for a couple seconds
      let flash_saved = function() {
        console.log('flashing saved');
        console.log(show_saved);
        show_saved.css('display', 'block');
        setTimeout(function(){
          show_saved.css('display', 'none');
        }, 2000);
      };

      scope.$on('removeLabelNow', function(){
        console.log('Remove label');
      });

    } // end of link function
  }; // end of directive definition object
}); // end of directive creation function

angular.module('refs').controller('refcontroller',
  function RefsController($http, $timeout, $scope, $element) {

    $scope.save_ref = function() {
      $http.put('/api/refs', $scope.thisref).then(
        function(response){console.log(response);},
        function(response){console.log(response);}
      )
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

    // Ask user if they really want to delete.
    // If so call the parent controllers' delete callback (a binding)
    $scope.confirm_delete = function() {
      if(confirm('delete "' + $scope.thisref.title + '"?')) {
        $scope.deleteCallback()($scope.thisref._id);
      }
    };

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
