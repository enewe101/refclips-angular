
angular.module('refs').controller('RefsController', function RefsController($http, $scope, reflistservice) {

  // Use 'that' to pull this context into callbacks
  let that = this;


  // These get bound to two lists of references that are displayed
  this.reflistservice = reflistservice;

  // We watch for notification of label being deleted (Labels can be deleted
  // from the label-picker). This label will need to be removed from all refs.
  // After receiving the label deletion event from a contained labelpicker,
  // we re-broadcast that down to all contained references so that they can
  // remove instances of that label from their models.  This path of signalling
  // is used because the labelpickers can't easily communicate with all refs
  // directly.  So they send an event up to here, from where it is broadcast
  // down to all refs.
  $scope.$on('notifyRemoveLabel', function(event, data){
    let label = data;
    $scope.$broadcast('removeLabelNow', label);
  });

  this.delete = function(_id) {
    that.reflistservice.delete(_id);
  }

});

angular.module('refs').component('refs', {
  templateUrl: 'refs/refs.template.html',
  controller: 'RefsController'
});
