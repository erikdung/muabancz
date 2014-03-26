'use strict';


// Declare app level module which depends on filters, and services
angular.module('myApp', [
    'ui.router',
    'myApp.filters',
    'myApp.services',
    'myApp.directives',
    'myApp.controllers',
    'ngCookies',
    'ngResource',
    'pascalprecht.translate',
    'angularFileUpload',
    'igTruncate'
]).
        config(function($stateProvider, $urlRouterProvider, $translateProvider, $httpProvider) {

    var checkLoggedin = function($q, $timeout, $http, $rootScope, $state) {
        // Initialize a new promise
        var deferred = $q.defer();

        // Make an AJAX call to check if the user is logged in
        $http.get('/loggedin').success(function(user) {
            // Authenticated
            if (user !== '0') {
                $timeout(deferred.resolve, 0);
            }
            // Not Authenticated
            else {
                $rootScope.message = 'You need to log in.';
                $timeout(function() {
                    deferred.reject();
                }, 0);
                $state.go('home.login');
            }
        });

        return deferred.promise;
    };

    var checkAdminLoggedin = function($q, $timeout, $http, $rootScope, $state) {
        // Initialize a new promise
        var deferred = $q.defer();

        // Make an AJAX call to check if the user is logged in
        $http.get('/loggedin').success(function(user) {
            // Authenticated
            if (user !== '0' && user.role === "admin") {
                $timeout(deferred.resolve, 0);
            }
            // Not Authenticated
            else {
                $rootScope.message = 'You need to log in.';
                $timeout(function() {
                    deferred.reject();
                }, 0);
                $rootScope.logout();
                $state.go('home.login');
            }
        });

        return deferred.promise;
    };


    //================================================
    // Add an interceptor for AJAX errors
    //================================================
    $httpProvider.responseInterceptors.push(function($q, $location) {
        return function(promise) {
            return promise.then(
                    // Success: just return the response
                            function(response) {
                                return response;
                            },
                            // Error: check the error status to get only the 401
                                    function(response) {
                                        if (response.status === 401)
                                            $location.url('/login');
                                        return $q.reject(response);
                                    }
                            );
                        }
            });
    //================================================

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
            .state('home.sell', {
        url: "^/sell",
        templateUrl: "partials/home.sell.html",
        controller: "SellCtrl"
    })
            .state('home.login', {
        url: "^/login",
        templateUrl: "partials/home.login.html",
        controller: "LoginCtrl"
    })
            .state('home.register', {
        url: "^/register",
        templateUrl: "partials/home.register.html",
        controller: "RegisterCtrl"
    })
            .state('home.registered', {
        url: "^/registered",
        templateUrl: "partials/home.registered.html"
    })
            .state('main', {
        url: "/main",
        templateUrl: "partials/main.html"
    })
            .state('main.buy', {
        url: "^/buy/:page",
        templateUrl: "partials/buy.html",
        controller: "BuyCtrl"
    })
            .state('main.detail', {
        url: "^/detail/id/:id",
        templateUrl: "partials/main.detail.html",
        controller: "MaindetailCtrl"
    })
            .state('main.quicksell', {
        url: "^/quick-sell",
        templateUrl: "partials/quicksell.html",
        controller: "QuicksellCtrl"
    })
            .state('admin', {
        url: "/admin",
        templateUrl: "partials/admin.html",
        controller: 'AdminCtrl',
        resolve: {
            loggedin: checkLoggedin
        }
    })
            .state('admin.add', {
        url: "^/add-product",
        templateUrl: "partials/admin.add.html",
        controller: "AddproductCtrl",
        resolve: {
            loggedin: checkLoggedin
        }
    })
            .state('admin.list', {
        url: "^/product-list",
        templateUrl: "partials/admin.list.html",
        controller: "ProductlistCtrl",
        resolve: {
            loggedin: checkLoggedin
        }
    })
            .state('admin.gooddetail', {
        url: "^/product-detail/id/:id",
        templateUrl: "partials/admin.detail.html",
        controller: "ProductdetailCtrl",
        resolve: {
            loggedin: checkLoggedin
        }
    })
            .state('adminmain', {
        url: "/admin-main",
        templateUrl: "partials/adminmain.html",
        controller: "AdminmainCtrl",
        resolve: {
            loggedin: checkAdminLoggedin
        }
    })
            .state('adminmain.categories', {
        url: "/categories",
        templateUrl: "partials/adminmain.categories.html",
        controller: "AdmincategoriesCtrl",
        resolve: {
            loggedin: checkAdminLoggedin
        }
    })
            .state('adminmain.categories.detail', {
        url: "/detail/id/:id",
        templateUrl: "partials/adminmain.categories.detail.html",
        controller: "AdmincatdetailCtrl",
        resolve: {
            loggedin: checkAdminLoggedin
        }
    });


    /* =================================
     LOADER                     
     =================================== */
// makes sure the whole site is loaded
    jQuery(window).load(function() {
        // will first fade out the loading animation
        jQuery(".status").fadeOut();
        // will fade out the whole DIV that covers the website.
        jQuery(".preloader").fadeOut("fast");
    });

    $translateProvider.useStaticFilesLoader({
        prefix: 'lang/locale-',
        suffix: '.json'
    });
    $translateProvider.preferredLanguage('vn');
    $translateProvider.useLocalStorage();

}).
        run(function($rootScope, $translate, $http, $state) {
    $rootScope.changeLang = function(lang) {
        console.log(lang);
        $translate.uses(lang);
    }

    $rootScope.logout = function() {
        $http.get("/logout").success(function() {
            $state.go("home");
        });
    }

    $rootScope.check = function() {
        $http.get('/loggedin').success(function(user) {
        });
    }
});
