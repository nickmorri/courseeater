(function () {
    'use strict';

    var module_dependencies = ['ui.bootstrap'];

    angular
        .module('courseeater.settings', module_dependencies)
        .directive('changeEmailPartial', ChangeEmailPartial)
        .directive('changePasswordPartial', ChangePasswordPartial)
        .directive('deleteAccountPartial', DeleteAccountPartial)

    ChangeEmailPartial.$inject = ['AuthService'];
    function ChangeEmailPartial (AuthService) {
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
                    Parse.Cloud.run('changeUserEmail', {email: $scope.newEmail}).then(function () {
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
        };
    }

    ChangePasswordPartial.$inject = ['AuthService'];
    function ChangePasswordPartial (AuthService) {
        return {
            scope: {},
            templateUrl: 'app/views/settings/partials/change-password-partial.html',
            controller: ['$scope', 'AuthService', function ($scope, AuthService) {
                $scope.authService = AuthService;

                $scope.message = "";
                $scope.error = false;
                $scope.currentPassword = undefined;
                $scope.newPassword = undefined;
                $scope.verifyPassword = undefined;

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

                    Parse.Cloud.run('changeUserPassword', {password: $scope.newPassword}).then(function () {
                        $scope.success = true;
                        $scope.message = "Password successfully updated!";
                        $scope.error = false;
                        $scope.currentPassword = undefined;
                        $scope.newPassword = undefined;
                        $scope.verifyPassword = undefined;
                    }, function (error) {
                        $scope.success = false;
                        $scope.message = "Whoops! Something went wrong while updating your password. Please try again.";
                        $scope.error = true;
                        $scope.currentPassword = undefined;
                        $scope.newPassword = undefined;
                        $scope.verifyPassword = undefined;
                    });

                };
            }]
        }
    }

    DeleteAccountPartial.$inject = ['AuthService'];
    function DeleteAccountPartial (AuthService) {
        return {
            scope: {},
            templateUrl: 'app/views/settings/partials/delete-account-partial.html',
            controller: ['$scope', 'AuthService', function ($scope, AuthService) {
                $scope.authService = AuthService;

                $scope.password = undefined;

                $scope.error = false;
                $scope.success = false;
                $scope.message = undefined;

                $scope.deleteAccount = function () {
                    $scope.authService.checkLogin($scope.authService.currentUser.attributes.username, $scope.deletePassword).then(function (response) {
                        return $scope.authService.currentUser.destroy();
                    }).then(function (response) {
                        $scope.error = false;
                        $scope.success = true;
                        $scope.password = undefined;
                        $scope.authService.logout();
                        $scope.message = "You have been logged out and your account was successfully deleted.";
                    }, function (error) {
                        $scope.error = true;
                        $scope.success = false;
                        $scope.password = undefined;
                        $scope.authService.logout();
                        $scope.message = "Invalid password entered. As a precaution you have been logged out of your account.";
                    });
                };

            }]
        }
    }

}());