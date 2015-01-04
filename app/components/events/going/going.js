var going = angular.module('down.events.going', ['ui.bootstrap', 'timepickerPop' , 'down.events']);

going.controller('GoingController', ['$scope', 'DownEventStore', 'FriendStore', 'GroupStore', 'AuthService', '$modal', function ($scope, DownEventStore, FriendStore, GroupStore, AuthService, $modal) {
    $scope.friendStore = FriendStore;
    $scope.groupStore = GroupStore;
    $scope.downEventStore = DownEventStore;
    
    $scope.authService = AuthService;
    
    $scope.hasEvents = function () {
        return $scope.downEventStore.future_events.length != 0;
    };
    
    $scope.leaveEvent = function (event) {
        event.leave().then($scope.downEventStore.retrieveEvents);
    };
    
    $scope.openInviteModal = function (DownEvent) {
        var modalInstance = $modal.open({
            templateUrl: 'app/components/events/going/directives/invite-modal.html',
            controller: 'InviteModalController',
            resolve: {
                targetEvent: function () {
                    return DownEvent;
                }
            }
        });
    };
    
    $scope.newEventModal = function () {
        var modalInstance = $modal.open({
            templateUrl: 'app/components/events/going/directives/new-event-modal.html',
            controller: 'NewEventModalController'
        });
    }
}]);

going.controller('InviteModalController', ['$scope', '$modalInstance', 'AuthService', 'FriendStore', 'GroupStore', 'targetEvent', function ($scope, $modalInstance, AuthService, FriendStore, GroupStore, targetEvent) {
    $scope.targetEvent = targetEvent;
    $scope.friendStore = FriendStore;
    $scope.groupStore = GroupStore;
    
    $scope.friends = $scope.friendStore.getFriends();
    $scope.groups = $scope.groupStore.getGroups();
    
    $scope.invitedFriends = {};
    $scope.invitedGroups = {};
    
    $scope.isFriendInvited = function (friendId) {
        if ($scope.invitedFriends[friendId]) return true;
        else return false;
    };
    
    $scope.isGroupInvited = function (groupIndex) {
        if ($scope.invitedGroups[groupIndex]) return true;
        else return false;
    };
    
    $scope.areGroupMembersInvited = function (groupName) {
        var group = $scope.groups[groupName];
        var groupMembers = group.friends;
        for (var i = 0; i <groupMembers.length; i++) {
            if (!$scope.isFriendInvited(groupMembers[i])) return false;
        }
        return true;
    };
    
    $scope.checkFriendGroupInvited = function (friendId) {
        var groups = $scope.groups;
        for (var group in groups) {
            if ($scope.areGroupMembersInvited(groups[group].groupName)) {
                $scope.addGroup(groups[group], false);
            } else {
                $scope.removeGroup(groups[group], false);
            }
        }
    };
    
    $scope.addFriend = function (friendId) {
        $scope.invitedFriends[friendId] = $scope.friends[friendId];
        $scope.checkFriendGroupInvited(friendId);
    };
    
    $scope.removeFriend = function (friendId) {
        delete $scope.invitedFriends[friendId];
        $scope.checkFriendGroupInvited(friendId);
    };
    
    $scope.toggleFriend = function (friendId) {
        if ($scope.isFriendInvited(friendId)) $scope.removeFriend(friendId);
        else $scope.addFriend(friendId);
    };
    
    $scope.addGroup = function (group, addMembers) {
        $scope.invitedGroups[group.groupIndex] = group;
        if (addMembers) {
            for (var i = 0; i < group.friends.length; i++) {
                if (!$scope.isFriendInvited(group.friends[i])) $scope.addFriend(group.friends[i]);
            }    
        }
    };
    
    $scope.removeGroup = function (group, removeMembers) {
        delete $scope.invitedGroups[group.groupIndex];
        if (removeMembers) {
            for (var i = 0; i < group.friends.length; i++) {
                if ($scope.isFriendInvited(group.friends[i])) $scope.removeFriend(group.friends[i])
            }    
        }
    };
    
    $scope.toggleGroup = function (group) {
        if ($scope.isGroupInvited([group.groupIndex])) $scope.removeGroup(group, true)
        else $scope.addGroup(group, true);
    };
    
    $scope.countInvitees = function () {
        return Object.keys($scope.invitedFriends).length;
    };
    
    $scope.sendInvites = function () {
        
        // Needs some cleaning
        
        if (targetEvent.newEvent) {
            
            Parse.Cloud.run('createEvent', {
                eventTitle: targetEvent.title,
                eventNote: targetEvent.note,
                eventDate: targetEvent.startDate,
                geoPoint: targetEvent.geoPoint,
                formattedAddress: targetEvent.formattedAddress,
                friendlyLocationName: targetEvent.friendlyLocationName,
                invitedUsers: Object.keys($scope.invitedFriends)
            }).then(function (response) {
                Parse.Cloud.run('sendInvitations', {friends: Object.keys($scope.invitedFriends), eventID: response}).then($scope.$close);
            });
        } else {
            Parse.Cloud.run('sendInvitations', {friends: Object.keys($scope.invitedFriends), eventID: $scope.targetEvent.id}).then($scope.$close);
        }
    };
}]);

