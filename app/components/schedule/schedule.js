// Returns the Date object for the Monday of the current week
var getWeekday = function (day) {
	var date, dayOfMonth, dayOfWeek, thisMonday;
	date = new Date();
	// Setting time to midnight for consistent Datetime parsing
	date.setHours(0,0,0,0);
	dayOfMonth = date.getDate();
	dayOfWeek = date.getDay();
	thisMonday = (dayOfMonth - dayOfWeek) + 1;
	date.setDate(thisMonday + day);
	return date.toISOString().split("T")[0];;
};

String.prototype.hash = function(){
	var hash = 0;
	if (this.length === 0) return hash;
	for (i = 0; i < this.length; i++) {
		char = this.charCodeAt(i);
		hash = ((hash << 5) - hash) + char;
		hash = hash & hash; // Convert to 32bit integer
	}
	return hash;
};

var schedule = angular.module('courseeater.schedule', ['ui.bootstrap', 'courseeater.auth', 'ui.calendar', 'courseeater.track']);

schedule.controller('ScheduleController', ['$scope', 'AuthService', 'CourseListStore', 'uiCalendarConfig', '$modal', function ($scope, AuthService, CourseListStore, uiCalendarConfig, $modal) {
    $scope.authService = AuthService;
    $scope.courseListStore = CourseListStore;
    
    if (!$scope.courseListStore.initialized) {
        $scope.courseListStore.retrieveCourseLists();
    }
    
    $scope.initialized = true;
    $scope.events = [];
    $scope.eventSource = [];
    
    $scope.courseClick = function (event, jsEvent, view) {
        var course = $scope.courseListStore.activeList.getCourse(event.id);
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
    
    $scope.$watch('courseListStore.activeList.eventSource', function (newValue, oldValue) {
        
        if (newValue !== undefined || newValue !== oldValue) {
            $scope.eventSource.splice(0, $scope.eventSource.length);
            $scope.eventSource.push(newValue);    
        }
    });
    
}]);

schedule.controller('CourseScheduleModalController', ['$scope', '$modalInstance', 'course', function ($scope, $modalInstance, course) {
    $scope.course = course;
    
    debugger
}]);