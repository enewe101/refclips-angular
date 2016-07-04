'use strict';

var app = angular.module('welcome', [
  'welcomeheader'//, 'passwordauthenticate', 'userStatus'
], function($rootScopeProvider){
  $rootScopeProvider.digestTtl(45);
});

app.config(function($httpProvider) {
  // Supposed to speed loading time by grouping together template loads into
  // small batches that then trigger only one digest cycle.
  // see https://docs.angularjs.org/api/ng/provider/$httpProvider
  $httpProvider.useApplyAsync(true);
});

app.directive('welcome', function(){
  return {
    restrict: 'A',
    link: function(scope, element){
      let get_started_button = element.find('.get-started');
      let register_form = element.find('.registration')
      get_started_button.on('click', function(){
        get_started_button.css('display', 'none');
        register_form.css('display', 'block');
      });
    },
    controller: 'welcomecontroller'
  };
})

app.controller('welcomecontroller', function($rootScope){
  var nbDigest = 0;
  $rootScope.$watch(function() {
    nbDigest++;
    console.log('digest-' + nbDigest);
  })
});
