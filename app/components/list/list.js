var list = angular.module('courseeater.list', ['ui.bootstrap']);

list.factory('CourseList', function (CourseStore) {
    return function (data) {
        this.title = data.attributes.title;
        this.active = data.attributes.active;
        this.courseRelation = data.relation("courses");
        this.owner = data.attributes.owner;
        this.shared = data.attributes.shared;
        this.id = data.id;
        
        this.term = data.attributes.term;
        
        this.getCourseQuery = function () {
            return this.courseRelation.query();
        };
        
        this.setActive = function () {
            var list = this;
            Parse.Cloud.run("changeActiveCourseList", {objectId : this.id}).then(function () {
                list.active = true;
            });
        };
        
    };
});

list.factory('CourseListStore', ['CourseList', 'AuthService', '$rootScope', function (CourseList, AuthService, $rootScope) {

    var CourseListStore = {};
    
    CourseListStore._collection = [];
    CourseListStore.authService = AuthService;
    
    CourseListStore.activeList = undefined;
    CourseListStore.initialized = false;
    
    CourseListStore.retrieveCourseLists = function () {
        var query = new Parse.Query("CourseList");
        query.equalTo("owner", AuthService.currentUser);
        return query.find().then(function (result) {
            CourseListStore._collection = [];
            var list;
            for (var i = 0; i < result.length; i++) {
                list = new CourseList(result[i]);
                CourseListStore._collection.push(list);
                
                if (list.active) CourseListStore.activeList = list;
            }
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
        CourseListStore.activeList.setActive()
        
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
        if ($scope.courseListStore.activeList == list) return;
        
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

list.controller('CourseListModalController', ['$scope', 'CourseListStore', '$modalInstance', 'list', function ($scope, CourseListStore, $modalInstance, list) {
    $scope.courseListStore = CourseListStore;
    
    $scope.available_terms = {"2015-14": "Spring 2015", "2015-03": "Winter 2015"};
    
    if (list !== undefined) {
        $scope.list = list;
        $scope.list.shared = false;
    } else {
        $scope.list = {
            title: undefined,
            newList: true,
            term: "2015-14",
            shared: false
        };
    }
    
    $scope.saveList = function () {
        $scope.courseListStore.saveList($scope.list.id, $scope.list.title, $scope.list.term).then($scope.$close);
    };
    
    $scope.createList = function () {
        $scope.courseListStore.createNewList($scope.list.title, $scope.list.shared, $scope.list.term).then($scope.$close);
    };
    $scope.deleteList = function () {
        $scope.courseListStore.deleteList($scope.list.id).then($scope.$close);
    };
    
}]);

course.directive('courseListView', function () {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: "app/components/list/directives/course-list-view.html"
    }
});
