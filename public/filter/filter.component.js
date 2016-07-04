let filter = angular.module('filter', ['labelpicker']);

filter.directive('filter', function(){
  return {
    templateUrl: '/filter/filter.template.html',
    controller: 'filtercontroller',
    scope: {
      onchange: '&?'
    },
    link: function(scope, element) {

    }
  };
});

filter.controller('filtercontroller', function($scope, reflistservice){

    $scope.toggle_text = 'label-filter';
    let onchange = $scope.onchange? $scope.onchange() : function(){};

    // This bit of procedure runs when the component is first compiled.
    // Works out what labels are initially active in this.
    $scope.labels = [];

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
      onchange($scope.labels);
    };
    $scope.remove_label_locally = function(label) {
        $scope.labels = $scope.labels.filter(function(x) {
          return x._id !== label._id;
        });
    }

    $scope.add_label = function(label) {
      $scope.add_label_locally(label);
      onchange($scope.labels);
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
