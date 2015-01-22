var courseeater_app = angular.module('CourseEaterApp', ['ui.router', 'courseeater.auth', 'courseeater.track', 'courseeater.schedule', 'courseeater.list', 'courseeater.alert', 'courseeater.settings']);

courseeater_app.config(['$locationProvider', '$stateProvider', '$urlRouterProvider', function($locationProvider, $stateProvider, $urlRouterProvider) {
    
    $locationProvider.html5Mode(true);
    
    $urlRouterProvider.otherwise('/login');
    
    $stateProvider
    
        .state('login', {
            url: '/login',
            templateUrl: 'app/views/login/login.html',
            controller: 'LoginController',
            data: { pageTitle: 'Login'}
            
        })
    
        .state('track', {
            url: '/track',
            templateUrl: 'app/views/track/base.html',
            controller: 'TrackController',
            data: { pageTitle: 'Track'}
        })
        
        .state('schedule', {
            url: '/schedule',
            templateUrl: 'app/views/schedule/base.html',
            controller: 'ScheduleController',
            data: { pageTitle: 'Schedule'}
        })
        
        .state('settings', {
            url: '/settings',
            templateUrl: 'app/views/settings/base.html',
            controller: 'SettingsController',
            data: { pageTitle: 'Settings'}
        })
}]);

courseeater_app.controller('HeadController', ['$scope', '$state', function ($scope, $state) {
    $scope.state = $state;
}]);

courseeater_app.directive('navigationView', function () {
    return {
        templateUrl: 'app/directives/navigation.html'
    }
});

courseeater_app.directive('title', ['$rootScope', '$timeout', function($rootScope, $timeout) {
    return {
        link: function() {

            var listener = function(event, toState) {

                $timeout(function() {
                    $rootScope.title = (toState.data && toState.data.pageTitle) ? toState.data.pageTitle : 'Default title';
                });
            };

            $rootScope.$on('$stateChangeSuccess', listener);
        }
    };
}]);