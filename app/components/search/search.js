var search = angular.module('courseeater.search', ['courseeater.course', 'courseeater.store', 'courseeater.list', 'courseeater.retrieve', 'ui.bootstrap', 'angular.filter', 'jp.ng-bs-animated-button']);

search.config(['$stateProvider', function ($stateProvider) {
    $stateProvider.state('search', {
        url: '/search',
        templateUrl: 'app/components/search/partials/base.html',
        controller: 'SearchController',
        data: { pageTitle: 'Search'}
    });
}]);

search.run(['SearchStore', function (SearchStore) {
    SearchStore.retrieve();
}]);

search.factory('SearchStore', ['ScheduleRetriever', '$q', function (ScheduleRetriever, $q) {
    
    var Public = {};
    
    var Private = {
        available_types: []
    };
    
    Private.retrieve_types = function () {
        return $q(function (resolve, reject) {
            ScheduleRetriever.get_depts_and_ge_available().then(function (response) {
                response.remove("ALL");
                response.remove("ANY");
                
                Private.available_types = response;
                resolve();
            });
        });
    };
    
    Private.search = function (parameters) {
        return $q(function (resolve, reject) {
            ScheduleRetriever.retrieve(parameters, '2015-92').then(function (response) {
                resolve(response);
            });
        });
    };
    
    Public.search = function (type, value) {
        return Private.search(type === 'category' ? {category: value} : {department: value});
    };
    
    Public.getAvailableTypes = function () {
        return angular.copy(Private.available_types);
    };
    
    Public.retrieve = function () {
        return Private.retrieve_types();
    };
    
    return Public;
}]);

search.controller('SearchController', ['$scope', 'SearchStore', function ($scope, SearchStore) {

    $scope.filter = "";
    $scope.retrieving_results = null;
    $scope.results = null;
    $scope.selected_type = null;
    
    $scope.clear_filter = function () {
        $scope.filter = "";
    };
    
    $scope.available_types = function () {
        return SearchStore.getAvailableTypes();
    };
    
    $scope.get_type = function ($item, $model, $label) {
        $scope.retrieving_results = true;
        SearchStore.search($item.type, $item.value).then(function (results) {
            $scope.results = results;
            $scope.retrieving_results = false;
        });
    };
    
    $scope.clear_selected_type = function () {
        $scope.clear_filter();
        $scope.selected_type = "";
        $scope.results = undefined;
    };
    
}]);

search.directive('classSearchItem', function () {
    return {
        templateUrl: 'app/components/search/directives/class-search-item.html'
    };
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