var courseeater_app = angular.module('CourseEaterApp', ['ui.router', 'courseeater.auth', 'courseeater.store', 'courseeater.track', 'courseeater.schedule', 'courseeater.search', 'courseeater.settings']);

courseeater_app.config(['$locationProvider', '$stateProvider', '$urlRouterProvider', function($locationProvider, $stateProvider, $urlRouterProvider) {
    
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
}]);

courseeater_app.run(function ($window, $rootScope) {
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
    
});

courseeater_app.controller('HeadController', ['$scope', '$state', function ($scope, $state) {
    $scope.state = $state;
}]);

courseeater_app.controller('NavController',['$scope', '$state', function ($scope, $timeout, $state) {
    $scope.state = $state;
    
    $scope.isPage = function (page) {
        return $scope.state.is(page);
    };
}]);

courseeater_app.directive('navigationView', function () {
    return {
        templateUrl: 'app/directives/navigation.html'
    }
});

courseeater_app.directive('title', ['$rootScope', function($rootScope) {
    return {
        link: function() {
            $rootScope.$on('$stateChangeSuccess', function(event, toState) {
                $rootScope.title = (toState.data && toState.data.pageTitle) ? toState.data.pageTitle : 'Default title';
            });
        }
    };
}]);