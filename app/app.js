var down_app = angular.module('DownApp', ['ui.router', 'down.events', 'down.friends', 'down.settings']);

down_app.config(function($stateProvider, $urlRouterProvider) {
    
    $urlRouterProvider.otherwise('/login');
    
    $stateProvider
    
        .state('login', {
            url: '/login',
            templateUrl: 'app/views/login/login.html',
            controller: 'LoginController',
            data: { pageTitle: 'Login'}
            
        })
    
        .state('events', {
            url: '/events',
            templateUrl: 'app/views/events/base.html',
            controller: 'EventController'
        })
            .state('events.going', {
                url: '/going',
                templateUrl: 'app/views/events/going.html',
                controller: 'GoingController',
                data: { pageTitle: 'Going' }
            })
            .state('events.invites', {
                url: '/invites',
                templateUrl: 'app/views/events/invites.html',
                controller: 'InviteController',
                data: { pageTitle: 'Event Invites' }
            })
            .state('events.past', {
                url: '/past',
                templateUrl: 'app/views/events/past.html',
                controller: 'PastController',
                data: { pageTitle: 'Past Events' }
            })
            
        .state('friends', {
            url: '/friends',
            templateUrl: 'app/views/friends/base.html',
            controller: 'FriendListController'
        })
            .state('friends.list', {
                url: '/list',
                templateUrl: 'app/views/friends/list.html',
                controller: 'FriendListController',
                data: { pageTitle: 'Friends' }
            })
            .state('friends.invites', {
                url: '/invites',
                templateUrl: 'app/views/friends/invites.html',
                controller: 'FriendInvitesController',
                data: { pageTitle: 'Friend Invites' }
            })
            .state('friends.groups', {
                url: '/groups',
                templateUrl: 'app/views/friends/groups.html',
                controller: 'FriendGroupsController',
                data: { pageTitle: 'Groups' }
            })
        
        .state('settings', {
            url: '/settings',
            templateUrl: 'app/views/settings/base.html',
            controller: 'SettingsController',
            data: { pageTitle: 'Settings' }
        })
            .state('settings.profile', {
                url: '/profile',
                templateUrl: 'app/views/settings/profile.html',
                controller: 'ProfileController',
                data: { pageTitle: 'Profile' }
            })
            .state('settings.account', {
                url: '/settings',
                templateUrl: 'app/views/settings/account.html',
                controller: 'AccountController',
                data: { pageTitle: 'Account' }
            })
});

down_app.directive('navigationView', function () {
    return {
        templateUrl: 'app/directives/navigation.html'
    }
});

down_app.directive('title', ['$rootScope', '$timeout', function($rootScope, $timeout) {
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

down_app.directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.ngEnter);
                });

                event.preventDefault();
            }
        });
    };
});