var friends = angular.module('courseeater.friends', ['courseeater.auth']);

friends.run(['FriendStore', '$rootScope', function (FriendStore, $rootScope) {
    $rootScope.friendStore = FriendStore;
}]);

friends.factory('Friend', function () {
    return function (attributes) {
        this.username = attributes.username;
        this.courselist = undefined;
        this.objectId = attributes.objectId;
        this.courseList = undefined;
        
        this.retrieveCurrentList = function () {
            var friend = this;
            var query = new Parse.Query("CourseList");
            query.equalTo("owner", this.objectId);
            query.equalTo("active", true);
            return query.find().then(function (list) {
                friend.courseList = list
            });
        };
    };
});

friends.factory('FriendStore', ['AuthService', 'Friend', function (AuthService, Friend) {
    var FriendStore = {};
    
    FriendStore._collection = {};
    FriendStore._requests = {};
    FriendStore.authService = AuthService;
    
    FriendStore.retrieveFollowRequests = function () {
        var query = new Parse.Query("Follow");
        query.equalTo("followee", FriendStore.authService.currentUser);
        query.equalTo("accepted", false);
        query.equalTo("denied", false);
        /*
query.find().then(function (requests) {

        });
*/
    };
    
    FriendStore.retrieveFriends = function () {
        var query = new Parse.Query("Follow");
        query.equalTo("from", FriendStore.authService.currentUser);
        query.find().then(function (friends) {
            for (var i = 0; i < friends.size; i++) {
                FriendStore._collection[friends[i].id] = new Friend(friends[i].attributes);
            }
        });
    };
    
    FriendStore.getFriendsIDs = function () {
        return Object.keys(FriendStore._collection);
    };
    
    FriendStore.addFriend = function (username) {
        var query = new Parse.Query(Parse.User);
        query.equalTo("username", username);
        return query.first().then(function (user) {
            var follow = new Parse.Object("Follow");
            follow.set("accepted", false);
            follow.set("denied", false);
            follow.set("follower", FriendStore.authService.currentUser);
            follow.set("followee", user);
            return follow.save();
        });
    };
    
    FriendStore.removeFriend = function (objectId) {
        var query = new Parse.Query("Follow");
        query.equalTo("follower", FriendStore.authService.currentUser);
        query.equalTo("followee", objectId);
        return query.first().then(function (friend) {
            return friend.destroy();
        });
    };
    
    FriendStore.getUsers = function (value) {
        var usernameQuery = new Parse.Query(Parse.User);
        usernameQuery.startsWith('username', value);
        usernameQuery.notContainedIn("objectId", FriendStore.getFriendsIDs());
        
        return usernameQuery.find().then(function(response) {
            return response.map(function (item) {
                return item.attributes.username;    
            });
        });
    };
    
    FriendStore.retrieveFriends();
    FriendStore.retrieveFollowRequests();
    
    return FriendStore;
    
}]);

friends.controller('FriendCtrl', ['$scope', 'FriendStore', function ($scope, FriendStore) {
    $scope.friendStore = FriendStore;
    
    $scope.asyncSelected = undefined;
}]);

friends.directive("FriendListMenu", function () {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: "app/directives/friend-list-menu.html"
    }
});