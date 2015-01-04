var friends = angular.module('down.friends', ['parse-angular', 'down.auth', 'down.friends.invites', 'down.friends.groups', 'down.friends.list']);

friends.factory('Friend', function () {
    var Friend = function (data) {
        this.id = data.id;
        this.firstName = data.attributes.firstName;
        this.lastName = data.attributes.lastName;
        this.email = data.attributes.email;
        this.username = data.attributes.username
        this.profilePictureURL = data.attributes.profilePicture.url();
        this.profileThumbnailURL = data.attributes.profileThumbnail.url();
        this.friends = data.attributes.friends;
        
        this.numberEventsAttendedTogether = 0;
        this.mutualFriends = [];
        
        this.getName = function () {
            return this.firstName + " " + this.lastName;
        };
        
        this.getUsername = function () {
            return this.username
        };
        
        this.getNumberEventsAttendedTogether = function () {
            var friend = this;
            Parse.Cloud.run('getNumberEventsAttendedTogether', {otherUsername: this.username}).then(function (response) {
                friend.numberEventsAttendedTogether = parseInt(response);
            });
        };
        
        this.getMutualFriends = function () {
            var friend = this;
            Parse.Cloud.run('getMutualFriends', {otherUsername: this.username}).then(function (response) {
                for (var i = 0; i < response.length; i++) {
                    friend.mutualFriends.push(response[i]);
                }
            });
        };
        
        this.unfriend = function () {
            return Parse.Cloud.run('removeFriend', { friendUsername: this.username });
        };
        
        this.getMutualFriends();
        this.getNumberEventsAttendedTogether();
    };
    
    return Friend;
});

friends.factory('FriendStore', ['Friend', 'AuthService', function (Friend, AuthService) {
    var FriendStore = {};
    
    FriendStore.currentUser = AuthService.currentUser;
    FriendStore._collection = {};

    FriendStore.retrieveFriends = function () {
        
        // Clear incase a retrieval after accept or decline of invite
        FriendStore._collection = {};
        
        var collection = FriendStore._collection;
        
        var friends = FriendStore.currentUser.relation("friends");
        var query = friends.query();
        query.find().then(function (result) {
            for (var i = 0; i < result.length; i++) {
                collection[result[i].id] = new Friend(result[i]);
            }
        });
    };
    
    FriendStore.isFriend = function (userId) {
        return FriendStore.getFriend(userId) === undefined;
    }
    
    FriendStore.getFriends = function () {
        return this._collection;
    };
    
    FriendStore.getFriend = function (userId) {
        return this._collection[userId];
    };
    
    FriendStore.hasFriends = function () {
        return Object.keys(this._collection).length != 0;
    };
    
    FriendStore.retrieveFriends();
    
    return FriendStore;
}]);

friends.factory('Group', function () {
    var Group = function (data, friendStore) {
        this.groupIndex = data.groupIndex;
        this.groupName = data.groupName;
        this.friends = [];
        
        this._editing = false;
        
        for (var friend in data.friendObjectIDList) {
            this.friends.push(friend);
        }
        
        this.isEditing = function () {
            return this._editing;
        };
        
        this.toggleEditing = function () {
            return this._editing = !this._editing;
        };
        
        this.isMember = function (friendId) {
            return this.friends.indexOf(friendId) != -1;
        };
        
        this.removeFriend = function (friendId, friendUsername) {
            this.friends.splice(this.friends.indexOf(friendId), 1);
            Parse.Cloud.run('editGroup', {
                groupIndex: this.groupIndex,
                groupName: this.groupName,
                friendsToAdd: [],
                friendsToRemove: [[friendId, friendUsername]]
            });
        };
        
        this.addFriend = function (friendId, friendUsername) {
            return Parse.Cloud.run('editGroup', {
                groupIndex: this.groupIndex,
                groupName: this.groupName,
                friendsToAdd: [[friendId, friendUsername]],
                friendsToRemove: []
            });
            this.friends.push(friendId);
        };
        
        this.deleteGroup = function () {
            return Parse.Cloud.run('removeGroup', {groupIndex: this.groupIndex});
        };
    };
    
    return Group;
});

