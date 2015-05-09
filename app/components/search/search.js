var search = angular.module('courseeater.search', ['courseeater.course', 'courseeater.list', 'ui.bootstrap', 'angular.filter', 'jp.ng-bs-animated-button']);

search.factory('SearchStore', ['$http', function ($http) {
    var SearchStore = {};
    
    SearchStore.available_types = [];
    
    SearchStore.selected_type = "";
    
    SearchStore.clearSelectedType = function () {
        SearchStore.clearFilter();
        SearchStore.selected_type = "";
        SearchStore.results = undefined;
    };
    
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
            
            // Remove 'ALL' from listing
            response.data.splice(response.data.indexOf(" ALL"), 1);
            
            SearchStore.available_types = SearchStore.available_types.concat(response.data.map(function (department) {
                return {
                    name: department,
                    value: department,
                    type: 'department'
                };
            }));

        });
    };
    
    SearchStore.retrieve_ge_categories = function () {
        $http({
            url: 'php/search.php',
            method: "GET",
            params: {available_ge_categories: "Any"}
        }).then(function (response) {
            SearchStore.available_types = SearchStore.available_types.concat(response.data.map(function (category) {
                return {
                    name: category.name,
                    value: category.value,
                    type: 'category'
                } 
            }));
        });
    };
    
    SearchStore.get_type = function ($item, $model, $label) {
        if (SearchStore.selected_type.type == 'category') SearchStore.perform_search({category: SearchStore.selected_type.value});
        else SearchStore.perform_search({department: SearchStore.selected_type.value});
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
    
    SearchStore.retrieve_departments();
    SearchStore.retrieve_ge_categories();
    
    return SearchStore;
}]);

search.controller('SearchController', ['$scope', 'CourseStore', 'CourseListStore', 'TemporaryStore', 'SearchStore', 'ButtonConfiguration', function ($scope, CourseStore, CourseListStore, TemporaryStore, SearchStore, ButtonConfiguration) {
    $scope.temporaryStore = TemporaryStore;
    $scope.courseListStore = CourseListStore;
    $scope.courseStore = CourseStore;
    $scope.searchStore = SearchStore;
    
    $scope.buttonConfig = ButtonConfiguration;
    
    $scope.addCourse = function (course) {
        course.isSubmitting = true;
        $scope.courseStore.addCourse(course.courseCode).then(function (response) {
            course.result = 'success';
            course.isSubmitting = null;
        }, function (error) {
            course.result = 'error';
        });
    };
    
    $scope.removeCourse = function (course) {
        course.isSubmitting = true;
        $scope.courseStore.removeCourse(course.courseCode).then(function (response) {
            course.result = 'success';
        }, function (error) {
            course.result = 'error';
        });
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