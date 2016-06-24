angular.module('paginator', ['refs']);

angular.module('paginator').directive('paginate', function(){
  return {
    restrict: 'E',
    templateUrl: 'paginator/paginator.template.html',
    controller: 'PaginatorController'
  };
});

angular.module('paginator').controller('PaginatorController', function($scope, reflistservice){

  $scope.page = reflistservice.page + 1;

  $scope.$on('reset-page', function(){
    $scope.page = reflistservice.page + 1;
  });

  $scope.go = function(event) {

    // Only respond to hitting enter
    if (event.keyCode !== 13) {
      return
    }

    // Convert to zero-based indexing
    let page = $scope.page - 1;

    // Ensure that the page we're going to is bounded between zero and max_page
    page = Math.max(0, page);
    page = Math.min(reflistservice.max_page - 1, page);

    // Sync the displayed page in case bounding changed the value (return to
    // one-based indexing)
    $scope.page = page + 1;

    // Send the query
    reflistservice.page = page;
    reflistservice.get_refs();
  }

  $scope.prev = function(){
    reflistservice.page = Math.max(0, reflistservice.page - 1);
    $scope.page = reflistservice.page + 1;
    reflistservice.get_refs();
  }

  $scope.next = function(){
    reflistservice.page = Math.min(reflistservice.max_page - 1, reflistservice.page + 1);
    $scope.page = reflistservice.page + 1;
    reflistservice.get_refs();
  }

});
