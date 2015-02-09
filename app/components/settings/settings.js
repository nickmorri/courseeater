var settings = angular.module('courseeater.settings', ['ui.bootstrap']);

settings.controller('SettingsController', ['$scope', 'AuthService', '$state', function ($scope, AuthService, $state) {
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
        debugger
        $scope.authService.login($scope.authService.currentUser.attributes.username, $scope.deletePassword).then(function (response) {
            return $scope.authService.currentUser.destroy();
        }).then(function () {
            $scope.authService.logout();
        }, function (error) {
            $scope.authService.logout();
        });
    };
    
}]);