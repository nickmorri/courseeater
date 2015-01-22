var alert = angular.module('courseeater.alert', []);

alert.factory('AlertStore',['AuthService', function (AuthService) {
    var AlertStore = {};
    
    AlertStore.messages = [];
    
    AlertStore.currentUser = AuthService.currentUser;
    
    AlertStore.hasMessages = function () {
        return AlertStore.messages.length !== 0;    
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
        var query = new Parse.Query('Alert');
        query.equalTo("user", AlertStore.currentUser);
        query.equalTo("read", false);
        query.find().then(function (messages) {
            for (var i = 0; i < messages.length; i++) {
                AlertStore.addMessage(messages[i].attributes.message, 'danger', messages[i].id);
            }
        });
    };
    
    AlertStore.retrieveAlerts();
    
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