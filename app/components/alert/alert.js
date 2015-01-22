var alert = angular.module('courseeater.alert', []);

alert.factory('AlertStore', function () {
    var AlertStore = {};
    
    AlertStore.messages = [];
    
    AlertStore.hasMessages = function () {
        return AlertStore.messages.length !== 0;    
    };
    
    AlertStore.addMessage = function (message) {
        AlertStore.messages.push({
            type: 'warning',
            message: message
        });
    };
    
    AlertStore.removeMessage = function (index) {
        AlertStore.messages.splice(index, 1);
    };
    
    AlertStore.clearMessages = function () {
        AlertStore.messages.clear();
    };
    
    return AlertStore;
    
});

alert.controller('AlertController', ['$scope', 'AlertStore', function ($scope, AlertStore) {
    $scope.alertStore = AlertStore;
}]);

alert.directive('alertView', function () {
    return {
        templateUrl: 'app/components/alert/directives/alert-view.html'
    }
});