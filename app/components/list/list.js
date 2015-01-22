var list = angular.module('courseeater.list', ['courseeater.auth', 'ui.bootstrap']);

list.factory('CourseList', function (CourseStore) {
    return function (data) {
        this.title = data.attributes.title;
        this.active = data.attributes.active;
        this.courseRelation = data.relation("courses");
        this.owner = data.attributes.owner;
        this.shared = data.attributes.shared;
        this.id = data.id;
        
        this.getCourseQuery = function () {
            return this.courseRelation.query();
        };
        
        this.setActive = function () {
            this.active = true;
            Parse.Cloud.run("changeActiveCourseList", {title : this.title});
        };
        
        this.setShared = function (status) {
            var query = new Parse.Query("CourseList");
            query.equalTo("objectId", this.id);
            query.find().then(function (list) {
                list.set("shared", status);
                list.save();
            });
        };
        
    };
});

list.factory('CourseListStore', ['CourseList', 'AuthService', function (CourseList, AuthService) {
    
    var CourseListStore = {};
    
    CourseListStore._collection = [];
    CourseListStore.authService = AuthService;
    
    this.activeList = undefined;
    this.initialized = false;
    
    CourseListStore.retrieveCourseLists = function () {
        var query = new Parse.Query("CourseList");
        query.equalTo("owner", this.authService.currentUser);
        return query.find().then(function (result) {
            CourseListStore._collection = [];
            var list;
            for (var i = 0; i < result.length; i++) {
                list = new CourseList(result[i]);
                CourseListStore._collection.push(list);
                
                if (list.active) CourseListStore.activeList = list;
            }
            CourseListStore.initialized = true;
        });
    };
    
    CourseListStore.saveList = function (objectId, newTitle) {
        Parse.Cloud.run('updateCourseList', {
                objectId: objectId,
                newTitle: newTitle,
                shared: false
            }).then(function () {
                CourseListStore.retrieveCourseLists();
        });
    };
    
    CourseListStore.createNewList = function (title, shared) {
        Parse.Cloud.run('createCourseList', {title : title, shared : shared}).then(function () {
            CourseListStore.retrieveCourseLists();
        });
    };
    
    CourseListStore.setActiveList = function (list) {
        CourseListStore.activeList.active = false;
        CourseListStore.activeList = list;
        list.setActive();  
    };
    
    return CourseListStore;
    
}]);

list.controller('ListController', ['$scope', 'AuthService', 'CourseListStore', '$modal', function ($scope, AuthService, CourseListStore, $modal) {
    $scope.authService = AuthService;
    $scope.courseListStore = CourseListStore;
    
    $scope.setActiveList = function (list) {
        if ($(".navbar-header .navbar-toggle").css("display") != "none") $(".navbar-header .navbar-toggle").trigger("click");
        $scope.courseListStore.setActiveList(list);    
    };
    
    $scope.createList = function () {
        var modalInstance = $modal.open({
            templateUrl: 'app/components/list/directives/course-list-modal.html',
            controller: 'CourseListModalController',
            resolve: {
                list: function () {
                    return undefined;
                }
            }
        });
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

list.controller('CourseListModalController', ['$scope', 'CourseListStore', '$modalInstance', 'list', function ($scope, CourseListStore, $modalInstance, list) {
    $scope.courseListStore = CourseListStore;
    
    if (list !== undefined) {
        $scope.list = list;
    } else {
        $scope.list = {
            title: undefined,
            newList: true
        };
    }
    
    $scope.save = function () {
        $scope.courseListStore.saveList($scope.list.id, $scope.list.title);
        $scope.$close();
    };
    
    $scope.create = function () {
        $scope.courseListStore.createNewList($scope.list.title, false);
        $scope.$close();
    };
}]);

course.directive('courseListView', function () {
    return {
        templateUrl: "app/components/list/directives/course-list-view.html"
    }
});