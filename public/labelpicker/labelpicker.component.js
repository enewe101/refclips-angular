
angular.module('labelpicker').controller('LabelPickerController', function($element, $scope, $http, labelservice) {

});

angular.module('labelpicker').directive('labelpicker', function(labelservice) {
  return {
    templateUrl: 'labelpicker/labelpicker.template.html',
    scope: {
      labelchanged: '&?',
      toggleText: '&?',
      initLabels: '&?'
    },
    controller: 'LabelPickerController',

    link: function(scope, element) {

      // Unpack the labelchanged 1-time binding
      let labelchanged = scope.labelchanged? scope.labelchanged() : function(){};
      let toggle_text = scope.toggleText? scope.toggleText() : 'labels';
      let theselabels = scope.initLabels? scope.initLabels() : [];
      element.find('.toggler-text').text(toggle_text);

      // We need a unique id to allow registering and unregistering callbacks
      // to the labelservice
      let id = random_chars(8);
      scope.id = id;

      // This bit of procedure runs when the component is first compiled.
      // Works out what labels are initially active in this ref.
      let activelabels = {}
      for (let i in theselabels) {
        let _id = theselabels[i]._id;
        activelabels[_id] = true;
      }

      let remove_label = function(label) {
        theselabels = theselabels.filter(function(x) {
          return x._id !== label._id;
        });
        sync_labels();
      }

      let add_label = function(label) {
        theselabels.push(label);
        sync_labels();
      }

      let label_target = element.find('.labels-wrapper');
      let sync_labels = function() {
        label_target.empty();
        for (let i = 0; i < theselabels.length; i++) {
          label_target.append(make_label(theselabels[i]));
        }
      }
      let make_label = function(label) {
        return $('<span class="label label-default"></span>').text(label.name);
      }

      // When a label is selected or unselected, we do two things, achieved
      // by the callback function defined below.  First, we remove the visual
      // representation of the label from the label_wrapper.  Second, we call
      // another callback (the one bound to this scope during compilation).
      let label_change_handler = function(changed_label, is_checked) {
        // Handle the label change locally
        activelabels[changed_label._id] = is_checked;
        if(is_checked) {
          add_label(changed_label);
        } else {
          remove_label(changed_label);
        }
        // Call the bound callback so the parent scope can handle label change
        labelchanged(changed_label, is_checked);
      };

      // Arm the labelpicker to show a dropdown menu full of labels.
      // The dropdown is actually a singleton DOM subtree which gets transplanted
      // into menu_target by the labelservice.
      let labelpicker = element.find('.labelpicker-container');
      let menu_target = element.find('.menu-target');
      labelpicker.on('click', function(){
        labelservice.toggle_menu(menu_target, activelabels, label_change_handler, id);
      })

      // Respond to the deletion of a label type, by removing that label
      // (if any).
      labelservice.subscribe_label_removed(id, remove_label);

      // Remove callbacks on the labelservice if the picker is destroyed
      // to prevent memory leaks.
      scope.$on('$destroy', function(){
        labelservice.unsubscribe_label_change_handler(id)
        labelservice.unsubscribe_label_removed(id);
      });

      sync_labels();

    }

  }
});
