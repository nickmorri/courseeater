var schedule = angular.module('courseeater.schedule', ['ui.bootstrap', 'courseeater.auth', 'ui.calendar', 'courseeater.course']);

schedule.controller('ScheduleController', ['$scope', 'AuthService', 'CourseStore', 'TemporaryStore', 'uiCalendarConfig', '$modal', function ($scope, AuthService, CourseStore, TemporaryStore, uiCalendarConfig, $modal) {
    $scope.authService = AuthService;
    $scope.temporaryStore = TemporaryStore;
    $scope.courseStore = CourseStore;
    
    $scope.initialized = true;
    $scope.eventSource = [];
    
    $scope.courseClick = function (event, jsEvent, view) {
        var course = $scope.courseStore.getCourse(event.id);
        
        if (course === undefined) {
            course = $scope.temporaryStore.getCourse(event.id);
        }
        
        var modalInstance = $modal.open({
            templateUrl: 'app/components/schedule/directives/course-schedule-modal.html',
            controller: 'CourseScheduleModalController',
            resolve: {
                course: function () {
                    return course;
                }
            }
        });
        
    };
    
    $scope.uiConfig = {
        calendar: {
            defaultDate: getWeekday(0),
            header: "",
            defaultView: "agendaWeek",
            minTime: "08:00:00",
            maxTime: "22:00:00",
            weekends: false,
            columnFormat: { week: "ddd" },
            timeFormat: "",
            allDaySlot: false,
            contentHeight: 640,
            eventClick: $scope.courseClick
        }
    };
    
    $scope.$watch('courseStore.events', function (newValue, oldValue) {
        if (newValue !== undefined || newValue !== oldValue) {
            $scope.eventSource.clear();
            $scope.eventSource.push(newValue);
        }
    });
    
    $scope.$watch('temporaryStore.events', function (newValue, oldValue) {
        if (newValue !== undefined && newValue != [] && newValue != oldValue) {
            if ($scope.eventSource.length != 1) $scope.eventSource.pop();
            $scope.eventSource.push(newValue);
        }       
    });
    
}]);

schedule.controller('CourseScheduleModalController', ['$scope', '$modal', '$modalInstance', 'CourseStore', 'TemporaryStore', 'ButtonConfiguration', 'course', function ($scope, $modal, $modalInstance, CourseStore, TemporaryStore, ButtonConfiguration, course) {
    $scope.courseStore = CourseStore;
    $scope.temporaryStore = TemporaryStore;
    $scope.course = course;
    
    $scope.buttonConfig = ButtonConfiguration;
    
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
    
    $scope.searchForCocourses = function (course, type) {
        var query = new Parse.Query("Course");
        query.equalTo("courseIdentifier", course.courseIdentifier);
        query.equalTo("type", type.toTitleCase());
        query.find().then(function (results) {
            $scope.displaySearch(results, false)
        });
    };
    
    $scope.searchForReplacements = function (course, type) {
        var query = new Parse.Query("Course");
        query.equalTo("courseIdentifier", course.courseIdentifier);
        query.notEqualTo("courseCode", course.courseCode);
        query.equalTo("type", type.toTitleCase());
        query.find().then(function (results) {
            $scope.displaySearch(results, true)
        });
    };
    
    $scope.displaySearch = function (results, replacement) {
        $scope.temporaryStore.clear();
        for (var i = 0; i < results.length; i++) $scope.temporaryStore.addCourse(results[i], replacement);
        $scope.$close();
    };
    
}]);