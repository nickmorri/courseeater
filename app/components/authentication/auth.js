(function () {
    "use strict";

    var module_dependencies = ["parse-angular", "parse.service", "jp.ng-bs-animated-button"];

    angular
        .module('courseeater.auth', module_dependencies)
        .factory('AuthService', AuthService)
        .controller('NavController', NavController)
        .directive('userMenu', UserMenu)
        .directive('anonymousMenu', AnonymousMenu)
        .directive("loginPartial", LoginPartial)
        .directive("registrationPartial", RegistrationPartial)

    AuthService.$inject = ['$rootScope'];
    function AuthService ($rootScope) {
        var authService = {};

        authService.currentUser = Parse.User.current();

        authService.loggedIn = authService.currentUser != null;

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
    }

    NavController.$inject = ['$scope', 'AuthService'];
    function NavController ($scope, AuthService) {
        $scope.authService = AuthService;
    }

    UserMenu.$inject = ['AuthService'];
    function UserMenu (AuthService) {
        return {
            scope: {},
            restrict: 'E',
            replace: true,
            templateUrl: 'app/partials/user-menu.html',
            link: function ($scope) {
                $scope.$on("login", function () {
                    setUsername(AuthService.currentUser.attributes.username);
                });

                $scope.logout = AuthService.logout;

                setUsername(AuthService.currentUser.attributes.username);

                function setUsername (username) {
                    $scope.username = username;
                }

            }
        };
    }

    function AnonymousMenu () {
        return {
            scope: {},
            restrict: 'E',
            replace: true,
            templateUrl: 'app/partials/anonymous-menu.html',
            link: function ($scope) {
                $scope.menu_shown = "login";

                $scope.toggle_menu = function ($event) {
                    $event.preventDefault();
                    $event.stopPropagation();
                    $scope.menu_shown = $scope.menu_shown != "login" ?  "login" : "register"
                };
            }
        };
    }

    function LoginPartial () {

        LoginPartialController.$inject = ['$scope', 'AuthService'];
        function LoginPartialController ($scope, AuthService) {

            var ctrl = this;
            ctrl.login = login;

            $scope.error = false;
            $scope.username = undefined;
            $scope.password = undefined;

            $scope.resettingPassword = false;

            function login  () {
                AuthService.login($scope.username, $scope.password).then(function () {
                    $scope.username = undefined;
                    $scope.password = undefined;
                    $scope.error = false;
                    // Collapses user menu on mobile when list is set active
                    var navbarHeader = $(".navbar-header .navbar-toggle");
                    if (navbarHeader.css("display") !== "none") {
                        navbarHeader.trigger("click");
                    }
                }).fail(function () {
                    $scope.error = true;
                });
            }
        }

        return {
            scope: {},
            templateUrl: 'app/partials/login-partial.html',
            controller: LoginPartialController,
            controllerAs: 'ctrl'
        };
    }

    function RegistrationPartial () {

        RegistrationPartialController.$inject = ['$scope', 'AuthService', '$http'];
        function RegistrationPartialController ($scope, AuthService, $http) {

            var ctrl = this;

            ctrl.setInitialState = setInitialState;
            ctrl.register = register;

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

            ctrl.setInitialState();

            function setInitialState () {
                $scope.error = false;
                $scope.username = undefined;
                $scope.email = undefined;
                $scope.password = undefined;
                $scope.verify_password = undefined;
                $scope.antplanner_username = undefined;

                $scope.isRegistering = null;
                $scope.result = null;

                $scope.error_message = "Something went wrong. Please try registering again.";
            }

            function register () {
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

                AuthService.register($scope.username, $scope.email, $scope.password).then(function (status) {
                    ctrl.setInitialState();
                    $scope.result = "success";
                    // Collapses user menu on mobile when list is set active
                    var navbarHeader = $(".navbar-header .navbar-toggle");
                    if (navbarHeader.css("display") != "none") {
                        navbarHeader.trigger("click");
                    }
                }, function (error) {
                    $scope.result = "error";
                    $scope.error = true;
                    $scope.error_message = error.message || "Something went wrong. Please try registering again.";
                });
            }

        }

        return {
            scope: {},
            templateUrl: 'app/partials/registration-partial.html',
            controller: RegistrationPartialController,
            controllerAs: 'ctrl'
        };
    }

}());