var authentication = angular.module('courseeater.auth', ['parse-angular', 'parse.service']);

authentication.factory('AuthService', ['$state', '$rootScope', function ($state, $rootScope) {
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
    
    authService.register = function (username, email, password) {
        var user = new Parse.User();
        user.set("username", username);
        user.set("email", email);
        user.set("password", password);

        return user.signUp(null).then(function (response) {
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
    
    if ($scope.authService.loggedIn()) {
        $state.go('track');
    }
    
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

authentication.controller('RegistrationController', ['$scope', 'AuthService', '$state', function ($scope, AuthService, $state) {
    $scope.authService = AuthService;
    
    $scope.error = false;
    $scope.username = undefined;
    $scope.email = undefined;
    $scope.password = undefined;
    $scope.registration_code = undefined;
    
    $scope.register = function () {
        $scope.authService.checkRegistrationCode($scope.registration_code).then(function (status) {
            $scope.authService.register($scope.username, $scope.email, $scope.password).then(function (status) {
                $state.go('track');
            }, function (error) {
                $scope.error = true;
            });
        }, function (error) {
            $scope.error = true;
        });
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
    