var courseeater_app = angular.module('CourseEaterApp', ['ui.router', 'parse.service', 'courseeater.track', 'courseeater.schedule', 'courseeater.search', 'courseeater.settings']);

courseeater_app.config(['$locationProvider', '$urlRouterProvider', function($locationProvider, $urlRouterProvider) {
    
//     $locationProvider.html5Mode(true);
    
    $urlRouterProvider.otherwise('/track');
    
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
    };
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