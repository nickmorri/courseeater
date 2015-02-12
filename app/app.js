var courseeater_app = angular.module('CourseEaterApp', ['ui.router', 'courseeater.auth', 'courseeater.track', 'courseeater.schedule', 'courseeater.settings']);

courseeater_app.config(['$locationProvider', '$stateProvider', '$urlRouterProvider', function($locationProvider, $stateProvider, $urlRouterProvider) {
    
    $locationProvider.html5Mode(true);
    
    $urlRouterProvider.otherwise('/login');
    
    $stateProvider
    
        .state('login', {
            url: '/login',
            templateUrl: 'app/views/login/base.html',
            abstract: true
        })
        
            .state('login.login', {
                url: '',
                templateUrl: 'app/views/login/login.html',
                controller: 'LoginController',
                data: { pageTitle: 'Login'}
            })
            
            .state('login.registration', {
                url: '/registration',
                templateUrl: 'app/views/login/registration.html',
                controller: 'RegistrationController',
                data: { pageTitle: 'Registration'}
            })
            
            .state('login.reset', {
                url: '/reset',
                templateUrl: 'app/views/login/reset_password.html',
                controller: 'ResetController',
                data: { pageTitle: 'Password Reset'}
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
            abstract: true
        })
        
            .state('schedule.schedule', {
                url: '',
                templateUrl: 'app/views/schedule/schedule.html',
                controller: 'ScheduleController',
                data: { pageTitle: 'Schedule'}
            })
        
            .state('schedule.finals', {
                url: '/finals',
                templateUrl: 'app/views/schedule/finals.html',
                controller: 'FinalScheduleController',
                data: { pageTitle: 'Finals'}
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

courseeater_app.controller('NavController',['$scope', '$timeout', '$state', 'AuthService', function ($scope, $timeout, $state, AuthService) {
    $scope.connected = navigator.onLine;
    $scope.authService = AuthService;
    $scope.state = $state;
    
    $scope.isPage = function (page) {
        return $scope.state.is(page);
    };
    
    $scope.checkConnection = function () {
        $scope.connected = navigator.onLine;
        $timeout($scope.checkConnection, 5000);    
    };
    
    $timeout($scope.checkConnection, 5000);
    
}]);

courseeater_app.directive('navigationView', function () {
    return {
        templateUrl: 'app/directives/navigation.html'
    }
});

courseeater_app.directive('connectionView', function () {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'app/directives/connection-view.html'
    }
});

courseeater_app.directive('userMenu', function () {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'app/directives/user-menu.html'
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