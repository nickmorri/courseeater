var authentication = angular.module('courseeater.auth', ['parse-angular', 'parse.service', 'jp.ng-bs-animated-button', 'courseeater.retrieve']);

authentication.factory('AuthService', ['$state', '$rootScope', '$window', function ($state, $rootScope, $window) {
    var authService = {};
    
    authService.currentUser = Parse.User.current();
    
    authService.loggedIn = authService.currentUser != null;
    
    authService.checkLogin = function (username, password) {
        return Parse.User.logIn(username, password);
    };
    
    authService.login = function (username, password) {
        return Parse.User.logIn(username, password).then(function (response) {
            authService.currentUser = Parse.User.current();
            authService.loggedIn = authService.currentUser != null;
            $rootScope.$broadcast("login");
        }, function (error) {
            authService.currentUser = null;
        });
    };
    
    authService.register = function (username, email, password, courseCodes) {
        var user = new Parse.User();
        user.set("username", username);
        user.set("email", email);
        user.set("password", password);
        user.set("newImportCourseCodes", courseCodes);
        
        return user.signUp().then(function (response) {
            authService.currentUser = Parse.User.current();
            authService.loggedIn = authService.currentUser != null;
            $rootScope.$broadcast("login");
        }, function (error) {
            authService.currentUser = null;
            return error;
        });
    };
    
    authService.resetPassword = function (email) {
        return Parse.User.requestPasswordReset(email);
    };
    
    authService.logout = function () {
        Parse.User.logOut();
        authService.currentUser = null;
        authService.loggedIn = authService.currentUser != null;
        $rootScope.$broadcast("logout");
    };
    
    authService.refetchCurrentUser = function () {
        return authService.currentUser.fetch();
    };
    
    return authService;
}]);

authentication.controller('NavController', ['$scope', 'AuthService', function ($scope, AuthService) {
    $scope.authService = AuthService;
}]);

authentication.directive('userMenu', function () {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'app/partials/user-menu.html'
    }
});

authentication.directive('anonymousMenu', function () {
    return {
        scope: {},
        restrict: 'E',
        replace: true,
        templateUrl: 'app/partials/anonymous-menu.html',
        link: function ($scope, element, attributes) {
            $scope.menu_shown = "login";
            
            $scope.toggle_menu = function ($event) {
                $event.preventDefault();
                $event.stopPropagation();
                $scope.menu_shown = $scope.menu_shown != "login" ?  "login" : "register"
            };
        }
    }
});

authentication.directive('loginPartial', ['AuthService', function (AuthService) {
    return {
        scope: {},
        templateUrl: 'app/partials/login-partial.html',
        controller: ['$scope', 'AuthService', function ($scope, AuthService) {
            $scope.authService = AuthService;
    
            $scope.error = false;
            $scope.username = undefined;
            $scope.password = undefined;
            
            $scope.resettingPassword = false;
        
            $scope.login = function ($event) {
                $scope.authService.login($scope.username, $scope.password).then(function (status) {
                    $scope.username = undefined;
                    $scope.password = undefined;
                    $scope.error = false;
                    // Collapses user menu on mobile when list is set active
                    if ($(".navbar-header .navbar-toggle").css("display") != "none") $(".navbar-header .navbar-toggle").trigger("click");
                }).fail(function (error) {
                    $scope.error = true;
                });
            };
            
            $scope.doReset = function ($event) {
                $event.preventDefault();
                $event.stopPropagation();
                $scope.resettingPassword = true;
            };
            
        }]
    };
}]);

authentication.directive('registrationPartial', ['AuthService', 'AntplannerRetriever', function (AuthService, AntplannerRetriever) {
    return {
        scope: {},
        templateUrl: 'app/partials/registration-partial.html',
        controller: ['$scope', 'AuthService', '$http', function ($scope, AuthService, $http) {
            $scope.authService = AuthService;
    
            $scope.setInitialState = function () {
                $scope.error = false;
                $scope.username = undefined;
                $scope.email = undefined;
                $scope.password = undefined;
                $scope.verify_password = undefined;
                $scope.antplanner_username = undefined;
                
                $scope.isRegistering = null;
                $scope.result = null;
                
                $scope.error_message = "Something went wrong. Please try registering again.";
            };
            
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
                return AntplannerRetriever.retrieve(username);
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
                
                if ($scope.antplanner_username) {
                    $scope.importAntplannerAccount($scope.antplanner_username).then(function(courseCodes) {
                        $scope.authService.register($scope.username, $scope.email, $scope.password, {title: $scope.antplanner_username, courseCodes: courseCodes}).then(function (status) {
                            $scope.setInitialState();
                            $scope.result = "success";
                            // Collapses user menu on mobile when list is set active
                            if ($(".navbar-header .navbar-toggle").css("display") != "none") $(".navbar-header .navbar-toggle").trigger("click");
                        }, function (error) {
                            $scope.result = "error";
                            $scope.error = true;
                            $scope.error_message = error.message !== undefined ? error.message : "Something went wrong. Please try registering again.";
                        });
                    }, function (error) {
                        $scope.result = "error";
                        $scope.error = true;
                        $scope.error_message = "The Antplanner username entered was not retrieved. Please try again.";
                    });
                }
                else {
                    $scope.authService.register($scope.username, $scope.email, $scope.password).then(function (status) {
                        $scope.setInitialState();
                        $scope.result = "success";
                        // Collapses user menu on mobile when list is set active
                        if ($(".navbar-header .navbar-toggle").css("display") != "none") $(".navbar-header .navbar-toggle").trigger("click");
                    }, function (error) {
                        $scope.result = "error";
                        $scope.error = true;
                        $scope.error_message = "Something went wrong. Please try registering again.";
                    });    
                }
            };
            
            $scope.setInitialState();
        }]
    }
}]);

authentication.directive('passwordResetPartial', ['AuthService', function (AuthService) {
    return {
        scope: {},
        templateUrl: 'app/partials/password-reset-partial.html',
        controller: ['$scope', 'AuthService', function ($scope, AuthService) {
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
        }]
    }
}]);