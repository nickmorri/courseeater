var courseeater_app = angular.module('CourseEaterApp', ['ui.router', 'courseeater.auth', 'courseeater.store', 'courseeater.track', 'courseeater.schedule', 'courseeater.search', 'courseeater.settings', 'courseeater.passwordreset']);

courseeater_app.config(['$locationProvider', '$stateProvider', '$urlRouterProvider', function($locationProvider, $stateProvider, $urlRouterProvider) {
    
    $locationProvider.html5Mode(true);
    
    $urlRouterProvider.otherwise('/track');
 
    $stateProvider
    
        .state('track', {
            url: '/track',
            templateUrl: 'app/views/track/base.html',
            controller: 'TrackController',
            data: { pageTitle: 'Track' }
        })
        
        .state('schedule', {
            url: '/schedule',
            templateUrl: 'app/views/schedule/schedule.html',
            controller: 'ScheduleController',
            data: { pageTitle: 'Schedule' }
        })
        
            .state('finals', {
                url: '/finals',
                templateUrl: 'app/views/schedule/finals.html',
                controller: 'FinalScheduleController',
                data: { pageTitle: 'Finals' }
            })
            
        .state('search', {
            url: '/search',
            templateUrl: 'app/views/search/base.html',
            controller: 'SearchController',
            data: { pageTitle: 'Search' }
        })
        
        .state('settings', {
            url: '/settings',
            templateUrl: 'app/views/settings/base.html',
            data: { pageTitle: 'Settings' }
        })

	.state('password_reset', {
	    url: '/apps/:applicationId/request_password_reset?token&username',
	    templateUrl: 'app/views/password_reset.html',
	    controller: 'PasswordResetController',
	    data: { pageTitle: 'Password reset' }
	});
}]);

courseeater_app.run(function ($window, $rootScope, $modal, AuthService, CourseListStore) {
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

    checkTransitioned();

    // When a user access db.courseeater.com as the backend for the first time we need to force them to login again so they can retrieve a valid session token.
    function checkTransitioned() {

	var modal_HTML = '' +
	    '<div class="modal-header">' +
	    '<h3 class="modal-title" id="modal-title">Sorry!</h3>' +
	    '</div>' +
	    '<div class="modal-body" id="modal-body">' +
	    '<p>We had to swap the batteries on CourseEater. Unfortuntely you\'ll have to sign in again.</p>' +
	    '</div>';

	var keys = [];
	for (var i = 0; i < localStorage.length; i++) { keys.push(localStorage.key(i)); }
	if (keys.some(function(key) { return key.indexOf("currentUser") > 0; }) && localStorage.getItem("transitioned") == null) {
	    localStorage.clear();
	    localStorage.setItem("transitioned", true);
	    AuthService.logout();
	    $modal.open({template: modal_HTML, size: 'lg'});
	}
    }
    
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
