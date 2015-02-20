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
        debugger;
        
        /* $scope.courseStore.addCourse(courseCode); */
    };
    
    if (!$scope.courseListStore.initialized) $scope.courseListStore.retrieveCourseLists();
    
}]);

search.directive('classSearchItem', function () {
    return {
        templateUrl: 'app/components/search/directives/class-search-item.html'
    }
});

search.directive('courseSearchItem', function () {
    return {
        templateUrl: 'app/components/search/directives/course-search-item.html'
    }
});

search.filter('classProps', function () {
    return function (items, term) {
        var filtered = [];
        
        // Standardize all strings in uppercase for case insensitivity
        term = term.toUpperCase();
        angular.forEach(items, function(item) {
            if (item.name.toUpperCase().indexOf(term) != -1) filtered.push(item);
            else if (item.identifier.toUpperCase().indexOf(term) != -1) filtered.push(item);
            else {
                for (var i = 0; i < item.course_data.length; i++) {
                    if (item.course_data[i].instructor.toUpperCase().indexOf(term) != -1) {
                        filtered.push(item);
                        break;
                    }
                    else if (item.course_data[i].courseCode.toUpperCase().indexOf(term) != -1) {
                        filtered.push(item);
                        break;
                    }
                }
            }
        });
        return filtered;
    };
});