var invites = angular.module('down.friends.invites', ['down.friends']);

invites.controller('FriendInvitesController', ['$scope', 'FriendInviteStore', 'FriendStore', 'AuthService', function ($scope, FriendInviteStore, FriendStore, AuthService) {
    $scope.friendInviteStore = FriendInviteStore;
    $scope.friendStore = FriendStore;
    $scope.authService = AuthService;
    
    $scope.reretrieveFriendData = function () {
        $scope.friendInviteStore.retrieveFriendInvites();
        $scope.friendStore.retrieveFriends();
    };

    $scope.hasFriendInvites = function () {
        return $scope.friendInviteStore.hasFriendInvites();
    };
    
    $scope.acceptInvitation = function (invite) {
        invite.accept().then($scope.reretrieveFriendData);
    };
    
    $scope.declineInvitation = function (invite) {
        invite.decline().then($scope.reretrieveFriendData);
    };
}]);

invites.directive('friendInviteView', function () {
    return {
        templateUrl: 'app/components/friends/invites/directives/friend-invite-view.html'
    }
});