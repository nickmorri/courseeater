var list = angular.module('courseeater.list', ['ui.bootstrap', 'jp.ng-bs-animated-button']);

list.factory('CourseList', function (CourseStore) {
    return function (data) {
        this.title = data.attributes.title;
        this.active = data.attributes.active;
        this.courseCodes = data.attributes.courseCodes;
        this.owner = data.attributes.owner;
        this.shared = data.attributes.shared;
        this.id = data.id;
        
        this.term = data.attributes.term;
        
        this.setActive = function () {
            return Parse.Cloud.run("changeActiveCourseList", {objectId : this.id});
        };
        
    };
});

list.factory('CourseListStore', ['CourseList', 'AuthService', '$rootScope', function (CourseList, AuthService, $rootScope) {

    var CourseListStore = {};
    
    CourseListStore._collection = [];
    CourseListStore.authService = AuthService;
    
    CourseListStore.activeList = undefined;
    CourseListStore.initialized = false;
    
    CourseListStore.available_terms = {"2015-92": "Fall 2015"};
    
    CourseListStore.retrieveCourseLists = function () {
        var query = new Parse.Query("CourseList");
        query.equalTo("owner", AuthService.currentUser);
        return query.find().then(function (result) {
            CourseListStore._collection = result.map(function (listData) {
                var list = new CourseList(listData);
                if (list.active) this.activeList = list;
                return list;
            }, CourseListStore);
            
            CourseListStore.initialized = CourseListStore.activeList !== undefined;
        });
    };
    
    CourseListStore.saveList = function (objectId, title, term) {
        return Parse.Cloud.run('updateCourseList', {objectId : objectId, title : title, term: term}).then(CourseListStore.retrieveCourseLists);
    };
    
    CourseListStore.createNewList = function (title, shared, term) {
        return Parse.Cloud.run('createCourseList', {title : title, shared : shared, term: term}).then(CourseListStore.retrieveCourseLists);
    };
    
    CourseListStore.deleteList = function (objectId) {
        return Parse.Cloud.run('deleteCourseList', {objectId : objectId}).then(CourseListStore.retrieveCourseLists);
    };
    
    CourseListStore.setActiveList = function (list) {
        CourseListStore.activeList.active = false;
        CourseListStore.activeList = list;
        CourseListStore.activeList.setActive().then(function () {
            CourseListStore.activeList.active = true;
        });
        
    };
    
    CourseListStore.clear = function () {
        CourseListStore._collection = [];
        CourseListStore.activeList = undefined;
        CourseListStore.initialized = false;
    };
    
    // Listen for logout event and clear data store on event
    $rootScope.$on('logout', CourseListStore.clear);
    
    return CourseListStore;
    
}]);

list.controller('ListController', ['$scope', 'AuthService', 'CourseListStore', '$modal', function ($scope, AuthService, CourseListStore, $modal) {
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
    
}]);

list.controller('CourseListModalController', ['$scope', 'CourseListStore', '$modalInstance', 'AlertStore', 'list', function ($scope, CourseListStore, $modalInstance, AlertStore, list) {
    $scope.courseListStore = CourseListStore;
    
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
    
    if (list !== undefined) {
        $scope.list = list;
        $scope.list.shared = false;
    } else {
        $scope.list = {
            title: undefined,
            newList: true,
            term: "2015-92",
            shared: false
        };
    }
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
            if (error.message) AlertStore.addMessage(error.message);
            else AlertStore.addMessage("An error occured while deleting " + $scope.list.title + ". Please try again.");
            $scope.$close();
        });
    };
    
}]);

course.directive('courseListView', function () {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: "app/components/list/directives/course-list-view.html"
    }
});
