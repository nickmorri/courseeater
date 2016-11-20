(function () {
    "use strict";

    var module_dependencies = ['courseeater.list'];

    angular
        .module('courseeater.alert', module_dependencies)
        .factory('AlertStore', AlertStore)
        .controller('AlertController', AlertController)
        .directive('alertView', AlertView);

    AlertStore.$inject = ["AuthService"];
    function AlertStore (AuthService) {
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
                AlertStore.messages = messages.map(function (message) {
                    return {
                        type: 'danger',
                        message: message.attributes.message,
                        newTermNotification: message.attributes.newTermNotification,
                        id: message.id
                    };
                });
            });
        };

        AlertStore.retrieveAlerts();

        return AlertStore;
    }

    AlertController.$inject = ["$scope", "$modal", "AlertStore", "CourseListStore"];
    function AlertController ($scope, $modal, AlertStore, CourseListStore) {
        $scope.alertStore = AlertStore;
        $scope.courseListStore = CourseListStore;

        $scope.newCourseList = function (targetList) {
            $modal.open({
                templateUrl: 'app/components/list/directives/course-list-modal.html',
                controller: 'CourseListModalController',
                resolve: {
                    list: function () {
                        return targetList;
                    }
                }
            });
        };
    }

    function AlertView () {
        return {
            templateUrl: 'app/components/alert/directives/alert-view.html'
        };
    }

}());