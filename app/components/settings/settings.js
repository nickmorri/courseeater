var settings = angular.module('courseeater.settings', ['ui.bootstrap']);

settings.controller('SettingsController', ['$scope', 'AuthService', '$state', function ($scope, AuthService, $state) {
    $scope.authService = AuthService;
    
    $scope.newEmail = undefined;
    
    $scope.updateEmail = function () {
        debugger
        console.log($scope.newEmail);
    };
    
    
    $scope.passwordUpdateMessage = "";
    $scope.passwordUpdateError = false;
    $scope.currentPassword = undefined
    $scope.newPassword = undefined
    $scope.verifyPassword = undefined
    
    $scope.updatePassword = function () {
        if ($scope.newPassword != $scope.verifyPassword) {
            $scope.passwordUpdateError = true;
            $scope.passwordUpdateSuccess = false;
            $scope.passwordUpdateMessage = "New password and the verification password do not match. Please try again."
            return;
        }
        
        if ($scope.newPassword == $scope.currentPassword) {
            $scope.passwordUpdateError = true;
            $scope.passwordUpdateSuccess = false;
            $scope.passwordUpdateMessage = "New password and current password are the same. Please try entering a new password."
            return;
        }
        
        $scope.authService.checkLogin($scope.authService.currentUser.attributes.username, $scope.currentPassword).then(function (response) {
            $scope.authService.currentUser.set("password", $scope.newPassword);
            return $scope.authService.currentUser.save();
        }).then(function (response) {
            $scope.passwordUpdateSuccess = true;
            
            $scope.passwordUpdateMessage = "Password successfully updated!";
            
            $scope.passwordUpdateError = false;
            $scope.currentPassword = undefined
            $scope.newPassword = undefined
            $scope.verifyPassword = undefined
        }, function (error) {
            $scope.passwordUpdateSuccess = false;
            
            $scope.passwordUpdateMessage = "Whoops! Something went wrong while updating your password. Please try again.";
            
            $scope.passwordUpdateError = true;
            $scope.currentPassword = undefined
            $scope.newPassword = undefined
            $scope.verifyPassword = undefined
        });
        
    };
    
    $scope.deletePassword = undefined;
    
    $scope.deleteAccount = function () {
        $scope.authService.checkLogin($scope.authService.currentUser.attributes.username, $scope.deletePassword).then(function (response) {
            return $scope.authService.currentUser.destroy();
        }).then(function () {
            $scope.authService.logout();
        }, function (error) {
            $scope.authService.logout();
        });
    };
    
}]);