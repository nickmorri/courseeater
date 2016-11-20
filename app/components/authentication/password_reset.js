(function () {
    'use strict';

    angular
	.module('courseeater.passwordreset', [])
	.controller('PasswordResetController', PasswordResetController);

    PasswordResetController.$inject = ['$scope', '$stateParams'];
    function PasswordResetController ($scope, $stateParams) {

	$scope.updatePassword = function () {
	    if ($scope.newPassword != $scope.verifyPassword) {
		$scope.error = true;
		$scope.success = false;
		$scope.message = "New password and the verification password do not match. Please try again."
		return;
	    }

	    var request = {
		username: $stateParams.username,
		token: $stateParams.token,
		password: $scope.newPassword
	    };

	    return Parse.Cloud.run("finishPasswordReset", request).then(function (response) {
		$scope.success = true;

		$scope.message = "Password successfully updated!";

		$scope.error = false;
		$scope.newPassword = undefined
		$scope.verifyPassword = undefined
	    }, function (error) {
		$scope.success = false;

		$scope.message = "Whoops! Something went wrong while updating your password. Please try again.";

		$scope.error = true;
		$scope.newPassword = undefined
		$scope.verifyPassword = undefined
	    });

	};
	
    }
}());
