var alert = angular.module('courseeater.alert', []);

alert.run(['AlertStore', function (AlertStore) {
    AlertStore.retrieveAlerts();
}]);

alert.factory('AlertStore',['AuthService', function (AuthService) {
    var AlertStore = {};
    
    AlertStore.messages = [];
    
    AlertStore.currentUser = AuthService.currentUser;
    
    AlertStore.size = function () {
        return AlertStore.message.length;
    };
    
    AlertStore.hasMessages = function () {
        return AlertStore.size() !== 0;    
    };
    
    AlertStore.addMessage = function (message, type, id) {
        AlertStore.messages.push({
            type: type,
            message: message,
            id: id
        });
    };
    
    AlertStore.removeMessage = function (index) {
        var message = AlertStore.messages.splice(index, 1)[0];
        if (message.id !== undefined) {
            var query = new Parse.Query("Alert");
            query.get(message.id).then(function (alert) {
                alert.set("read", true);
                alert.save();
            });
        }
    };
    
    AlertStore.retrieveAlerts = function () {
        var query = new Parse.Query('Alert')
            .equalTo("user", AlertStore.currentUser)
            .equalTo("read", false)
            .find().then(function (messages) {
                messages.forEach(function (message) {
                    this.addMessage(message.attributes.message, 'danger', message.id);
                }, AlertStore);
            });
    };
    
    return AlertStore;
    
}]);

alert.controller('AlertController', ['$scope', 'AlertStore', function ($scope, AlertStore) {
    $scope.alertStore = AlertStore;
}]);

alert.directive('alertView', function () {
    return {
        templateUrl: 'app/components/alert/directives/alert-view.html'
    }
});