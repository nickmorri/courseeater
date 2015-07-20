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
    SearchStore.retrieveTypes();
}]);

search.factory('SearchStore', ['ScheduleRetriever', '$q', function (ScheduleRetriever, $q) {
    
    var Public = {};
    
    var Private = {
        retrieving: false,
        filter: null,
        selected_type: null,
        available_types: [],
        results: null
    };
    
    Public.retrieveTypes = function () {
        ScheduleRetriever.get_depts_and_ge_available().then(function (response) {
            Private.available_types = response;
        });
    };
    
    Private.search = function (parameters) {
        Private.retrieving = true;
        return ScheduleRetriever.retrieve(parameters, '2015-92').then(function (response) {
            Private.retrieving = false;
            Private.results = response;
            return response;
        });
    };
    
    Public.search = function (type, value) {
        Private.search(type === 'category' ? {category: value} : {department: value});
    };
    
    Public.getAvailableTypes = function () {
        return angular.copy(Private.available_types);
    };
    
    Public.clearFilter = function () {
        Private.filter = '';
    };
    
    Public.isRetrieving = function () {
        return Private.retrieving;
    };
    
    Public.clearSelectedType = function () {
        Private.selected_type = null;
    };
    
    Public.getResults = function () {
        return Private.results;
    };
    
    Public.clearResults = function () {
        Private.results = null;
    };
    
    Public.hasResults = function () {
        return Private.results !== null;
    };
    
    return Public;
}]);

search.controller('SearchController', ['$scope', 'SearchStore', function ($scope, SearchStore) {
    
    $scope.isRetrieving = function () {
        return SearchStore.isRetrieving();
    };
    
    $scope.clearFilter = function () {
        SearchStore.clearFilter();
    };
    
    $scope.getAvailableTypes = function () {
        return SearchStore.getAvailableTypes();
    };
    
    $scope.search = function ($item, $model, $label) {
        SearchStore.search($item.type, $item.value);
    };
    
    $scope.clearSelectedType = function () {
        SearchStore.clearFilter();
        SearchStore.clearSelectedType();
        $scope.results = undefined;
    };
    
    $scope.getResults = function () {
        return SearchStore.getResults();
    };
    
    $scope.hasResults = function () {
        return SearchStore.hasResults();
    };
    
}]);

search.directive('classSearchItem', function () {
    return {
        templateUrl: 'app/components/search/directives/class-search-item.html'
    };
});

search.filter('classProps', function () {
    return function (items, term) {
        return term === undefined ? items : (!items) ? [] : items.filter(function(item) {
            return item.name.toUpperCase().indexOf(this) != -1 || item.identifier.toUpperCase().indexOf(this) != -1 || item.course_data.some(function (course) {
                    return course.courseCode.indexOf(this) != -1 || course.instructor.some(function (instructor) {
                        return instructor.toUpperCase().indexOf(this) != -1;
                    }, this);
                }, this);
        }, term.toUpperCase());
    };
});