'use strict';


// Declare app level module which depends on filters, and services
angular.module('myApp', [
    'ui.router',
    'myApp.filters',
    'myApp.services',
    'myApp.directives',
    'myApp.controllers',
    'ngCookies',
    'pascalprecht.translate'
]).
        config(function($stateProvider, $urlRouterProvider, $translateProvider) {
    // For any unmatched url, redirect to /state1
    $urlRouterProvider.otherwise("/");
    //
    // Now set up the states
    $stateProvider
            .state('home', {
        url: "/",
        templateUrl: "partials/home.html",
        controller: 'HomeCtrl'
    })
            .state('home.buy', {
        url: "^/ban",
        templateUrl: "partials/buy.html"
    })
            .state('view2', {
        url: "/view2",
        templateUrl: "partials/partial2.html",
        controller: 'MyCtrl2'
    });

    /* =================================
     LOADER                     
     =================================== */
// makes sure the whole site is loaded
    jQuery(window).load(function() {
        // will first fade out the loading animation
        jQuery(".status").fadeOut();
        // will fade out the whole DIV that covers the website.
        jQuery(".preloader").delay(1000).fadeOut("slow");
    });

    $translateProvider.useStaticFilesLoader({
        prefix: 'lang/locale-',
        suffix: '.json'
    });
    $translateProvider.preferredLanguage('vn');
    $translateProvider.useLocalStorage();

}).
        run(function($rootScope, $translate) {
    $rootScope.changeLang = function(lang) {
        $translate.uses(lang);
    }
});
