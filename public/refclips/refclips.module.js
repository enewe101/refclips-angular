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
      let recent_refs = element.find('.recent-refs');
      let all_refs = element.find('.all-refs');
      let viewset_name = 'refpages'
      let viewset = tabservice.new_viewset(viewset_name);

      let template = '<refs viewset-name="viewset_name" tab-name="tab_name"></refs>'
      let tabs = ['recently added', 'all references'];
      for(let i = 0; i < tabs.length; i++) {
        let tab_name = tabs[i];
        let new_scope = scope.$new(true);
        new_scope.tab_name = tab_name;
        new_scope.viewset_name = viewset_name;
        let new_refs = $compile(template)(new_scope);
        refpages_container.append(new_refs);

        // The first tab will be active
        let is_active = (i === 1);
        if(is_active) {
          new_refs.css('display', 'block');
        }

        viewset.register_view(tab_name, function(){
          console.log('activating ' + tab_name);
          new_refs.css('display', 'block');
        }, function() {
          new_refs.css('display', 'none');
        }, is_active);
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
