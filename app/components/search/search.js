var search = angular.module('courseeater.search', ['courseeater.course', 'courseeater.list', 'ui.bootstrap']);

schedule.controller('SearchController', ['$scope', 'CourseStore', 'CourseListStore', 'TemporaryStore', '$http', function ($scope, CourseStore, CourseListStore, TemporaryStore, $http) {
    $scope.temporaryStore = TemporaryStore;
    $scope.courseListStore = CourseListStore;
    $scope.courseStore = CourseStore;
    
    $scope.selected_department = undefined;
    $scope.selected_category = undefined;
    $scope.ge_categories = undefined;
    $scope.departments = undefined;
    $scope.results = undefined;
    
    $scope.filter = undefined;
    
    $scope.retrieve_departments = function () {
        $http({
            url: 'php/search.php',
            method: "GET",
            params: {available_departments: "Any"}
        }).then(function (response) {
            $scope.departments = response.data;
        });
    };
    
    $scope.retrieve_ge_categories = function () {
        $http({
            url: 'php/search.php',
            method: "GET",
            params: {available_ge_categories: "Any"}
        }).then(function (response) {
            $scope.ge_categories = response.data;
        });
    };
    
    $scope.set_department = function (department) {
        $scope.selected_department = department;
        $scope.search_department($scope.selected_department);
    };
    
    $scope.set_category = function (category) {
        $scope.selected_category = category;
        $scope.search_ge_category($scope.selected_category);
    };
    
    $scope.search_department = function (department) {
        $http({
            url: 'php/search.php',
            method: "GET",
            params: {department: department}
        }).then(function (response) {
            $scope.results = response.data;
        });
    };
    
    
    $scope.search_ge_category = function (category) {
        $http({
            url: 'php/search.php',
            method: "GET",
            params: {category: category}
        }).then(function (response) {
            debugger
            $scope.results = response.data;
        });
    };
    
    $scope.retrieve_departments();
    $scope.retrieve_ge_categories();
    
    $scope.temporaryStore.clear();
    if (!$scope.courseListStore.initialized) $scope.courseListStore.retrieveCourseLists();
    
}]);