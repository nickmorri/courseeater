var authentication = angular.module('courseeater.auth', ['parse-angular', 'parse.service']);

authentication.factory('AuthService', ['$state', function ($state) {
    var authService = {};
    
    authService.currentUser = Parse.User.current();
    
    authService.loggedIn = function () {
        return authService.currentUser !== null;
    };
    
    authService.login = function (username, password) {
        return Parse.User.logIn(username, password).then(function (response) {
            status = response;
            authService.currentUser = Parse.User.current();
            $state.go('track');
        }, function (error) {
            status = error;
            authService.currentUser = null;
        });
    };
    
    authService.logout = function () {
        Parse.User.logOut();
        authService.currentUser = null;
        $state.go('login');
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
            $scope.error = false;
        }).fail(function (error) {
            $scope.error = true;
        });
    };

}]);