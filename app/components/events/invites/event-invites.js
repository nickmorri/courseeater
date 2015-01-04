var invites = angular.module('down.events.invites', ['down.events']);

invites.controller('InviteController', ['$scope', 'DownEventInviteStore', 'DownEventStore', 'FriendStore', 'AuthService', function ($scope, DownEventInviteStore, DownEventStore, FriendStore, AuthService) {
    $scope.friendStore = FriendStore;
    $scope.downEventInviteStore = DownEventInviteStore;
    $scope.downEventStore = DownEventStore;
    
    $scope.authService = AuthService;
    
    $scope.reretrieveEventData = function () {
        $scope.downEventInviteStore.retrieveEventInvites();
        $scope.downEventStore.retrieveEvents();
    };
    
    $scope.hasInvites = function () {
        return $scope.downEventInviteStore.invites.length != 0;
    };
    
    $scope.acceptInvitation = function (invite) {
        invite.accept().then($scope.reretrieveEventData);
    };
    
    $scope.declineInvitation = function (invite) {
        invite.decline().then($scope.reretrieveEventData);
    };
    
}]);

invites.directive('eventInviteView', function () {
    return {
        templateUrl: 'app/components/events/invites/directives/event-invite-view.html'
    }
});