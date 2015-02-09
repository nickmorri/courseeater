var schedule = angular.module('courseeater.schedule', ['courseeater.course', 'courseeater.list', 'ui.bootstrap', 'ui.calendar']);

schedule.controller('ScheduleController', ['$scope', 'CourseStore', 'CourseListStore', 'TemporaryStore', 'uiCalendarConfig', '$modal', function ($scope, CourseStore, CourseListStore, TemporaryStore, uiCalendarConfig, $modal) {
    $scope.temporaryStore = TemporaryStore;
    $scope.courseListStore = CourseListStore;
    $scope.courseStore = CourseStore;
    
    $scope.eventSource = [];
    
    $scope.courseClick = function (event, jsEvent, view) {
        var course = $scope.courseStore.getCourse(event.id);
        
        if (course === undefined) course = $scope.temporaryStore.getCourse(event.id);
        
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
    
    $scope.makeImage = function () {
    	html2canvas($("#calendar"), {
    		onrendered: function(canvas) {
    			var destinationCanvas, destinationContext, today, link;
    		
    			destinationCanvas = document.createElement('canvas');
    			destinationCanvas.width = canvas.width;
    			destinationCanvas.height = canvas.height;
    			
    			destinationContext = destinationCanvas.getContext("2d");
    			destinationContext.rect(0, 0, canvas.width, canvas.height);
    			destinationContext.fillStyle = "white";
    			destinationContext.fill();
    
    			destinationContext.drawImage(canvas, 0, 0, canvas.width, canvas.height);
    			
    			destinationContext.font = '10pt Helvetica';
    			destinationContext.fillStyle = "black";
    			destinationContext.fillText("http://courseeater.com", canvas.width - 140, canvas.height - 8);
    			
    			today = new Date();
    			
    			link = document.createElement("a");
    			link.download = "Schedule | CourseEater - " + today.toLocaleDateString("en-US") + ".png";
    			link.href = destinationCanvas.toDataURL();
    			link.click();
    	    }
    	});
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
    
    if (!$scope.courseListStore.initialized) $scope.courseListStore.retrieveCourseLists();
    
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
        query.equalTo("term", course.term);
        query.equalTo("type", type.toTitleCase());
        query.find().then(function (results) {
            $scope.displaySearch(results, false)
        });
    };
    
    $scope.searchForReplacements = function (course, type) {
        var query = new Parse.Query("Course");
        query.equalTo("courseIdentifier", course.courseIdentifier);
        query.equalTo("term", course.term);
        query.notEqualTo("courseCode", course.courseCode);
        query.equalTo("type", type.toTitleCase());
        query.find().then(function (results) {
            $scope.displaySearch(results, true)
        });
    };
    
    $scope.displaySearch = function (results, replacement) {
        $scope.temporaryStore.clear();
        for (var i = 0; i < results.length; i++) {
            if (!CourseStore.hasCourse(results[i].attributes.courseCode)) {
                $scope.temporaryStore.addCourse(results[i], replacement);
            }
        }
        $scope.$close();
    };
    
}]);