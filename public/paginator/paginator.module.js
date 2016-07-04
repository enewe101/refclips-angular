angular.module('paginator', ['refs']);

angular.module('paginator').directive('paginator', function(){
  return {
    restrict: 'E',
    templateUrl: 'paginator/paginator.template.html',
    controller: 'PaginatorController',
    scope: {
      getNumResults: '&',
      paginate: '&?',
      initPage: '&?',
      initNumResults: '&?'
    },
    link: function(scope, element){

      let getNumResults = scope.getNumResults();
      let initPage = scope.initPage? scope.initPage() : 1;
      let initNumResults = scope.initNumResults? scope.initNumResults() : 10;

      let model = {
        results_per_page: initNumResults,
        page: initPage - 1,
        num_pages: null,
        total_results: null
      }

      // Unpack the one-way bindings
      let paginate = scope.paginate? scope.paginate() : function(){};

      // get all the html elements we need
      let prev = element.find('.prev');
      let next = element.find('.next');
      let page_indicator = element.find('.page-indicator');
      let total_pages = element.find('.total-pages');
      let results_per_page_indicator = element.find('.num-results-indicator');

      scope.set_num_results = function(num_results) {
        model.total_results = num_results;
        model.num_pages = Math.ceil(num_results / model.results_per_page)
        // If there are zero results, set num_pages to 1 instead of 0.
        // This avoids sending a request having a negative value for skip
        model.num_pages = Math.max(1, model.num_pages);
        total_pages.text(model.num_pages);
      }

      getNumResults(scope.set_num_results);

      // Initialize the page indicator to the initial page given
      page_indicator.val(model.page + 1);
      results_per_page_indicator.val(model.results_per_page);

      // Arm the results per page indicator
      results_per_page_indicator.on('keydown', function(e){
        if(e.keyCode !== 13) {
          return;
        }
        let results_per_page = parseInt(results_per_page_indicator.val());
        if(isNaN(results_per_page)) {
          results_per_page_indicator.val(model.results_per_page);
          return
        }
        model.results_per_page = results_per_page;
        results_per_page_indicator.val(model.results_per_page);
        paginate(model.page, model.results_per_page, scope.set_num_results);
      })

      // arm the prev button
      let go_prev = function(){
        // decrement the page, but don't go below zero
        model.page = Math.max(0, model.page - 1)
        // display the decremented page using one-based indexing
        page_indicator.val(model.page + 1);
        // call out the page change using the paginate callback
        paginate(model.page, model.results_per_page, scope.set_num_results);
      }
      element.on('click', '.prev', go_prev);

      let go_next = function(){
        // increment the page, but don't go below zero
        model.page = Math.min(model.num_pages - 1, model.page + 1)
        // display the decremented page
        page_indicator.val(model.page + 1);
        // call out the page change using the paginate callback
        paginate(model.page, model.results_per_page, scope.set_num_results);
        //reflistservice.page = Math.min(reflistservice.num_pages - 1, reflistservice.page + 1);
        //scope.page = reflistservice.page + 1;
        //reflistservice.get_refs();
      }
      element.on('click', '.next', go_next);

      element.on('keydown', '.page-indicator', function(event){
        // Only respond to hitting enter
        if (event.keyCode !== 13) {
          return
        }

        // Get the entered page.  If it's not a legitimate number, Then
        // just show the old page number and do nothing
        entered_val = parseInt(page_indicator.val());
        if(isNaN(entered_val)) {
          page_indicator.val(model.page + 1);
          return
        }

        // use zero-based indexing in the model
        model.page = entered_val - 1;
        // Ensure that the page we're going to is bounded between zero and num_pages
        model.page = Math.max(0, model.page);
        model.page = Math.min(model.num_pages - 1, model.page);
        // Sync the displayed page in case bounding changed the value (return to
        // one-based indexing)
        page_indicator.val(model.page + 1);
        paginate(model.page, model.results_per_page, scope.set_num_results);
      })

      // public function to enable setting the page
      let set_page = function(page) {
        model.page = Math.max(0, page);
        model.page = Math.min(model.num_pages - 1, model.page);
        page_indicator.val(model.page + 1);
      }
      element.data('set_page', set_page);

    }
  };
});

angular.module('paginator').controller('PaginatorController', function($element, $scope, reflistservice){


});
