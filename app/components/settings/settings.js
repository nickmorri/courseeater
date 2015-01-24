var settings = angular.module('courseeater.settings', ['ui.bootstrap']);

settings.controller('SettingsController', ['$scope', 'AuthService', function ($scope, AuthService) {
    $scope.authService = AuthService;
    
    $scope.newEmail = undefined;
    
    $scope.updateEmail = function () {
        debugger
        console.log($scope.newEmail);
    };
    
    $scope.passwordUpdateError = false;
    $scope.currentPassword = undefined
    $scope.newPassword = undefined
    $scope.verifyPassword = undefined
    
    $scope.updatePassword = function () {
        debugger;
        
        if ($scope.newPassword != $scope.verifyPassword) {
            $scope.passwordUpdateError = true;
        }
    };
    
    $scope.deletePassword = undefined;
    
    $scope.deleteAccount = function () {
        debugger;
    };
    
    
    $scope.message = "";
    
    $scope.sendAlert = function () {
        $scope.authService.sendAlert($scope.message).then(function (response) {
            console.log(response);
        });
    };
}]);