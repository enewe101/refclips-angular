let textsearch_module = angular.module('textsearch', ['refs']);

textsearch_module.directive('textSearch', function(){
  return {
    templateUrl: 'textsearch/textsearch.template.html',
    controller: 'textSearchController'
  };
});

textsearch_module.controller('textSearchController', function($scope, $element, reflistservice){

  let textinput = $element.find('input');
  let cancel_icon = $element.find('.cancel-icon');
  let search_icon = $element.find('.search-icon');

  $scope.check_key = function(e){
    if (e.keyCode === 13) {
      $scope.search();
    }
  };

  $scope.search = function(){
    // Use (and display) trimmed text query
    let text = textinput.val().trim();
    textinput.val(text);
    // Apply the text query constraint, then get the refs.
    reflistservice.text = textinput.val();
    reflistservice.get_refs();
    if(text) {
      show_cancel_icon();
    } else {
      show_search_icon();
    }
  };

  $scope.clear_search = function() {
    textinput.val('');
    reflistservice.text = '';
    reflistservice.get_refs();
    show_search_icon();
  }

  let show_search_icon = function(){
    cancel_icon.addClass('hide');
    search_icon.removeClass('hide');
  }

  let show_cancel_icon = function(){
    cancel_icon.removeClass('hide');
    search_icon.addClass('hide');
    console.log('here');
  }

  // don't allow an empty or white text input if the app is in the state of
  // showing results filtered by a text-search
  textinput.on('blur', function(){
    that = $(this);
    if(!that.val().trim()){
      that.val(reflistservice.text);
    }
  });

});
