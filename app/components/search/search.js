(function () {
    'use strict';

    var module_dependencies = ['courseeater.course', 'courseeater.list', 'courseeater.retrieve', 'ui.bootstrap', 'angular.filter', 'jp.ng-bs-animated-button'];

    angular
        .module('courseeater.search', module_dependencies)
        .config(SearchConfig)
        .factory('SearchStore', SearchStore)
        .controller('SearchController', SearchController)
        .directive('classSearchItem', ClassSearchItem)
        .filter('classProps', ClassPropsFilter);

    function SearchConfig ($httpProvider) {
        $httpProvider.defaults.useXDomain = true;
    }

    SearchStore.$inject = ['CourseListStore', 'Retriever'];
    function SearchStore (CourseListStore, Retriever) {
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
            Retriever.get_depts_available().then(function (response) {
                // Remove 'ALL' from listing
                if (response[0].value.indexOf("ALL") != -1) response.splice(0, 1);

                SearchStore.available_types = SearchStore.available_types.concat(response);
            });
        };

        SearchStore.retrieve_ge_categories = function () {
            Retriever.get_ge_available().then(function (response) {
                // Remove 'ALL' from listing
                if (response[0].value.indexOf("ANY") != -1) response.splice(0, 1);

                SearchStore.available_types = SearchStore.available_types.concat(response);
            });
        };

        SearchStore.get_type = function ($item, $model, $label) {
            if (SearchStore.selected_type.type == 'category') SearchStore.perform_search({category: SearchStore.selected_type.value});
            else SearchStore.perform_search({department: SearchStore.selected_type.value});
        };

        SearchStore.perform_search = function (parameters) {
            SearchStore.retrieving_results = true;

            SearchStore.filter = "";

            CourseListStore.activeList.term

            Retriever.retrieve(parameters, CourseListStore.activeList.term).then(function (response) {
                SearchStore.results = response;
                SearchStore.retrieving_results = false;
            });
        };

        SearchStore.retrieve_departments();
        SearchStore.retrieve_ge_categories();

        return SearchStore;
    }

    SearchController.$inject = ['$scope', 'CourseStore', 'CourseListStore', 'TemporaryStore', 'SearchStore', 'ButtonConfiguration'];
    function SearchController ($scope, CourseStore, CourseListStore, TemporaryStore, SearchStore, ButtonConfiguration) {
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

    }

    function ClassSearchItem () {
        return {
            templateUrl: 'app/components/search/directives/class-search-item.html'
        };
    }

    function ClassPropsFilter () {
        return function (items, term) {
            return (!items) ? [] : items.filter(function(item) {
                return item.name.toUpperCase().indexOf(this) != -1 || item.identifier.toUpperCase().indexOf(this) != -1 || item.course_data.some(function (course) {
                        return course.courseCode.indexOf(this) != -1 || course.instructor.some(function (instructor) {
                            return instructor.toUpperCase().indexOf(this) != -1;
                        }, this);
                    }, this);
            }, term.toUpperCase());
        };
    }

}());