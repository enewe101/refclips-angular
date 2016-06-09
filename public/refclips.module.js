'use strict';

angular.module('refclips',['ngAnimate', 'ui.router', 'refs', 'labelpicker']);

angular.module('refclips').config(function($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise('/home');

    $stateProvider

        // HOME STATES AND NESTED VIEWS ========================================
        .state('home', {
            url: '/home',
            template: 'Home!'
        })

        // ABOUT PAGE AND MULTIPLE NAMED VIEWS =================================
        .state('about', {
            url: '/about',
            template: 'About!'
        });

});
