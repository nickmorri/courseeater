var settings = angular.module('down.settings', ['down.auth', 'angularFileUpload']);

settings.controller('SettingsController', ['$scope', 'AuthService', function ($scope, AuthService) {
    $scope.authService = AuthService;
}]);

settings.controller('ProfileController', ['$scope', 'AuthService', function ($scope, AuthService) {
    $scope.authService = AuthService;
    
    $scope.currentImage = $scope.authService.currentUser.attributes.profilePicture._url;
    $scope.newImage = undefined;
    
    $scope.imageSelected = function ($files, $event, $rejectedFiles) {
        var reader = new FileReader();
        reader.readAsDataURL($files[0]);
        
        reader.onload = function (event) {
            $scope.currentImage = event.target.result.replace("data:image/jpeg;base64,", "");
            debugger;
        }
        
    };
    
}]);

settings.controller('AccountController', ['$scope', 'AuthService', '$state', function ($scope, AuthService, $state) {
    $scope.authService = AuthService;
    
    $scope.newEmail = undefined;
    $scope.currentPassword = undefined;
    $scope.newPassword = undefined;
    $scope.verifiedPassword = undefined;
    $scope.accountDeletionPassword = undefined;
    
    $scope.invalidNewPassword = false;
    $scope.successfulPasswordChange = false;
    
    $scope.updateEmail = function () {
        $scope.authService.currentUser.set("email", $scope.newEmail);
        $scope.authService.currentUser.save();
        $scope.newEmail = undefined;
    };
    
    $scope.updatePassword = function () {
        
        if ($scope.newPassword !== $scope.verifiedPassword) {
            $scope.invalidNewPassword = true;
            return;
        }
        
        Parse.User.logIn($scope.authService.currentUser.attributes.username, $scope.currentPassword).then(function () {
            $scope.authService.currentUser.set("password", $scope.newPassword);
            $scope.authService.currentUser.save();
            $scope.successfulPasswordChange = true;
        }, function (error) {
            $state.go('login');
        });
    };
    
    $scope.deleteAccount = function () {
        debugger;
    };
}]);