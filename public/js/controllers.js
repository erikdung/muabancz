'use strict';

/* Controllers */

var app = angular.module('myApp.controllers', [])

app.controller('HomeCtrl', function($scope) {
    $scope.$on('$stateChangeSuccess',
            function() {
                /* ================================
                 ===  BACKGROUND SLIDER        ====
                 ================================= */
                $.vegas('slideshow', {
                    delay: 20000,
                    backgrounds: [
                        {src: 'images/backgrounds/bg1.jpg'}
                    ]
                });

                // nastaveni full-screen uvodni stranky
                var height = $(window).height();
                $("#intro").height(height);
                $("#buttons").css("margin-top", height * 0.38);
                $("#introText").css("margin-top", height * 0.01);
                $(".bottom-message-section").css("margin-top", height * 0.30);
            });
});

app.controller('MyCtrl2', function() {

});