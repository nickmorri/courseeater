function AppConfig($locationProvider, $stateProvider, $urlRouterProvider) {
    
    $locationProvider.html5Mode(true);
    
    $urlRouterProvider.otherwise('/track');
    
    $stateProvider
    	.state('track', {
            url: '/track',
            templateUrl: 'app/views/track/base.html',
            controller: 'TrackController',
            data: { pageTitle: 'Track'}
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
        });        
}

function AppRun($window, $rootScope) {
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

function HeadController($scope, $state) {
    $scope.state = $state;
}

function NavController($scope, $timeout, $state) {
    $scope.state = $state;
    
    $scope.isPage = function (page) {
        return $scope.state.is(page);
    };
}

function navigationViewDirective() {
    return {
        templateUrl: 'app/directives/navigation.html'
    }
}

function titleDirective($rootScope) {
    return {
        link: function() {
            $rootScope.$on('$stateChangeSuccess', function(event, toState) {
                $rootScope.title = (toState.data && toState.data.pageTitle) ? toState.data.pageTitle : 'Default title';
            });
        }
    };
}

angular.module('CourseEaterApp', ['ui.router', 'courseeater.auth', 'courseeater.store', 'courseeater.track', 'courseeater.schedule', 'courseeater.search', 'courseeater.settings'])
	.config(['$locationProvider', '$stateProvider', '$urlRouterProvider', AppConfig])
	.run(AppRun)
	.controller('HeadController', ['$scope', '$state', HeadController])
	.controller('NavController',['$scope', '$state', NavController])
	.directive('navigationView', navigationView)
	.directive('title', ['$rootScope', titleDirective]);