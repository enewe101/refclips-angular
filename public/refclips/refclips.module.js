'use strict';

var app = angular.module('refclips',[
  'ngAnimate', 'ui.router', 'refs', 'labelpicker', 'header', 'notify',
  'passwordauthenticate', 'userStatus', 'paginator', 'tabs'
], function($rootScopeProvider){
  $rootScopeProvider.digestTtl(45);
});


app.config(function($httpProvider) {
  // Supposed to speed loading time by grouping together template loads into
  // small batches that then trigger only one digest cycle.
  // see https://docs.angularjs.org/api/ng/provider/$httpProvider
  $httpProvider.useApplyAsync(true);
});

app.directive('app', function($compile, tabservice) {
  return {
    link: function(scope, element){

      let refpages_container = element.find('.ref-pages-container');
      let viewset_name = 'refpages'

      let template = '<refs viewset-name="viewset_name" tab-id="tab_id" tab-name="tab_name"></refs>'
      let tabs = ['recently added', 'all references'];
      let num_tabs = 0

      let add_view = function(tab_id, tab_name, do_activate){
        // Ensure that tab_id is a string.  Because integers get transformed
        // into strings when used as keys!!
        tab_id = tab_id.toString();
        console.log('adding view ' + tab_id + ' ' + tab_name);

        num_tabs += 1;
        let new_scope = scope.$new(true);
        new_scope.tab_name = tab_name;
        new_scope.viewset_name = viewset_name;
        new_scope.tab_id = tab_id;
        let new_refs = $compile(template)(new_scope);
        refpages_container.append(new_refs);

        // The first tab will be active
        if(do_activate) {
          new_refs.css('display', 'block');
        }

        // Register this view
        let view_spec = {
          name: tab_name,
          id: tab_id,
          do_activate: do_activate,
          show_callback: function(){
            console.log('got view ' + tab_id);
            new_refs.css('display', 'block');
          },
          hide_callback: function() {
            new_refs.css('display', 'none');
          }
        };
        console.log(view_spec);
        viewset.register_view(view_spec);
      }

      let add_view_callback = function() {
        add_view(num_tabs, 'all references', true);
      }
      let viewset = tabservice.new_viewset(viewset_name, add_view_callback);

      for(let i = 0; i < tabs.length; i++) {
        // We activate the second tab by default
        let do_activate = (i === 1);
        add_view(i, tabs[i], do_activate);

        //let tab_name = tabs[i];
        //let new_scope = scope.$new(true);
        //new_scope.tab_name = tab_name;
        //new_scope.viewset_name = viewset_name;
        //let new_refs = $compile(template)(new_scope);
        //refpages_container.append(new_refs);

        //// The first tab will be active
        //let is_active = (i === 1);
        //if(is_active) {
        //  new_refs.css('display', 'block');
        //}

        //viewset.register_view(tab_name, function(){
        //  console.log('activating ' + tab_name);
        //  new_refs.css('display', 'block');
        //}, function() {
        //  new_refs.css('display', 'none');
        //}, is_active);
      }

    },
    controller: function($rootScope){
      var nbDigest = 0;
      $rootScope.$watch(function() {
        nbDigest++;
        console.log('digest-' + nbDigest);
      })
    }

  };
});
