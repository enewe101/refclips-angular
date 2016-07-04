let textsearch_module = angular.module('textsearch', ['refs']);

textsearch_module.directive('textSearch', function(){
  return {
    scope: {
      doSearch: '&'
    },
    templateUrl: 'textsearch/textsearch.template.html',
    link: function(scope, element) {

      let do_search = scope.doSearch();

      let search_icon = element.find('.search-icon');
      let cancel_icon = element.find('.cancel-icon');
      let textinput = element.find('input');

      let check_key = function(e){
        if (e.keyCode === 13) {
          search();
        }
      };

      let current_search = null;

      let search = function(){
        // Use (and display) trimmed text query
        current_search = textinput.val().trim();
        textinput.val(current_search);

        // Apply the text query constraint, then get the refs.
        do_search(current_search);

        if(current_search) {
          show_cancel_icon();
        } else {
          show_search_icon();
          current_search = null;
        }
      };

      let clear_search = function() {
        current_search = null;
        textinput.val('');
        do_search('');
        show_search_icon();
      }

      let show_search_icon = function(){
        cancel_icon.addClass('hide');
        search_icon.removeClass('hide');
      }

      let show_cancel_icon = function(){
        cancel_icon.removeClass('hide');
        search_icon.addClass('hide');
      }

      element.on('click', '.search-icon', search);
      element.on('click', '.cancel-icon', clear_search);
      element.on('keydown', 'input', check_key);

      // don't allow an empty or white text input if the app is in the state of
      // showing results filtered by a text-search
      console.log('textinput');
      console.log(textinput);
      textinput.on('blur', function(){
        console.log('bluring');
        if(!textinput.val().trim()){
          console.log('bluring');
          if(current_search) {
            textinput.val(current_search);
          }
        }
      });

    }
  };
});