going.controller('NewEventModalController', ['$scope', '$modalInstance', 'AuthService', 'FriendStore', 'GroupStore', '$modal', '$http', function ($scope, $modalInstance, AuthService, FriendStore, GroupStore, $modal, $http) {
    $scope.friendStore = FriendStore;
    $scope.groupStore = GroupStore;
    
    $scope.eventTitle = "";
    $scope.eventLocation = undefined;
    $scope.eventNote = "";
    $scope.eventDate = undefined;
    $scope.eventTime = undefined;
    
    $scope.friends = $scope.friendStore.getFriends();
    $scope.groups = $scope.groupStore.getGroups();
    
    // Datepicker
    
    $scope.options = {'show-weeks': false};
    
    $scope.clear = function () {
        $scope.eventDate = null;
    };
    
    $scope.minDate = new Date();
    $scope.maxDate = moment().add(2, 'days');
    
    $scope.open = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.opened = true;
    };
    
    $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1
    };
    
    // Timepicker
    
    $scope.updateTime = function(preset) {
        var hours = preset.split(":")[0];
        var minutes = preset.split(":")[1];
        var d = new Date();
        d.setHours(hours);
        d.setMinutes(minutes);
        $scope.eventTime = d;
    };
    
    // Location
    
    $scope.getLocation = function (val) {
        return $http.get('https://maps.googleapis.com/maps/api/geocode/json', {
            params: {
                address: val,
                sensor: false
            }
        }).then(function (response) {
            return response.data.results.map(function (item) {
                return item.formatted_address;
            });
        });
    };
        
    $scope.createEvent = function () {
        
        var geoPoint = undefined;
        var formattedAddress = undefined;
        
        var startDate = $scope.eventDate;
        startDate.setHours($scope.eventTime.getHours());
        startDate.setMinutes($scope.eventTime.getMinutes());
        
        if ($scope.eventLocation !== undefined) {
            var geoPoint = new Parse.GeoPoint({
                latitude: $scope.eventLocation.geometry.location.lat(),
                longitude: $scope.eventLocation.geometry.location.lng(),
            });    
        }

        var newEvent = {
            title: $scope.eventTitle,
            note: $scope.eventNote,
            startDate: startDate,
            geoPoint: geoPoint,
            formattedAddress: formattedAddress,
            friendlyLocationName: formattedAddress,
            newEvent: true
        };
        
        var modalInstance = $modal.open({
            templateUrl: 'app/components/events/going/directives/invite-modal.html',
            controller: 'InviteModalController',
            resolve: {
                targetEvent: function () {
                    return newEvent;
                }
            }
        });
        
        $scope.$close();
    };
    
    
}]);

going.directive('eventView', function () {
    return {
        templateUrl: 'app/components/events/going/directives/event-view.html'
    }
});

going.directive('googleplace', function() {
    return {
        require: 'ngModel',
        link: function (scope, element, attrs, model) {
            var options = {
                types: [],
                componentRestrictions: {}
            };
            scope.gPlace = new google.maps.places.Autocomplete(element[0], options);
 
            google.maps.event.addListener(scope.gPlace, 'place_changed', function () {
                scope.eventLocation = this.getPlace();
                scope.$apply(function () {
                    model.$setViewValue(element.val());                
                });
            });
        }
    };
});