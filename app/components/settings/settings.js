var settings = angular.module('courseeater.settings', ['ui.bootstrap']);

settings.directive('changeEmailPartial', ['AuthService', function(AuthService) {
    return {
        scope: {},
        templateUrl: 'app/views/settings/partials/change-email-partial.html',
        controller: ['$scope', 'AuthService', function ($scope, AuthService) {
            $scope.authService = AuthService;
            
            $scope.newEmail = undefined;
    
            $scope.message = "";
            $scope.success = false;
            $scope.error = false;
            
            $scope.updateEmail = function () {
		Parse.Cloud.run("changeUserEmail", {email: $scope.newEmail}).then(function () {
		    $scope.authService.currentUser.email = $scope.newEmail;
		    $scope.newEmail = undefined;
		    $scope.success = true;
                    $scope.error = false;
                    $scope.message = "Email updated successfully.";
                }, function (error) {
                    $scope.newEmail = undefined;
                    $scope.success = false;
                    $scope.error = true;
                    $scope.message = "Whoops! Something went wrong while updating your email. Please try again.";
                });
            };
        }]
    }
}]);

settings.directive('changePasswordPartial', ['AuthService', function(AuthService) {
    return {
        scope: {},
        templateUrl: 'app/views/settings/partials/change-password-partial.html',
        controller: ['$scope', 'AuthService', function ($scope, AuthService) {
            $scope.authService = AuthService;
            
            $scope.message = "";
            $scope.error = false;
            $scope.currentPassword = undefined
            $scope.newPassword = undefined
            $scope.verifyPassword = undefined
            
            $scope.updatePassword = function () {
                if ($scope.newPassword != $scope.verifyPassword) {
                    $scope.error = true;
                    $scope.success = false;
                    $scope.message = "New password and the verification password do not match. Please try again."
                    return;
                }
                
                if ($scope.newPassword == $scope.currentPassword) {
                    $scope.error = true;
                    $scope.success = false;
                    $scope.message = "New password and current password are the same. Please try entering a new password."
                    return;
                }

		
                $scope.authService.checkLogin($scope.authService.currentUser.attributes.username, $scope.currentPassword).then(function (response) {
                    return Parse.Cloud.run("changeUserPassword", {password: $scope.newPassword});
                }).then(function (response) {
                    $scope.success = true;
                    
                    $scope.message = "Password successfully updated!";
                    
                    $scope.error = false;
                    $scope.currentPassword = undefined
                    $scope.newPassword = undefined
                    $scope.verifyPassword = undefined
                }, function (error) {
                    $scope.success = false;
                    
                    $scope.message = "Whoops! Something went wrong while updating your password. Please try again.";
                    
                    $scope.error = true;
                    $scope.currentPassword = undefined
                    $scope.newPassword = undefined
                    $scope.verifyPassword = undefined
                });
                
            };
        }]
    }
}]);
