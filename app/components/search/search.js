var search = angular.module('courseeater.search', ['courseeater.course', 'courseeater.list', 'ui.bootstrap']);

search.factory('SearchStore', ['$http', function ($http) {
    var SearchStore = {};
    
    SearchStore.ge_categories = [];
    SearchStore.departments = [];
    
    SearchStore.search_type = "";
    
    SearchStore.selected_department = undefined;
    SearchStore.selected_category = undefined;
    
    SearchStore.retrieving_results = undefined;
    SearchStore.results = undefined;
    
    SearchStore.filter = "";
    
    SearchStore.clearFilter = function () {
        SearchStore.filter = "";
    };
    
    SearchStore.retrieve_departments = function () {
        $http({
            url: 'php/search.php',
            method: "GET",
            params: {available_departments: "Any"}
        }).then(function (response) {
            SearchStore.departments = response.data;
        });
    };
    
    SearchStore.retrieve_ge_categories = function () {
        $http({
            url: 'php/search.php',
            method: "GET",
            params: {available_ge_categories: "Any"}
        }).then(function (response) {
            SearchStore.ge_categories = response.data;
        });
    };
    
    SearchStore.set_department = function (department) {
        SearchStore.selected_department = department;
        SearchStore.search_department(SearchStore.selected_department);
    };
    
    SearchStore.set_category = function (category) {
        SearchStore.selected_category = category;
        SearchStore.search_ge_category(SearchStore.selected_category);
    };
    
    SearchStore.perform_search = function (parameters) {
        SearchStore.retrieving_results = true;
        
        SearchStore.filter = "";
        
        $http({
            url: 'php/search.php',
            method: "GET",
            params: parameters,
        }).then(function (response) {
            SearchStore.results = response.data;
            SearchStore.retrieving_results = false;
        });
    }; 
    
    SearchStore.search_department = function (department) {
        SearchStore.perform_search({department: department});
    };
    
    
    SearchStore.search_ge_category = function (category) {
        SearchStore.perform_search({category: category});
    };
    
    SearchStore.retrieve_departments();
    SearchStore.retrieve_ge_categories();
    
    return SearchStore;
}]);

search.controller('SearchController', ['$scope', 'CourseStore', 'CourseListStore', 'TemporaryStore', 'SearchStore', function ($scope, CourseStore, CourseListStore, TemporaryStore, SearchStore) {
    $scope.temporaryStore = TemporaryStore;
    $scope.courseListStore = CourseListStore;
    $scope.courseStore = CourseStore;
    
    $scope.searchStore = SearchStore;
    
    $scope.addCourse = function (courseCode) {
        $scope.courseStore.addCourse(courseCode);
    };
    
    if (!$scope.courseListStore.initialized) $scope.courseListStore.retrieveCourseLists();
    
}]);

search.directive('classSearchItem', function () {
    return {
        templateUrl: 'app/components/search/directives/class-search-item.html'
    }
});

search.filter('classProps', function () {
    return function (items, term) {
        return (!items) ? [] : items.filter(function(item) {
            return item.name.toUpperCase().indexOf(this) != -1 || item.identifier.toUpperCase().indexOf(this) != -1 || item.course_data.some(function (course) {
                    return course.courseCode.indexOf(this) != -1 || course.instructor.some(function (instructor) {
                        return instructor.toUpperCase().indexOf(this) != -1;
                    }, this);
                }, this);
        }, term.toUpperCase());
    };
});