var track = angular.module('courseeater.track', ['courseeater.course', 'courseeater.list', 'courseeater.alert', 'ui.bootstrap', 'jp.ng-bs-animated-button']);

track.controller('CourseSearchModalController', ['$scope', 'Course', 'CourseStore', 'TemporaryStore', '$modalInstance', 'ButtonConfiguration', 'section', function ($scope, Course, CourseStore, TemporaryStore, $modalInstance, ButtonConfiguration, section) {
    $scope.temporaryStore = TemporaryStore;
    $scope.courseStore = CourseStore;
    
    $scope.buttonConfig = ButtonConfiguration;
    
    $scope.section_restricted = true;
    $scope.target_section = section;
    
    $scope.addCourse = function (course) {
        course.isSubmitting = true;
        $scope.courseStore.addCourse(course.courseCode).then($scope.$close);
    };
    
    $scope.removeCourse = function (course) {
        course.isSubmitting = true;
        $scope.courseStore.removeCourse(course.courseCode).then($scope.$close);
    };
    
    $scope.replaceCourse = function (course) {
        course.isSubmitting = true;
        var originalCourse = $scope.courseStore.getEquivalentCourse(course);
        $scope.courseStore.replaceCourse(originalCourse.courseCode, course.courseCode).then($scope.$close);
    };
    
    // Clear temporary store regardless of result
    $modalInstance.result.then($scope.temporaryStore.clear, $scope.temporaryStore.clear);
 
}]);

track.controller('TrackController', ['$scope', 'CourseListStore', 'CourseStore', 'TemporaryStore', 'AlertStore', '$modal', 'ButtonConfiguration', function ($scope, CourseListStore, CourseStore, TemporaryStore, AlertStore, $modal, ButtonConfiguration) {
    $scope.courseListStore = CourseListStore;
    $scope.courseStore = CourseStore;
    $scope.temporaryStore = TemporaryStore;
    $scope.alertStore = AlertStore;
    
    $scope.buttonConfig = ButtonConfiguration;
    
    $scope.newCourseCode = undefined;
    $scope.isSubmitting = null;
    $scope.result = null;
    
    $scope.addCourse = function () {
        $scope.isSubmitting = true;
        $scope.courseStore.addCourse($scope.newCourseCode).then(function (response) {
            $scope.temporaryStore.clear();
            $scope.result = 'success';
            $scope.newCourseCode = undefined;
        }, function (error) {
            $scope.result = 'error';
            $scope.alertStore.addMessage(error.message, 'warning')
        });
    };
    
    $scope.removeCourse = function (course) {
        course.isSubmitting = true;
        $scope.courseStore.removeCourse(course.courseCode).then($scope.temporaryStore.clear, function (error) {
            course.result = 'error';    
            $scope.alertStore.addMessage(error.message, 'warning')
        });
    };
    
    $scope.searchForCocourses = function (course, type) {
        $scope.temporaryStore.searchForCocourses(course, type, $scope.displaySearch)  
    };

    
    $scope.searchForReplacements = function (course, type) {
        $scope.temporaryStore.searchForReplacements(course, type, $scope.displaySearch)  
    };
    
    $scope.displaySearch = function (results, replacement, section) {
        for (var i = 0; i < results.length; i++) {
            if (!CourseStore.hasCourse(results[i].attributes.courseCode)) {
                $scope.temporaryStore.addCourse(results[i], replacement);
            }
        }
        
        var modalInstance = $modal.open({
            templateUrl: 'app/components/course/directives/course-search-modal.html',
            controller: 'CourseSearchModalController',
            resolve: {
                section: function () {
                    return section;
                }
            }
        });  
        
    };
    
    if (!$scope.courseListStore.initialized) $scope.courseListStore.retrieveCourseLists();

    
}]);
