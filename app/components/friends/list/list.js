var list = angular.module('down.friends.list', ['down.friends']);

list.controller('FriendListController', ['$scope', '$http', 'FriendStore', 'GroupStore', 'FriendInviteStore', 'AuthService', function ($scope, $http, FriendStore, GroupStore, FriendInviteStore, AuthService) {
    $scope.friendStore = FriendStore;
    $scope.friendInviteStore = FriendInviteStore;
    $scope.groupStore = GroupStore;
    $scope.authService = AuthService;
    
    $scope.showingAddFriendDialog = false;
    $scope.selectedUser = undefined;
    
    $scope.hasFriends = function () {
        return $scope.friendStore.hasFriends();
    };
    
    $scope.showAddFriendDialog = function () {
        $scope.selectedFriend = undefined;
        $scope.showingAddFriendDialog = true;
    };
    
    $scope.hideAddFriendDialog = function () {
        $scope.selectedFriend = undefined;
        $scope.showingAddFriendDialog = false;
    };
    
    $scope.addFriendToGroup = function (friend, group) {
        group.addFriend(friend.id, friend.username).then($scope.groupStore.retrieveGroups);
    };
    
    $scope.unfriend = function (friend) {
        friend.unfriend().then($scope.friendStore.retrieveFriends);
    };
    
    $scope.getFriends = function(val) {
        var firstNameQuery = new Parse.Query(Parse.User);
        firstNameQuery.startsWith('firstName', val);
        var lastNameQuery = new Parse.Query(Parse.User);
        lastNameQuery.startsWith('lastName', val);
        var nameQuery = Parse.Query.or(firstNameQuery, lastNameQuery);
        
        var emailQuery = new Parse.Query(Parse.User);
        var usernameQuery = new Parse.Query(Parse.User);
        emailQuery.startsWith('email', val);
        usernameQuery.startsWith('username', val);
        var userDetailsQuery = Parse.Query.or(emailQuery, usernameQuery);
        
        var combinedQuery = Parse.Query.or(nameQuery, userDetailsQuery);
        return combinedQuery.find().then(function(response) {
            return response.map(function (item) {
                return item.attributes.firstName + " " + item.attributes.lastName + " (" + item.attributes.username + ")"
            });
        });
    };
    
    $scope.sendFriendInvite = function () {
        var username = $scope.selectedUser.split("(")[1].split(")")[0];
        Parse.Cloud.run("addFriend", {friendUsername : username}).then(function () {
            $scope.showingAddFriendDialog = false;   
        });
    };
    
}]);

list.filter('eligibleGroup', function () {
    return function (input, friend) {
        var eligibleGroups = [];    
        for (i in input) {
            if (!input[i].isMember(friend.id)) {
                eligibleGroups.push(input[i]);
            }
        }
        return eligibleGroups;
    };
});
