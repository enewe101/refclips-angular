angular.module('refs').directive('ref', function($http, labelservice){
  return {
    templateUrl: 'refs/ref/ref.template.html',
    restrict: 'E',
    scope: {
      'bindRef': '&',
      'deleteCallback': '&',
      'tabId': '&'
    },
    controller: 'refcontroller',
    link: function(scope, element){

      let tabId = scope.tabId();
      scope.ref = scope.bindRef();
      let delete_callback = scope.deleteCallback();

      scope.save_ref = function() {
        $http.put('/api/refs', scope.ref).then(
          function(response){},
          function(response){console.log(response);}
        )
      }

      // Ask user if they really want to delete.
      // If so call the parent controllers' delete callback (a binding)
      scope.confirm_delete = function() {
        if(confirm('delete "' + scope.ref.title + '"?')) {
          delete_callback(scope.ref._id);
        }
      };

      // Handle adding and removing label.  If state is true, add, else remove.
      scope.update_label = function(label, state) {
        if (state) {
          scope.add_label(label);
        } else {
          scope.remove_label(label);
        }
      };

      // Copy the labels from the scope so that we don't need to modify the scope
      let theselabels = [];
      scope.ref.labels.forEach(function(label){
        let copy = $.extend({},label);
        theselabels.push(copy);
      });

      scope.remove_label = function(label) {
        $.ajax({
          url: '/api/refs/remove-label',
          method: 'PUT',
          data: JSON.stringify({"_id":scope.ref._id, "label":label}),
          contentType: 'application/json',
          success: function(response) {},
          error: function(response) {console.log(response);}
        });
      }

      scope.add_label = function(label) {

        $.ajax({
          url: '/api/refs/add-label',
          method: 'PUT',
          data: JSON.stringify({"_id":scope.ref._id, "label":label}),
          contentType: 'application/json',
          success: function(response) {},
          error: function(response) {console.log(response);}
        });

      }

      // Bind a reference to the dom elements needed to sync edit form and model
      let form_title = element.find('.form-title');
      let reftype_select = element.find('reftype select');
      let form_author = element.find('.form-author');
      let form_year = element.find('.form-year');
      let form_booktitle = element.find('.form-booktitle');
      let form_url = element.find('.form-url');
      let form_citation_key = element.find('.form-citation_key');

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
      let copy_model_to_form = function(){
        form_title.val(scope.ref.title);
        reftype_select.val(scope.ref.reftype);
        form_author.val(scope.ref.author);
        form_year.val(scope.ref.year);
        form_booktitle.val(scope.ref.booktitle);
        form_url.val(scope.ref.url);
        form_citation_key.val(scope.ref.citation_key);
      };

      // Syncs: model gets form's values
      let copy_form_to_model = function(){
        scope.ref.title = form_title.val();
        scope.ref.reftype = reftype_select.val();
        scope.ref.author = form_author.val();
        scope.ref.year = form_year.val();
        scope.ref.booktitle = form_booktitle.val();
        scope.ref.url = form_url.val();
        scope.ref.citation_key = form_citation_key.val();
      };

      // Syncs: display gets model's values
      let copy_model_to_display = function() {
        show_title.text(scope.ref.title);
        show_ref_type.text(scope.ref.ref_type);
        show_author.text(scope.ref.author);
        show_year.text(scope.ref.year);
        show_booktitle.text(scope.ref.booktitle);
        let link = $('<a>').attr({target: '_blank', href: scope.ref.url}).text(scope.ref.url);
        show_url.empty();
        show_url.append(link);
        show_citation_key.text(scope.ref.citation_key);
      }

      let copy_notes_to_model = function() {
        scope.ref.notes = form_notes.val();
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
        copy_model_to_form();
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
        copy_form_to_model();
        // Update the database entry for this ref
        $http.put('/api/refs', scope.ref).then(
          // On successful db update, hide form, make regular dislay reflect
          // model, and flash a "saved" message.
          function(response){
            hide_form();
            copy_model_to_display();
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
        $.ajax({
          url: '/api/refs',
          method: 'PUT',
          data: JSON.stringify(scope.ref),
          dataType: 'json',
          contentType: 'application/json',
          success: flash_saved,
          error: function(response){console.log(response);}
        });
      }

      // bind elm's needed to display a "saved" message
      let show_saved = element.find('.show-saved');

      // Show a "saved" message on the ref for a couple seconds
      let flash_saved = function() {
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


  });
