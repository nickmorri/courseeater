(function () {
    'use strict';

    var module_dependencies = ['ui.router', 'courseeater.auth', 'courseeater.store', 'courseeater.track', 'courseeater.schedule', 'courseeater.search', 'courseeater.settings'];

    angular
        .module('CourseEaterApp', module_dependencies)
        .config(AppConfig)
        .run(AppRun)
        .controller('HeadController', HeadController)
        .controller('NavController', NavController)
        .directive('navigationView', NavigationView)
        .directive('title', Title)

    AppConfig.$inject = ['$locationProvider', '$stateProvider', '$urlRouterProvider'];
    function AppConfig ($locationProvider, $stateProvider, $urlRouterProvider) {

        $locationProvider.html5Mode(true);

        $urlRouterProvider.otherwise('/track');

        $stateProvider

            .state('track', {
                url: '/track',
                templateUrl: 'app/views/track/base.html',
                controller: 'TrackController',
                data: { pageTitle: 'Track'}
            })

            .state('schedule', {
                url: '/schedule',
                templateUrl: 'app/views/schedule/schedule.html',
                controller: 'ScheduleController',
                data: { pageTitle: 'Schedule'}
            })

            .state('finals', {
                url: '/finals',
                templateUrl: 'app/views/schedule/finals.html',
                controller: 'FinalScheduleController',
                data: { pageTitle: 'Finals'}
            })

            .state('search', {
                url: '/search',
                templateUrl: 'app/views/search/base.html',
                controller: 'SearchController',
                data: { pageTitle: 'Search'}
            })

            .state('settings', {
                url: '/settings',
                templateUrl: 'app/views/settings/base.html',
                data: { pageTitle: 'Settings'}
            })
    }

    AppRun.$inject = ['$window', '$rootScope'];
    function AppRun ($window, $rootScope) {
        $rootScope.online = navigator.onLine;

        $window.addEventListener("offline", function () {
            $rootScope.$apply(function() {
                $rootScope.online = false;
            });
        }, false);

        $window.addEventListener("online", function () {
            $rootScope.$apply(function() {
                $rootScope.online = true;
            });
        }, false);

    }

    HeadController.$inject = ['$scope', '$state'];
    function HeadController ($scope, $state) {
        $scope.state = $state;
    }

    NavController.$inject = ['$scope', '$state'];
    function NavController ($scope, $timeout, $state) {
        $scope.state = $state;

        $scope.isPage = function (page) {
            return $scope.state.is(page);
        };
    }

    function NavigationView () {
        return {
            templateUrl: 'app/directives/navigation.html'
        }
    }

    Title.$inject = ['$rootScope'];
    function Title ($rootScope) {
        return {
            link: function() {
                $rootScope.$on('$stateChangeSuccess', function(event, toState) {
                    $rootScope.title = (toState.data && toState.data.pageTitle) ? toState.data.pageTitle : 'Default title';
                });
            }
        };
    }

}());