friends.factory('GroupStore', ['FriendStore', 'AuthService', 'Group', function (FriendStore, AuthService, Group) {
    var GroupStore = {};
    
    GroupStore.currentUser = AuthService.currentUser;
    GroupStore.friendStore = FriendStore;
    GroupStore._collection = {};
    
    GroupStore.retrieveGroups = function () {
        AuthService.refetchCurrentUser().then(function () {
            var groups = AuthService.currentUser.attributes.groups;
            GroupStore._collection = {};
            for (var i = 0; i < groups.length; i++) {
                GroupStore._collection[groups[i].groupName] = new Group(groups[i], this.friendStore);
            } 
        });
    };
    
    GroupStore.getGroups = function () {
        return this._collection;
    };
    
    GroupStore.getGroup = function () {};
    
    GroupStore.hasGroups = function () {
        return Object.keys(this._collection).length != 0;
    };
    
    GroupStore.getFriendsGroups = function (friend) {
        var friendsGroups = [];
        
        for (groupIndex in this._collection) {
            var group = this._collection[groupIndex];
            if (group.isMember(friend.id)) friendsGroups.push(group);
        }
        
        return friendsGroups;
    };
    
    GroupStore.friendBelongsToGroups = function (friend) {
        return this.getFriendsGroups(friend).length !== 0;
    };
    
    GroupStore.retrieveGroups();
    
    return GroupStore;
}]);

friends.factory('FriendInvite', ['Friend', function (Friend) {
    var FriendInvite = function (data) {
        this.from = data.attributes.from;
        this.fromUsername = data.attributes.fromUsername;
        this.createdAt = moment(data.createdAt.valueOf());
        this.potentialFriend = undefined;
        
        this.mutualFriends = [];
        
        this.fetchUserdata = function () {
            var invite = this;
            this.from.fetch().then(function (userdata) {
                invite.potentialFriend = new Friend(userdata);
            });
        };
                
        this.fetchUserdata();
        
        this.accept = function () {
            return Parse.Cloud.run('acceptFriendRequest', {friendUsername: this.potentialFriend.username});
        };
        
        this.decline = function () {
            return Parse.Cloud.run('declineFriendRequest', {friendUsername: this.potentialFriend.username});
        };
        
    };
    
    return FriendInvite;
}]);

friends.factory('FriendInviteStore', ['FriendInvite', 'AuthService', function (FriendInvite, AuthService) {
    var FriendInviteStore = {};
    
    FriendInviteStore.currentUser = AuthService.currentUser;
    FriendInviteStore._collection = {};

    FriendInviteStore.retrieveFriendInvites = function () {
        // Clear incase a retrieval after accept or decline of invite
        FriendInviteStore._collection = {};
        
        var collection = FriendInviteStore._collection;
        
        query = new Parse.Query("FriendRequest");
        
        query.equalTo("to", FriendInviteStore.currentUser);
        query.find().then(function (requests) {
            for (var i = 0; i < requests.length; i++) {
                collection[requests[i].id] = new FriendInvite(requests[i]);
            }
    	});
    };
    
    FriendInviteStore.hasFriendInvites = function () {
        return Object.keys(this._collection).length != 0;
    };
    
    FriendInviteStore.count = function () {
        return Object.keys(this._collection).length;
    };
    
    FriendInviteStore.retrieveFriendInvites();
    
    return FriendInviteStore;
}]);

friends.directive('miniFriendView', function () {
    return {
        scope: {
            friend: '=info'
        },
        templateUrl: 'app/components/friends/directives/mini-friend-view.html'
    }
});

friends.directive('friendView', function () {
    return {
        templateUrl: 'app/components/friends/directives/friend-view.html'
    }
});