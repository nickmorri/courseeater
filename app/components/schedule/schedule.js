function ScheduleRun(CourseStore, CourseListStore) {
    if (!CourseListStore.initialized) {
	    CourseListStore.retrieveCourseLists();
    }
}

function ScheduleController($scope, CourseStore, CourseListStore, TemporaryStore, uiCalendarConfig, $uibModal) {
    $scope.temporaryStore = TemporaryStore;
    $scope.courseListStore = CourseListStore;
    $scope.courseStore = CourseStore;
    
    $scope.eventSource = [];
    
    $scope.courseClick = function (event, jsEvent, view) {
        $uibModal.open({
            templateUrl: 'app/components/schedule/directives/course-schedule-modal.html',
            controller: 'CourseScheduleModalController',
            resolve: {
                course: function () {
                    return $scope.courseStore.hasCourse(event.id) ? $scope.courseStore.getCourse(event.id) : $scope.temporaryStore.getCourse(event.id);
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
    
    $scope.makeImage = function () {
    	makeImage("#calendar", 'Schedule');
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
    
    $scope.$watch('courseListStore.activeList', function (newValue, oldValue) {
        if (newValue !== undefined || newValue !== oldValue) {
            $scope.temporaryStore.clear();
        }
    });
    
    $scope.temporaryStore.clear();
    
    if (!$scope.courseListStore.initialized) $scope.courseListStore.retrieveCourseLists();
    
}

function FinalScheduleController($scope, CourseStore, CourseListStore, TemporaryStore, uiCalendarConfig, $uibModal) {
    $scope.courseListStore = CourseListStore;
    $scope.courseStore = CourseStore;
    $scope.temporaryStore = TemporaryStore;
    
    $scope.eventSource = [];
    
    $scope.courseClick = function (event, jsEvent, view) {
        $uibModal.open({
            templateUrl: 'app/components/schedule/directives/course-schedule-modal.html',
            controller: 'CourseScheduleModalController',
            resolve: {
                course: function () {
                    return $scope.courseStore.hasCourse(event.id) ? $scope.courseStore.getCourse(event.id) : $scope.temporaryStore.getCourse(event.id);
                }
            }
        });
    };
    
    $scope.uiConfig = {
        calendar: {
            header: "",
            defaultView: "agendaWeek",
            minTime: "08:00:00",
            maxTime: "22:00:00",
            weekends: false,
            allDaySlot: false,
            contentHeight: 640,
            eventClick: $scope.courseClick
        }
    };
    
    $scope.findFinalWeekStart = function (finals) {
        if ($scope.eventSource[0].length == 0) return;
        var earliestFinal = $scope.eventSource[0].reduce(function (previous, current) {
            var previousDay = parseInt(previous.end.split('T')[0].split('-')[2], 10);
            var currentDay = parseInt(current.end.split('T')[0].split('-')[2], 10);
            return currentDay < previousDay ? current : previous;
        });
        
        var unordered_date = earliestFinal.end.split('T')[0].split('-');
        
        var year = parseInt(unordered_date[0], 10);
        var month = parseInt(unordered_date[1], 10);
        var day = parseInt(unordered_date[2], 10);
        
        var date = new Date(year, month - 1, day);
        
        function getMonday(d) {
            d = new Date(d);
            var day = d.getDay(),
                diff = d.getDate() - day + (day == 0 ? -6:1); // adjust when day is sunday
            return new Date(d.setDate(diff));
        }
        
        var monday = getMonday(date);
        
        var year = monday.getFullYear().toString();
        var month = (monday.getMonth() + 1).toString();
        month = month.length == 2 ? month : "0" + month;
        var day = monday.getDate()
        day = day.length == 2 ? day : ("0" + day);
        
        $scope.uiConfig.calendar.defaultDate = year + "-" + month + "-" + day;
        
    };
    
    $scope.makeImage = function () {
    	makeImage("#finals_calendar", 'Finals');
    };
    
    $scope.$watch('courseStore.finals', function (newValue, oldValue) {
        if (newValue !== undefined || newValue !== oldValue) {
            $scope.eventSource.clear();
            $scope.eventSource.push(newValue);
            $scope.findFinalWeekStart();
        }
    });
    
    if (!$scope.courseListStore.initialized) $scope.courseListStore.retrieveCourseLists();
    
}

function CourseScheduleModalController($scope, $uibModal, $uibModalInstance, CourseStore, TemporaryStore, ButtonConfiguration, course) {
    $scope.courseStore = CourseStore;
    $scope.temporaryStore = TemporaryStore;
    $scope.course = course;
    
    $scope.buttonConfig = ButtonConfiguration;
    
    $scope.addCourse = function (course) {
        course.isSubmitting = true;
        $scope.courseStore.addCourse(course.courseCode).then(function () {
            return $scope.temporaryStore.clear();
        }).then(function () {
            $scope.$close()
        });
    };
    
    $scope.removeCourse = function (course) {
        course.isSubmitting = true;
        $scope.courseStore.removeCourse(course.courseCode).then($scope.$close);
    };
    
    $scope.replaceCourse = function (course) {
        course.isSubmitting = true;
        $scope.courseStore.replaceCourse($scope.temporaryStore.course_code_for_replacement, course.courseCode).then(function () {
            return $scope.temporaryStore.clear();
        }).then(function () {
            $scope.$close()
        });

    };
    
    $scope.searchForCocourses = function (course, type) {
        $scope.temporaryStore.searchForCocourses(course, type).then($scope.displaySearch);
    };
    
    $scope.searchForReplacements = function (course, type) {
        $scope.temporaryStore.searchForReplacements(course, type).then($scope.displaySearch);
    };
    
    $scope.displaySearch = function (results, replacement) {
        TemporaryStore.filterCourses(true);
        $scope.$close();
    };
    
}

function ScheduleToolbarDirective() {
    return {
        templateUrl: 'app/components/schedule/directives/schedule-toolbar.html'
    }
}

angular.module('courseeater.schedule', ['courseeater.course', 'courseeater.list', 'ui.bootstrap', 'ui.calendar'])
	.run(['CourseStore', 'CourseListStore', ScheduleRun])
	.controller('ScheduleController', ['$scope', 'CourseStore', 'CourseListStore', 'TemporaryStore', 'uiCalendarConfig', '$uibModal', ScheduleController])
	.controller('FinalScheduleController', ['$scope', 'CourseStore', 'CourseListStore', 'TemporaryStore', 'uiCalendarConfig', '$uibModal', FinalScheduleController])
	.controller('CourseScheduleModalController', ['$scope', '$uibModal', '$uibModalInstance', 'CourseStore', 'TemporaryStore', 'ButtonConfiguration', 'course', CourseScheduleModalController])
	.directive('scheduleToolbar', ScheduleToolbarDirective);