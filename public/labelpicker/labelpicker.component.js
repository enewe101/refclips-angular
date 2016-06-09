
angular.module('labelpicker').controller('LabelPickerController', ['$scope', '$http', 'labelservice',


  function LabelPickerController($scope, $http, labelservice) {

    // Use 'that' to pass context to callback functions
    let that = this;

    // The unique id should be provided as a binding.  It's needed to make
    // unique references via html id's in the template
    this._id = this._id || 1;

    this.refresh_labels = function() {
      this.labels = labelservice.labels;
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
    this.delete_label = function($event, label) {

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
        function(response){console.log('label removed from all references: ' + label.name);},
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
          console.log('label deleted: ' + label.name);
        },
        function(response){console.log(response);}
      )
    }


    this.check_key = function($event) {
      if ($event.keyCode === 13) {
        this.add_new_label();
      }
    };

    this.add_new_label = function() {

      console.log('adding new label');

      let new_label = this.label_filter;
      $http.post('/api/labels', {name:new_label}).then(

        // Notify the ref to add this label to its rendered model
        function(response){
          label = response.data;
          that.labelchanged()(label, true);
          labelservice.refresh(function() {
            console.log('call backaroo');
            that.refresh_labels();
          });
          that.label_filter = '';
          that.activelabels[label._id] = true;
        },
        function(response){console.log(response)}

      );
    }

    this.label_clicked = function(label) {
      console.log('clicked ' + label);
      console.log(this.activelabels);
      this.labelchanged()(label, this.activelabels[label._id]);
    };
  }]
);

angular.module('labelpicker').component('labelpicker', {
  templateUrl: 'labelpicker/labelpicker.template.html',
  bindings: {
    pickerid: '=',
    labelchanged: '&',
    activelabels: '='
  },
  controller: 'LabelPickerController'
});
