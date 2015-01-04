var groups = angular.module('down.friends.groups', ['down.friends']);

groups.controller('FriendGroupsController', ['$scope', 'FriendStore', 'GroupStore', 'AuthService', function ($scope, FriendStore, GroupStore, AuthService) {
    $scope.groupStore = GroupStore;
    $scope.friendStore = FriendStore;
    $scope.authService = AuthService;
    
    $scope.composingNewGroup = false;
    $scope.newGroupName = "";
    $scope.newGroupMemberIDs = [];
    
    $scope.composeNewGroup = function () {
        $scope.composingNewGroup = true;
        $scope.newGroupName = "";
        $scope.newGroupMemberIDs = [];
        $scope.composingNewGroup = true;
    };
    
    $scope.discardNewGroup = function () {
        $scope.composingNewGroup = true;
        $scope.newGroupName = "";
        $scope.newGroupMemberIDs = [];
        $scope.composingNewGroup = false;
    };
    
    $scope.addFriendToNewGroup = function (friend) {
        $scope.newGroupMemberIDs.push(friend.id);
    };
    
    $scope.removeFriendFromNewGroup = function (id) {
        $scope.newGroupMemberIDs.splice($scope.newGroupMemberIDs.indexOf(id), 1);
    };
    
    $scope.createNewGroup = function () {
        
        var newGroupMemberNames = [];
        for (var i = 0; i < $scope.newGroupMemberIDs.length; i++) {
            newGroupMemberNames.push($scope.friendStore.getFriend($scope.newGroupMemberIDs[i]).getName());
        }
        
        Parse.Cloud.run('createGroup', {
            groupName: $scope.newGroupName,
            friendIDs: $scope.newGroupMemberIDs,
            friendNames: newGroupMemberNames
        }).then(function () {
            $scope.composingNewGroup = false;
            $scope.groupStore.retrieveGroups();
        });
    };
    
    $scope.removeFriendFromGroup = function (friend, group) {
        friend = $scope.friendStore.getFriend(friend);
        group.removeFriend(friend.id, friend.username);
    };
    
    $scope.addFriendToGroup = function (friend, group) {
        group.addFriend(friend.id, friend.username);
    };
    
    $scope.deleteGroup = function (group) {
        group.deleteGroup().then($scope.groupStore.retrieveGroups);
        
    };
    
    $scope.toggleEditing = function (group) {
        if (!group.toggleEditing()) $scope.groupStore.retrieveGroups();
    };
    
    $scope.hasGroups = function () {
        return $scope.groupStore.hasGroups();
    };
}]);

groups.filter('nonMember', function () {
    return function (input, group) {
        var nonMembers = [];    
        for (i in input) {
            if (!group.isMember(input[i].id)) {
                nonMembers.push(input[i]);
            }
        }
        return nonMembers;
    };
});

groups.filter('nonNewMember', function () {
    return function (input, newGroupMemberIDs) {
        var nonMembers = [];
        for (i in input) {
            if (newGroupMemberIDs.indexOf(input[i].id) === -1) {
                nonMembers.push(input[i]);
            }    
        }
        return nonMembers;
    }
});

groups.directive('groupView', function () {
    return {
        templateUrl: 'app/components/friends/groups/directives/group-view.html'
    }
});