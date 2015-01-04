var past = angular.module('down.events.past', ['down.events']);

going.controller('PastController', ['$scope', 'DownEventStore', 'FriendStore', 'AuthService', function ($scope, DownEventStore, FriendStore, AuthService) {
    $scope.friendStore = FriendStore;
    $scope.events = DownEventStore.past_events;
    
    $scope.authService = AuthService;
    
    $scope.hasEvents = function () {
        return $scope.events.length != 0;
    };
}]);