(function () {
    "use strict";

    var module_dependencies = ['ui.bootstrap', 'jp.ng-bs-animated-button', 'LocalStorageModule'];

    angular
        .module('courseeater.list', module_dependencies)
        .config(ListConfig)
        .factory('CourseList', CourseList)
        .factory('ParseCourseListAdaptor', ParseCourseListAdaptor)
        .factory('LocalStorageCourseListAdaptor', LocalStorageCourseListAdaptor)
        .factory('CourseListStore', CourseListStore)
        .controller('ListController', ListController)
        .controller('CourseListModalController', CourseListModalController)
        .directive('courseListView', CourseListView);

    ListConfig.$inject = ["localStorageServiceProvider"];
    function ListConfig (localStorage) {
        localStorage
            .setPrefix('courseeater.list')
            .setStorageType('localStorage')
    }

    CourseList.$inject = ["$q", "localStorageService"];
    function CourseList ($q, localStorageService) {
        return function (data) {
            this.title = data.attributes.title;
            this.term = data.attributes.term;
            this.active = data.attributes.active;
            this.courseCodes = data.attributes.courseCodes;
            this.owner = data.attributes.owner;
            this.shared = data.attributes.shared;
            this.id = data.id;

            this.local = this.owner === -1;

            this.addCourse = function (courseCode) {
                courseCode = parseInt(courseCode, 10);
                this.courseCodes.push(courseCode);
                if (this.local) {
                    return new $q(function (resolve, reject) {
                        var courseLists = localStorageService.get('courseLists');

                        courseLists.forEach(function (list) {
                            if (list.attributes.active) list.attributes.courseCodes.push(courseCode);
                        });

                        localStorageService.set('courseLists', courseLists);
                        resolve(courseLists.find(function (list) {
                            return list.active;
                        }));
                    });
                }
                else {
                    return Parse.Cloud.run('addCourse', {courseCode : courseCode});
                }
            };

            this.removeCourse = function (courseCode) {
                this.courseCodes.splice(this.courseCodes.indexOf(courseCode), 1);
                if (this.local) {
                    return new $q(function (resolve, reject) {
                        var courseLists = localStorageService.get('courseLists');

                        courseLists.forEach(function (list) {
                            if (list.attributes.active) list.attributes.courseCodes.splice(list.attributes.courseCodes.indexOf(courseCode), 1);
                        });

                        localStorageService.set('courseLists', courseLists);
                        resolve(courseLists.find(function (list) {
                            return list.active;
                        }));
                    });
                }
                else {
                    return Parse.Cloud.run('removeCourse', {courseCode : courseCode});
                }
            };

        };
    }

    ParseCourseListAdaptor.$inject = ["AuthService"];
    function ParseCourseListAdaptor (AuthService) {
        var Store = {};

        // Private

        Store.authService = AuthService;

        // Public

        Store.retrieveCourseLists = function () {
            var query = new Parse.Query("CourseList");
            query.equalTo("owner", Store.authService.currentUser);
            return query.find();
        };

        Store.saveList = function (objectId, title, term) {
            return Parse.Cloud.run('updateCourseList', {objectId : objectId, title : title, term: term});
        };

        Store.createNewList = function (title, shared, term) {
            return Parse.Cloud.run('createCourseList', {title : title, shared : shared, term: term});
        };

        Store.deleteList = function (objectId) {
            return Parse.Cloud.run('deleteCourseList', {objectId : objectId});
        };

        Store.setActiveList = function (list) {
            return Parse.Cloud.run("changeActiveCourseList", {objectId : list.id});
        };

        Store.upgradeCourseList = function (list) {
            return Parse.Cloud.run('createCourseList', {title: list.title, shared: list.shared, term: list.term, courseCodes: list.courseCodes});
        };

        Store.initialize = function () {};

        Store.clear = function () {};

        return Store;
    }

    LocalStorageCourseListAdaptor.$inject = ["$q", "localStorageService", "Retriever"];
    function LocalStorageCourseListAdaptor ($q, localStorageService, Retriever) {
        var Store = {};

        // Public

        Store.initialize = function () {
            Retriever.get_terms().then(function (result) {
                if (localStorageService.get('courseLists') === null) {
                    localStorageService.set('courseLists', []);
                    Store.createNewList('Default', false, result.defaultTerm);
                }
            });
        };

        Store.retrieveCourseLists = function () {
            return new $q(function (resolve, reject) {
                var courseLists = localStorageService.get('courseLists');
                if (courseLists === null) reject();
                else resolve(courseLists);
            });
        };

        Store.saveList = function (id, title, term) {
            return new $q(function (resolve, reject) {
                var courseLists = localStorageService.get('courseLists');

                courseLists.forEach(function (list) {
                    if (id === list.id) {
                        list.attributes.title = title;
                        list.attributes.term = term;
                    }
                });

                localStorageService.set('courseLists', courseLists);
                resolve(true);

            });
        };

        Store.createNewList = function (title, shared, term) {
            var newCourseList = {
                attributes: {
                    title: title,
                    active: true,
                    courseCodes: [],
                    shared: shared,
                    owner: -1,
                    term: term
                },
                id: 1
            };

            return new $q (function (resolve, reject) {
                var courseLists = localStorageService.get('courseLists');

                courseLists.forEach(function (list) {
                    list.attributes.active = false;
                });

                newCourseList.id = courseLists.reduce(function (last_id, currentList, index, array) {
                        return last_id < currentList.id ? currentList.id : last_id;
                    }, 0) + 1;

                courseLists.push(newCourseList);
                localStorageService.set('courseLists', courseLists);
                resolve(newCourseList);
            });
        };

        Store.deleteList = function (id) {
            return new $q (function (resolve, reject) {
                Retriever.get_terms().then(function (result) {
                    var courseLists = localStorageService.get('courseLists').filter(function (list) {
                        return id !== list.id;
                    });

                    if (courseLists.length == 0) {
                        Store.createNewList('Default', false, result.defaultTerm);
                        resolve(id);
                    }
                    else {
                        courseLists[0].attributes.active = true;
                        localStorageService.set('courseLists', courseLists);
                        resolve(id);
                    }
                });
            });
        };

        Store.setActiveList = function (active_list) {
            return new $q(function (resolve, reject) {
                var courseLists = localStorageService.get('courseLists');

                courseLists.forEach(function (list) {
                    list.attributes.active = active_list.id === list.id;
                });

                localStorageService.set('courseLists', courseLists);
                resolve(true);
            });

        };

        Store.clear = function () {
            localStorageService.remove('courseLists');
        };

        return Store;
    }

    CourseListStore.$inject = ["CourseList", "AuthService", "$rootScope", "ParseCourseListAdaptor", "LocalStorageCourseListAdaptor"];
    function CourseListStore (CourseList, AuthService, $rootScope, ParseAdaptor, LocalAdaptor) {

        var CourseListStore = {};

        CourseListStore._collection = [];
        CourseListStore.authService = AuthService;

        CourseListStore.activeList = undefined;
        CourseListStore.initialized = false;

        CourseListStore.setAdaptor = function () {
            // If a Parse User object is logged in we should retrieve their CourseLists
            // Otherwise we should check localStorage to see if we have any local CourseLists available
            CourseListStore.adaptor = AuthService.loggedIn ? ParseAdaptor : LocalAdaptor;
            CourseListStore.adaptor.initialize();
        };

        CourseListStore.retrieveCourseLists = function () {
            return CourseListStore.adaptor.retrieveCourseLists().then(function (result) {
                CourseListStore._collection = result.map(function (list) {
                    return new CourseList(list);
                });

                CourseListStore.activeList = CourseListStore._collection.find(function (list) {
                    return list.active;
                });

                CourseListStore.initialized = CourseListStore.activeList !== undefined;
            });
        };

        CourseListStore.saveList = function (objectId, title, term) {
            return CourseListStore.adaptor.saveList(objectId, title, term).then(CourseListStore.retrieveCourseLists);
        };

        CourseListStore.createNewList = function (title, shared, term) {
            return CourseListStore.adaptor.createNewList(title, shared, term).then(CourseListStore.retrieveCourseLists);
        };

        CourseListStore.deleteList = function (objectId) {
            return CourseListStore.adaptor.deleteList(objectId).then(CourseListStore.retrieveCourseLists);
        };

        CourseListStore.setActiveList = function (list) {
            CourseListStore.adaptor.setActiveList(list).then(CourseListStore.retrieveCourseLists);
        };

        CourseListStore.transferLocalToParse = function () {
            return Parse.Promise.when(CourseListStore._collection.filter(function (list) {
                return list.courseCodes.length > 0;
            }).map(ParseAdaptor.upgradeCourseList));
        };

        CourseListStore.clear = function () {
            CourseListStore.adaptor.clear();
            CourseListStore._collection = [];
            CourseListStore.activeList = undefined;
            CourseListStore.initialized = false;
        };

        CourseListStore.handleLogin = function () {
            CourseListStore.transferLocalToParse().then(function (response) {
                CourseListStore.clear();
                CourseListStore.setAdaptor();
                CourseListStore.retrieveCourseLists();
            });
        };

        CourseListStore.handleLogout = function () {
            CourseListStore.clear();
            CourseListStore.setAdaptor();
            CourseListStore.retrieveCourseLists();
        };

        // Listen for and handle logout event
        $rootScope.$on('logout', CourseListStore.handleLogout);

        // Listen for and handle login event
        $rootScope.$on('login', CourseListStore.handleLogin);

        CourseListStore.setAdaptor();

        return CourseListStore;

    }

    ListController.$inject = ["$scope", "AuthService", "CourseListStore", "$modal"];
    function ListController ($scope, AuthService, CourseListStore, $modal) {
        $scope.authService = AuthService;
        $scope.courseListStore = CourseListStore;

        $scope.setActiveList = function (list) {
            // Do nothing if current active list is selected
            if ($scope.courseListStore.activeList == list) return;

            // Collapses user menu on mobile when list is set active
            if ($(".navbar-header .navbar-toggle").css("display") != "none") $(".navbar-header .navbar-toggle").trigger("click");
            $scope.courseListStore.setActiveList(list);
        };

        $scope.editList = function (targetList) {
            var modalInstance = $modal.open({
                templateUrl: 'app/components/list/directives/course-list-modal.html',
                controller: 'CourseListModalController',
                resolve: {
                    list: function () {
                        return targetList;
                    }
                }
            });
        };

        if (!$scope.courseListStore.initialized) $scope.courseListStore.retrieveCourseLists();

    }

    CourseListModalController.$inject = ["$scope", "CourseListStore", "Retriever", "AlertStore", "list"];
    function CourseListModalController ($scope, CourseListStore, Retriever, AlertStore, list) {
        $scope.courseListStore = CourseListStore;

        Retriever.get_terms().then(function (result) {
            $scope.available_terms = result.availableTerms;

            if (list !== undefined) {
                $scope.list = list;
            } else {
                $scope.list = {
                    title: undefined,
                    newList: true,
                    term: result.defaultTerm
                };
            }

        });

        $scope.buttonConfig = {
            createList: {
                buttonDefaultText: 'Create',
                buttonSubmittingText: 'Creating...',
                buttonSuccessText: 'Created',
                buttonDefaultClass: 'btn-primary',
                buttonSubmittingClass: 'btn-primary',
                buttonSuccessClass: 'btn-success',
                buttonInitialIcon: 'glyphicon',
                buttonSubmittingIcon: 'glyphicon',
                buttonSuccessIcon: 'glyphicon',
                iconsPosition: 'right'
            },
            deleteList: {
                buttonDefaultText: 'Delete',
                buttonSubmittingText: 'Deleting...',
                buttonSuccessText: 'Deleted',
                buttonDefaultClass: 'btn-danger',
                buttonSubmittingClass: 'btn-danger',
                buttonSuccessClass: 'btn-danger',
                buttonInitialIcon: 'glyphicon',
                buttonSubmittingIcon: 'glyphicon',
                buttonSuccessIcon: 'glyphicon',
                iconsPosition: 'right'
            },
            saveList: {
                buttonDefaultText: 'Save',
                buttonSubmittingText: 'Saving...',
                buttonSuccessText: 'Saved',
                buttonDefaultClass: 'btn-primary',
                buttonSubmittingClass: 'btn-primary',
                buttonSuccessClass: 'btn-success',
                buttonInitialIcon: 'glyphicon',
                buttonSubmittingIcon: 'glyphicon',
                buttonSuccessIcon: 'glyphicon',
                iconsPosition: 'right'
            }
        };

        $scope.isCreating = null;
        $scope.isSaving = null;
        $scope.isDeleting = null;

        $scope.changeTerm = function (term) {
            list.term = term;
        };

        $scope.createList = function () {
            $scope.isCreating = true;
            $scope.courseListStore.createNewList($scope.list.title, $scope.list.shared, $scope.list.term).then($scope.$close, function (error) {
                AlertStore.addMessage("An error occured while creating " + $scope.list.title + ". Please try again.");
                $scope.$close();
            });

        };

        $scope.saveList = function () {
            $scope.isSaving = true;
            $scope.courseListStore.saveList($scope.list.id, $scope.list.title, $scope.list.term).then($scope.$close, function (error) {
                AlertStore.addMessage("An error occured while saving " + $scope.list.title + ". Please try again.");
                $scope.$close();
            });
        };

        $scope.deleteList = function () {
            $scope.isDeleting = true;
            $scope.courseListStore.deleteList($scope.list.id).then($scope.$close, function (error) {
                if (error.message) {
                    AlertStore.addMessage(error.message);
                }
                else {
                    AlertStore.addMessage("An error occured while deleting " + $scope.list.title + ". Please try again.");
                }
                $scope.$close();
            });
        };

    }

    function CourseListView () {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: "app/components/list/directives/course-list-view.html"
        }
    }

}());
