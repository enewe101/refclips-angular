let filter = angular.module('filter', ['labelpicker']);

filter.directive('filter', function(){
  return {
    templateUrl: '/filter/filter.template.html',
    controller: 'filtercontroller',
    scope: {
      toggletext: '&?'
    }
  };
});

filter.controller('filtercontroller', function($scope, reflistservice){

    // This bit of procedure runs when the component is first compiled.
    // Works out what labels are initially active in this.
    $scope.activelabels = {}
    $scope.labels = [];

    for (let i in $scope.labels) {
      let _id = $scope.labels[i]._id;
      $scope.activelabels[_id] = true;
    }

    $scope.update_reflist = function() {
      reflistservice.labels = [];
      // We also set the page back to zero whenever the filter changes
      reflistservice.reset_page();
      for(let i = 0; i<$scope.labels.length; i++) {
        reflistservice.labels.push({'labels.name': $scope.labels[i].name});
      }
      reflistservice.get_refs();
    }

    $scope.remove_label = function(label) {
      $scope.remove_label_locally(label);
      $scope.update_reflist();
    };
    $scope.remove_label_locally = function(label) {
        $scope.labels = $scope.labels.filter(function(x) {
          return x._id !== label._id;
        });
    }

    $scope.add_label = function(label) {
      $scope.add_label_locally(label);
      $scope.update_reflist();
    }
    $scope.add_label_locally = function(label) {
        $scope.labels.push({_id:label._id, name:label.name});
    }

    // Handle adding and removing label.  If state is true, add, else remove.
    $scope.update_label = function(label, state) {
      if (state) {
        $scope.add_label(label);
      } else {
        $scope.remove_label(label);
      }
    };

})
