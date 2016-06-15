
angular.module('labelpicker').controller('LabelPickerController', function($element, $scope, $http, labelservice) {

    // The unique id should be provided as a binding.  It's needed to make
    // unique references via html id's in the template
    $scope._id = $scope._id || 1;

    $scope.label_filter = '';
    $scope.add_enabled = 'disabled';

    $scope.refresh_labels = function() {
      $scope.labels = labelservice.labels;
    }



    //$scope.$on('documentclicked', function(event, target){
    //  if(!$.contains($element.context, target)) {
    //    $scope.$apply($scope.toggle);
    //  } else {
    //    console.log('ingoring');
    //  }
    //});

    $scope.click_toggler = function() {
      $scope.toggle();
      return true;
    }


    $scope.toggle = function() {
      $scope.refresh_labels();
    }

    // Removes a label from all references and deletes that label from the db.
    // This has several steps.  We need to remove the label from all references
    // in the db (which is done using a single request here), as well as have
    // all views of references locally reflect that in the ui (which is handled)
    // by each ref in response to an event we emit here.
    // We also need to actually remove the label from the db (the request for
    // that is made here), as well as make sure that all the label pickers
    // remove that label from teh list of options (this is done by asking the
    // label service to refresh itself).
    $scope.delete_label = function($event, label) {

      // Don't respond to the click on the x as being a normal click on the
      // option which would *add* the label
      $event.preventDefault();

      // This is a pretty severe operation.  Confirm first!
      let confirmed = confirm(
        "Are you sure you want to delete the label "
        + '\n\n\t"' + label.name + '"\n\n'
        + "and remove it from all references?\n(This can't be undone!)"
      );
      if(!confirmed) {
        return false;
      }

      // Send an event that this label is to be removed.
      // This notifies all the refs to update their ui by removing the label.
      // They don't make any actual changes in the db though, which is handled
      // in a centralized way here.
      $scope.$emit('notifyRemoveLabel', label)

      // Request the removal of the label from all references in the db.
      $http.put('/api/refs/labels/remove-all', label).then(
        function(response){},
        function(response){console.log(response);}
      );

      // Request removal of the label itself
      $http({
        url: '/api/labels',
        method: 'DELETE',
        params: {_id: label._id}
      }).then(
        function(response){
          // Reflect the removal of the label from the db in all the labelpickers through labelservice
          labelservice.refresh();
          $scope.toggle();
        },
        function(response){console.log(response);}
      )
    }


    // check if the enter key was hit, in which case we want to add a new
    // label.
    $scope.check_key = function($event) {
      if ($event.keyCode === 13) {
        $scope.add_new_label();
      }
    };

    // change the styling of the 'Add as new label' element (to show if it's
    // enabled)
    $scope.check_add_label_enabled = function() {
      if ($.trim($scope.label_filter.length)>0) {
        $scope.add_enabled = 'enabled';
      } else {
        $scope.add_enabled = 'disabled';
      }
    }

    $scope.add_new_label = function() {
      // First check if we already have a label with that name.  If so, just
      // activate it.
      for (i in labelservice.labels) {
        if (labelservice.labels[i].name == $scope.label_filter) {
          let label_to_activate = labelservice.labels[i];
          if(!$scope.activelabels[label_to_activate._id]) {
            // Mark the label checked in the picker
            $scope.activelabels[label_to_activate._id] = true;
            // Add the label to the ref
            $scope.labelchanged()(label_to_activate, $scope.activelabels[label_to_activate._id]);
            // Clear the text in the label picker's input
            $scope.label_filter = '';
          }
          return;
        }
      }

      // Otherwise, proceed with creating the new label.
      let new_label = $scope.label_filter;
      $http.post('/api/labels', {name:new_label}).then(

        // Notify the ref to add this label to its rendered model
        function(response){
          label = response.data;
          $scope.labelchanged()(label, true);

          // Notify all labelpickers to include the label in their options
          labelservice.refresh(function() {
            $scope.refresh_labels();
          });

          // Clear the label filter and mark that label active in the picker
          $scope.label_filter = '';
          $scope.activelabels[label._id] = true;
        },
        function(response){console.log(response)}
      );
    }

    // On clicking an option in the label picker, send a signal to update the
    // label using the labelchanged callback.  Whether it was changed to be
    // active or inactive is determined by the state in this.activelabels.
    $scope.label_clicked = function(s) {
      return function(label) {
        s.labelchanged()(label, s.activelabels[label._id]);
      }
    }($scope);

});

angular.module('labelpicker').directive('labelpicker', function() {
  return {
    templateUrl: 'labelpicker/labelpicker.template.html',
    scope: {
      pickerid: '=',
      labelchanged: '&',
      activelabels: '='
    },
    controller: 'LabelPickerController',

    link: function($scope, $element) {

      let id = random_chars(8);
      $($element.context).attr('id', id);
      $scope.id = id;

      $('#' + id).find('.drop-toggle').click(function(){
        let elm = $('#' + id).find('.drop');
        if(elm.css('display') == 'block') {
          elm.css('display','none');
        } else {
          elm.css('display','block');
        }
        $(document).trigger('click', id);
      })

      $(document).click(function(e, clicked_id){
        let container = $('#' + id);
        let drop = $('#' + id).find('.drop');

        if($.contains(container.get()[0], e.target) || clicked_id == id) {
          //ignore
        } else {
          drop.css('display', 'none');
        }
      });


    }

  }
});

angular.module('labelpicker').run(function($rootScope){
  angular.element(document).on('click', function(e){
    $rootScope.$broadcast("documentclicked", e.target);
  });
});
