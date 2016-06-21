angular.module('refs').directive('refs', function(){
  return {
    restrict: 'E',
    templateUrl: 'refs/refs.template.html',
    controller: 'RefsController',
    link: function(scope){
    }
  }
});

angular.module('refs').controller('RefsController', function RefsController($http, $scope, reflistservice) {

  $scope.adjust_padding = function() {
    let container_width = $('.ref-list').outerWidth();
    let margin = 28;
    let refs = $('.ref-list').children();
    if (refs.length) {
      var item_width = $(refs[0]).outerWidth();
    }
    let num_in_row = Math.floor(container_width / (item_width + margin));
    $('.ref-list').css({
      '-webkit-column-count': num_in_row,
      '-moz-column-count': num_in_row,
      'column-count': num_in_row
    });
    let space_left = container_width - (num_in_row * (item_width + margin));
    $('.ref-list').css({'padding-left':space_left/2-1});
    $('.ref-list').css({'padding-right':space_left/2-1});

  };

  $scope.$on('adjust-padding', $scope.adjust_padding);

  $(window).resize($scope.adjust_padding);

  // These get bound to two lists of references that are displayed
  $scope.reflistservice = reflistservice;

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

  $scope.delete = function(_id) {
    $scope.reflistservice.delete(_id);
  }

});
