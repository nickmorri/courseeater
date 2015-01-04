var events = angular.module('down.events', ['parse-angular', 'down.auth', 'down.friends', 'ngMap', 'down.events.going', 'down.events.past', 'down.events.invites']);

events.factory('DownEvent', ['FriendStore', function (FriendStore) {
    var DownEvent = function (data) {
        this.id = data.id;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
        this.title = data.attributes.title;
        this.creator = data.attributes.creator;
        this.declined = data.attributes.declined;
        this.going = data.attributes.going;
        this.note = data.attributes.note;
        this.startDate = moment(data.attributes.startDate.valueOf());
        this.where = data.attributes.where;
        
        this.goingUsers = [];
        this.invitedUsers = [];
        
        this.hasLocation = false;
        
        this.daysUntilEvent = function () {
            return this.startDate.fromNow();
        };
        
        this.eventPast = function () {
            return this.startDate.isAfter();
        };
        
        this.fetchGoingUsers = function ()  {
            var going = this.goingUsers;
            Parse.Cloud.run("getGoingUsers", {eventID : this.id}).then(function (users) {
                for (var i = 0; i < users.length; i++) {
                    var user = FriendStore.getFriend(users[i]);
                    if (user === undefined) {
                        // TODO: Deal with non friends
                        continue;
                        // user = users[i];
                    }
                    going.push(user);
                }
            });
        };
        
        this.fetchInvitedUsers = function ()  {
            var invited = this.invitedUsers;
            Parse.Cloud.run("getInvitedUsers", {eventID : this.id}).then(function (users) {
                for (var i = 0; i < users.length; i++) {
                    var user = FriendStore.getFriend(users[i]);
                    if (user === undefined) {
                        // TODO: Deal with non friends
                        continue;
                        // user = users[i];
                    }
                    invited.push(user);
                }
            });  
        };
        
        this.buildMap = function () {
            if (this.where === undefined) return;
            
            this.hasLocation = true;
            
            this.map = {
                center: {
                    latitude: undefined,
                    longitude: undefined
                }
            };
            
            var map = this.map;
            
            this.where.fetch().then(function (result) {
                if (result.attributes.geoPoint !== undefined) {
                    map.center.latitude = result.attributes.geoPoint.latitude;
                    map.center.longitude = result.attributes.geoPoint.longitude;
                }
            });
        };
        
        this.leave = function () {
            return Parse.Cloud.run('leaveEvent', {eventID: this.id});
        };
        
        this.edit = function () {
            debugger;
        };

        this.fetchGoingUsers();
        this.fetchInvitedUsers();
        this.buildMap();
        
    };
    
    return DownEvent;
}]);

events.factory('DownEventStore', ['DownEvent', 'AuthService', function (DownEvent, AuthService) {
    var DownEventStore = {};
    
    DownEventStore.authService = AuthService;
    DownEventStore.future_events = [];
    DownEventStore.past_events = [];
    
    DownEventStore.retrieveEvents = function () {
        
        // Clearing data incase of reretrieval of event data
        DownEventStore.future_events = [];
        DownEventStore.past_events = [];
        var query = DownEventStore.authService.currentUser.relation("going").query();
        
        // May want to change ordering to AngularJS control in future.
        query.descending("startDate");
        query.find().then(function (events) {
            for (var i = 0; i < events.length; i++) {
                var downEvent = new DownEvent(events[i]);
                if (!downEvent.eventPast()) {
                    DownEventStore.past_events.push(downEvent);
                }
                else {
                    DownEventStore.future_events.push(downEvent);
                }
            }
        });
    };
    
    DownEventStore.retrieveEvents();
    
    return DownEventStore;
}]);

events.factory('DownEventInvite', ['DownEvent', function (DownEvent) {
    var DownEventInvite = function (data) {
        this.id = data.id;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
        this.event = data.attributes.event;
        this.fromUser = data.attributes.fromUser;
        this.fromUsername = data.attributes.fromUsername;
        
        this.fetchEvent = function () {
            if (typeof this.event == 'DownEvent') return;
            
            var invite = this;
            this.event.fetch().then(function (result) {
                invite.event = new DownEvent(result);
            });
        };
        
        this.accept = function () {
            return Parse.Cloud.run('acceptEventInvitation', {eventInvitationID: this.id});
        };
        
        this.decline = function () {
            return Parse.Cloud.run('declineEventInvitation', {eventInvitationID: this.id});
        };

        this.fetchEvent();
        
    };
    
    return DownEventInvite;
}]);

events.factory('DownEventInviteStore', ['DownEventInvite', 'AuthService', function (DownEventInvite, AuthService) {
    var DownEventInviteStore = {};
    
    DownEventInviteStore.authService = AuthService;
    DownEventInviteStore.invites = [];
    
    DownEventInviteStore.retrieveEventInvites = function () {
        // Clearing data incase of reretrieval of event data
        DownEventInviteStore.invites = [];
        inviteQuery = new Parse.Query("EventInvitation");
        today = new Date();
        today.setDate(today.getDate() - 1);
        // Only retrieving invitations that have not passed
        inviteQuery.greaterThanOrEqualTo("startDate", today);
        inviteQuery.ascending("startDate");
        inviteQuery.equalTo("toUser", Parse.User.current());
    
        return inviteQuery.find().then(function (invites) {
            for (var i = 0; i < invites.length; i++) {
                DownEventInviteStore.invites.push(new DownEventInvite(invites[i]));
            }
        });
    };
    
    DownEventInviteStore.hasInvites = function () {
        return this.invites.length != 0;
    };
    
    DownEventInviteStore.count = function () {
        return this.invites.length;
    };
    
    DownEventInviteStore.retrieveEventInvites();
    
    return DownEventInviteStore;
}]);

events.controller('EventController', ['$scope', 'AuthService', 'DownEventStore', 'DownEventInviteStore', 'FriendStore', function ($scope, AuthService, DownEventStore, DownEventInviteStore, FriendStore) {
    $scope.friendStore = FriendStore;
    $scope.eventStore = DownEventStore;
    $scope.eventInviteStore = DownEventInviteStore;
    $scope.authService = AuthService;
}]);

events.directive('goingView', function () {
    return {
        scope: {
            event: '=info'
        },
        templateUrl: 'app/components/events/directives/going-view.html'
    }
});

events.directive('invitedView', function () {
    return {
        scope: {
            event: '=info'
        },
        templateUrl: 'app/components/events/directives/invited-view.html'
    }
});

events.directive('mapView', function () {
    return {
        scope: {
            event: '=info'
        },
        templateUrl: 'app/components/events/directives/map-view.html'
    }
});