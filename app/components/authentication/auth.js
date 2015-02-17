var authentication = angular.module('courseeater.auth', ['parse-angular', 'parse.service', 'jp.ng-bs-animated-button']);

authentication.factory('AuthService', ['$state', '$rootScope', '$window', function ($state, $rootScope, $window) {
    var authService = {};
    
    authService.currentUser = Parse.User.current();
    
    authService.loggedIn = function () {
        return authService.currentUser !== null;
    };
    
    authService.checkLogin = function (username, password) {
        return Parse.User.logIn(username, password);
    };
    
    authService.login = function (username, password) {
        return Parse.User.logIn(username, password).then(function (response) {
            authService.currentUser = Parse.User.current();
        }, function (error) {
            authService.currentUser = null;
        });
    };
    
    authService.register = function (username, email, password, courseCodes) {
        var user = new Parse.User();
        user.set("username", username);
        user.set("email", email);
        user.set("password", password);

        return user.signUp({importCourseCodes: courseCodes}).then(function (response) {
            authService.currentUser = Parse.User.current();
        }, function (error) {
            authService.currentUser = null;
        });
    };
    
    authService.checkRegistrationCode = function (registration_code) {
        return Parse.Cloud.run("checkRegistrationCode", {registrationCode : registration_code});
    };
    
    authService.resetPassword = function (email) {
        return Parse.User.requestPasswordReset(email);
    };
    
    authService.logout = function () {
        Parse.User.logOut();
        authService.currentUser = null;
        $rootScope.$broadcast("logout");
        $state.go('login.login');
    };
    
    authService.refetchCurrentUser = function () {
        return authService.currentUser.fetch();
    };
    
    return authService;
}]);

authentication.controller('NavController', ['$scope', 'AuthService', function ($scope, AuthService) {
    $scope.authService = AuthService;
}]);

authentication.controller('LoginController', ['$scope', 'AuthService', '$state', function ($scope, AuthService, $state) {
    $scope.authService = AuthService;
    
    if ($scope.authService.loggedIn()) $state.go('track');
    
    $scope.error = false;
    $scope.username = undefined;
    $scope.password = undefined;

    $scope.login = function () {
        $scope.authService.login($scope.username, $scope.password).then(function (status) {
            $state.go('track');
            $scope.error = false;
        }).fail(function (error) {
            $scope.error = true;
        });
    };

}]);

authentication.controller('RegistrationController', ['$scope', 'AuthService', '$state', '$http', function ($scope, AuthService, $state, $http) {
    $scope.authService = AuthService;
    
    $scope.error = false;
    $scope.username = undefined;
    $scope.email = undefined;
    $scope.password = undefined;
    $scope.verify_password = undefined;
    $scope.antplanner_username = undefined;
    
    $scope.isRegistering = null;
    $scope.result = null;
    
    $scope.error_message = "Something went wrong. Please try registering again.";
    
    $scope.registerButtonConfig = {
        buttonDefaultText: 'Register',
        buttonSubmittingText: 'Registering',
        buttonErrorText: 'Whoops',
        buttonSuccessText: 'Registered',
        buttonDefaultClass: 'btn-primary',
        buttonSuccessClass: 'btn-success',
        buttonSizeClass: 'form-control',
        buttonInitialIcon: 'glyphicon glyphicon-user',
        buttonSubmittingIcon: 'glyphicon glyphicon-refresh',
        buttonSuccessIcon: 'glyphicon glyphicon-ok'
    };
    
    $scope.importAntplannerAccount = function (username) {
        return $http({
            url: 'php/antplanner.php',
            method: "GET",
            params: {username: username}
        });
    };
    
    $scope.register = function () {
        $scope.result = null;
        $scope.error = false;
        $scope.isRegistering = true;
        
        if ($scope.password != $scope.verify_password) {
            $scope.result = "error";
            $scope.error = true;
            $scope.error_message = "Password and verification password did not match please try again."
            return;
        }
        
        var courseCodes = [];
        
        if ($scope.antplanner_username) {
            $scope.importAntplannerAccount($scope.antplanner_username).then(function(response) {
                var data = JSON.parse(response.data.data);
                for (var i = 0; i < data.length; i++) {
                    if (courseCodes.indexOf(parseInt(data[i].groupId, 10)) == -1) {
                        courseCodes.push(parseInt(data[i].groupId, 10));
                    }
                }
                $scope.authService.register($scope.username, $scope.email, $scope.password, courseCodes).then(function (status) {
                    $state.go('track');
                }, function (error) {
                    $scope.result = "error";
                    $scope.error = true;
                    $scope.error_message = "Something went wrong. Please try registering again.";
                });
            });
        }
        else {
            $scope.authService.register($scope.username, $scope.email, $scope.password, courseCodes).then(function (status) {
                $state.go('track');
            }, function (error) {
                $scope.result = "error";
                $scope.error = true;
                $scope.error_message = "Something went wrong. Please try registering again.";
            });    
        }
    };
    
}]);

authentication.controller('ResetController', ['$scope', 'AuthService', function ($scope, AuthService) {
    $scope.authService = AuthService;
    
    $scope.error = false;
    $scope.email = undefined;
    $scope.passwordResetGenerated = false;
    
    $scope.resetPassword = function () {
        $scope.authService.resetPassword($scope.email).then(function () {
            $scope.passwordResetGenerated = true;
            $scope.error = false;
        }, function (error) {
            $scope.passwordResetGenerated = false;
            $scope.error = true;
        });
    };
    
}]);
    