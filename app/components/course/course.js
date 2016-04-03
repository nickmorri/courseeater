function CourseRun(CourseStore, CourseListStore, $rootScope) {
    $rootScope.listStore = CourseListStore;
    $rootScope.courseStore = CourseStore;
    $rootScope.$watch('listStore.activeList', function (newList, oldList) {
        if (newList === undefined) {
	        return;
        }
        else if ($rootScope.courseStore.list === undefined) {
	        $rootScope.courseStore.setActiveList(newList);
        }
        else if (oldList !== undefined && !oldList.courseCodes.equals(newList.courseCodes)) {
	        $rootScope.courseStore.setActiveList(newList);
        }
        else if (oldList === undefined && newList !== undefined) {
	        $rootScope.courseStore.setActiveList(newList);
        }
    });
}

function CourseFactory($q, Retriever) {
	
	function Course(term, course_code, color) {
		this.term = term;
		this.courseCode = course_code;
		
		// Set to true on first retrieval of remote data.
		this.initialized = false;
		
		// Used to decide which buttons to display in search modals.
        this.tracking = true;
        this.replacement = false;
        
        // Used for animated button states.
        this.fetchingRemoteData = false;
        this.isSubmitting = null;
        this.result = null;
        
        // Asyncronous variable.
        this.deferred = $q.defer();
        
        // FullSchedule Calendar configuration
        this.color = color;
        this.events = undefined;
        
        this.getLatestCourseData();
        
	}
	
	Course.prototype.getLatestCourseData = function () {
        this.fetchingRemoteData = true;
        
        return Retriever.get_course(this.term, this.courseCode).then(function (response) {
            var classData = response[0];
        
            if (classData === undefined || classData.course_data === undefined || classData.course_data == "null") {
                return undefined;
            }
            
            var courseData = classData.course_data[0];
        
            this.name = classData.name;
            this.identifier = classData.identifier;
            
            this.cocoursesURL = classData.cocourses;
            this.prerequistesURL = classData.prerequisites;
            this.comments = classData.comments;
            
            this.type = courseData.type;
            this.sec = courseData.sec;
            
            this.placeURL = courseData.placeURL;
            this.place = courseData.place;
            
            this.days = courseData.time.days;
            this.time = courseData.time.clock;
            
            this.localEnr = courseData.localEnr;
            this.totalEnr = courseData.totalEnr;
            this.max = courseData.max;
            this.wl = courseData.wl;
            this.final = courseData.final;
            
            this.req = courseData.req;
            this.rstr = courseData.rstr;
            this.status = courseData.status;
            this.initialized = true;
            
            this.fetchingRemoteData = false;
            
            this.instructor = courseData.instructor;
            
            this.deferred.resolve(this);
        }.bind(this));
        
    };
	
	Course.prototype.makeEvent = function () {
        // If event objects have already been created
        if (this.events !== undefined) {
            return this.events;
        }
        
        var title, start, end, end_front, end_back, start_front, start_back, days_held;
        
        // When course time is not available
        if (this.time == null) {
            return [];
        }
        
        // Title processing
        title = this.identifier.toUpperCase() + " - " + this.type.toUpperCase();
        
        // Time parsing

        // Course start time parts
        start_front = parseInt(this.time.start.split(":")[0], 10);
        start_back = this.time.start.split(":")[1].slice(0, 2);
        
        // Course end time parts
        end_front = parseInt(this.time.end.split(":")[0], 10);
        end_back = this.time.end.split(":")[1].slice(0, 2);
        
        // Adjust to a 24 hour clock
        if (this.time.am_pm == "PM" && end_front !== 12) end_front += 12;
        if (this.time.start == "PM" && start_front !== 12) start_front += 12;
        if (end_front > 12 && start_front !== 12) start_front += 12;
        
        // Formatting of time string
        if (start_front < 10) start_front = "0" + start_front;
        if (end_front < 10) end_front = "0" + end_front;
        start = "T" + start_front + ":" + start_back + ":00";
        end = "T" + end_front + ":" + end_back + ":00";
        
        // Day parsing
        days_held = this.days.map(function (day, index) {
            return getWeekday(this.indexOf(day));
        }, ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
        
        // Event object creation
        this.events = days_held.map(function (day) {
            return {
                id: this.courseCode,
                title: title,
                start: day + start + "Z",
                end: day + end + "Z",
                backgroundColor: this.color
            }
        }, this);
        
        return this.events;
	};
	
	Course.prototype.makeFinal = function () {
        if (this.finalEvent !== undefined) {
            return this.finalEvent;
        }
        if (this.final == null) {
            return undefined;
        }
        
        var day_held, start, end, end_front, end_back;

        // Course start time parts
        start_front = parseInt(this.final.clock.start.split(":")[0], 10);
        start_back = this.final.clock.start.split(":")[1].slice(0, 2);
        
        // Course end time parts
        end_front = parseInt(this.final.clock.end.split(":")[0], 10);
        end_back = this.final.clock.end.split(":")[1].slice(0, 2);
        
        // Adjust to a 24 hour clock
        if (this.final.clock.am_pm == "PM" && end_front !== 12) end_front += 12;
        if (this.final.clock.start == "PM" && start_front !== 12) start_front += 12;
        if (end_front > 12 && start_front !== 12) start_front += 12;
        
        // Formatting of time string
        if (start_front < 10) start_front = "0" + start_front;
        if (end_front < 10) end_front = "0" + end_front;
        start = "T" + start_front + ":" + start_back + ":00";
        end = "T" + end_front + ":" + end_back + ":00";
        
        var today = new Date();
        
        day_held = today.getFullYear() + "-" + this.final.month_index + "-" + this.final.day;
        
        //Event object creation
        this.finalEvent = {
            id: this.courseCode,
            title: this.identifier.toUpperCase() + " - " + this.type.toUpperCase(),
            start: day_held + start + "Z",
            end: day_held + end + "Z",
            backgroundColor: this.color
        };
        
        return this.finalEvent;
	};
	
	Course.prototype.findCoCourses = function (type) {
        var index = this.identifier.lastIndexOf(" ");
        
        // Add term to results before returning response
        return Retriever.get_co_courses(this.term, this.identifier.substring(0, index).trim(), this.identifier.substring(index).trim(), type).then(function (response) {
            return response.length === 0 ? [] : response[0].course_data.map(function (course) {
                course.term = this.term;
                return course;
            }, this);
        }.bind(this));
    };
    
    Course.prototype.findReplacements = function () {
        var index = this.identifier.lastIndexOf(" ");
        
        // Remove this from the results before returning response
        return Retriever.get_replacement_courses(this.term, this.identifier.substring(0, index).trim(), this.identifier.substring(index).trim(), this.type).then(function (response) {
            return response.length === 0 ? [] : response[0].course_data.filter(function (course) {
                return course.courseCode != this.courseCode;
            }, this).map(function (course) {
                course.term = this.term;
                return course;
            }, this);
        }.bind(this));
    };
	
	return function(course_code, term, color) {
		return new Course(term, course_code, color);
	};
	
}

function ButtonConfigurationFactory() {
    var ButtonConfiguration = {
        courseCodeAddOptions: {
            buttonDefaultText: 'Add',
            buttonSubmittingText: 'Adding',
            buttonErrorText: 'Whoops',
            buttonSuccessText: 'Added',
            buttonDefaultClass: 'btn-primary',
            buttonSuccessClass: 'btn-success',
            buttonSizeClass: 'form-control',
            buttonInitialIcon: 'glyphicon glyphicon-plus',
            buttonSubmittingIcon: 'glyphicon glyphicon-refresh',
            buttonSuccessIcon: 'glyphicon glyphicon-ok',
            onlyIcons: true
        },
        addOptions: {
            buttonDefaultText: 'Add',
            buttonSubmittingText: 'Adding...',
            buttonSuccessText: 'Added',
            buttonDefaultClass: 'btn-default',
            buttonSubmittingClass: 'btn-primary',
            buttonSuccessClass: 'btn-success',
            buttonSizeClass: 'col-xs-12',
            buttonInitialIcon: 'glyphicon glyphicon-plus',
            buttonSubmittingIcon: 'glyphicon glyphicon-refresh',
            buttonSuccessIcon: 'glyphicon glyphicon-ok',
            animationCompleteTime: '0'
        },
        removeOptions: {
            buttonDefaultText: 'Remove',
            buttonSubmittingText: 'Removing...',
            buttonSuccessText: 'Removed',
            buttonDefaultClass: 'btn-default',
            buttonSubmittingClass: 'btn-primary',
            buttonSuccessClass: 'btn-success',
            buttonSizeClass: 'col-xs-12',
            buttonInitialIcon: 'glyphicon glyphicon-minus',
            buttonSubmittingIcon: 'glyphicon glyphicon-refresh',
            buttonSuccessIcon: 'glyphicon glyphicon-ok',
            animationCompleteTime: '0'
        },
        replaceOptions: {
            buttonDefaultText: 'Replace',
            buttonSubmittingText: 'Replacing...',
            buttonSuccessText: 'Replaced',
            buttonDefaultClass: 'btn-default',
            buttonSubmittingClass: 'btn-primary',
            buttonSuccessClass: 'btn-success',
            buttonSizeClass: 'col-xs-12',
            buttonInitialIcon: 'glyphicon glyphicon-sort',
            buttonSubmittingIcon: 'glyphicon glyphicon-refresh',
            buttonSuccessIcon: 'glyphicon glyphicon-ok'
        },
        removeWithDropdownOptions: {
            buttonDefaultText: 'Remove',
            buttonSubmittingText: 'Removing...',
            buttonSuccessText: 'Removed',
            buttonDefaultClass: 'btn-default',
            buttonSubmittingClass: 'btn-primary',
            buttonSuccessClass: 'btn-success',
            buttonInitialIcon: 'glyphicon glyphicon-minus',
            buttonSubmittingIcon: 'glyphicon glyphicon-refresh',
            buttonSuccessIcon: 'glyphicon glyphicon-ok'
        },
        removeOptions: {
            buttonDefaultText: 'Remove',
            buttonSubmittingText: 'Removing...',
            buttonSuccessText: 'Removed',
            buttonDefaultClass: 'btn-default',
            buttonSubmittingClass: 'btn-primary',
            buttonSuccessClass: 'btn-success',
            buttonSizeClass: 'col-xs-12',
            buttonInitialIcon: 'glyphicon glyphicon-minus',
            buttonSubmittingIcon: 'glyphicon glyphicon-refresh',
            buttonSuccessIcon: 'glyphicon glyphicon-ok'
        }
    };
    
    return ButtonConfiguration;
}

function ClassViewDirective() {
    return {
        templateUrl: "app/components/course/directives/class-view.html"
    }
}

function CourseViewDirective() {
    return {
        templateUrl: "app/components/course/directives/course-view.html"
    }
}

function CourseMiniViewDirective() {
    return {
        templateUrl: "app/components/course/directives/course-mini-view.html"
    }
}

function CourseTitleDirective() {
    return {
        templateUrl: "app/components/course/directives/course-title.html"
    }
}

function CourseInfoDirective() {
     return {
        templateUrl: "app/components/course/directives/course-info.html"
    }
}

function CourseCodeDirective() {
    return {
        templateUrl: 'app/components/course/directives/course-code.html'
    }
}

function CourseNameDirective() {
    return {
        templateUrl: 'app/components/course/directives/course-name.html'
    }
}

function CourseInstructorDirective($http) {
    return {
        scope: {
            instructor: "="  
        },
        templateUrl: 'app/components/course/directives/course-instructor.html',
        link: function (scope, element, attributes) {
            
            var instructor_data = {};
            
            if (scope.instructor == "") {
	            return scope.instructor === undefined;
            }
            
            else if (scope.instructor.indexOf("STAFF") !== -1) {                
                instructor_data.first_name = "STAFF";
                instructor_data.last_name = "STAFF";
                instructor_data.staff = true;
            }
            else {
                var split_name = scope.instructor.split(",");
                instructor_data.first_name = split_name[1].trim();
                instructor_data.last_name = split_name[0].trim();
                instructor_data.staff = false;
            }
            
            if (!instructor_data.staff && Object.keys(instructor_data).length > 0) {
                $http({
                    url: 'php/ratemyprofessor.php',
                    method: 'GET',
                    params: {last_name: instructor_data.last_name}
                }).then(function (response) {
                    var potential_match = response.data.response.docs.find(function (potential) {
                        return potential.teacherlastname_t.toUpperCase() == this.toUpperCase();
                    }, response.config.params.last_name);
                    if (potential_match !== undefined) {
                        instructor_data.rmp_id = potential_match.pk_id;
                        instructor_data.rmp_avg_rating = potential_match.averageratingscore_rf;
                        instructor_data.rmp_num_rating = potential_match.total_number_of_ratings_i;
                    }
                    scope.instructor = instructor_data;
                });
            }
            scope.instructor = instructor_data;
        }
    }
}

function CourseActionsDirective() {
    return {
        templateUrl: "app/components/course/directives/course-actions.html"
    }
}

function CourseMiniActionsDirective() {
    return {
        templateUrl: "app/components/course/directives/course-mini-actions.html",
    }
}

function CourseSearchDirective() {
    return {
        templateUrl: 'app/components/course/directives/course-search.html'
    }
}

function CourseHeldDaysDirective() {
    return {
        scope: {
            days: "="
        },
        templateUrl: "app/components/course/directives/course-held-days.html"
    }
}

function CourseTimeDirective() {
    return {
        scope: {
            time: "="
        },
        templateUrl: "app/components/course/directives/course-time.html"
    }
}

function CoursePlaceDirective() {
    return {
        templateUrl: "app/components/course/directives/course-place.html"
    }
}

function CourseProgressDirective() {
    return {
        templateUrl: "app/components/course/directives/course-progress.html"
    }
}

function CourseFinalDirective() {
    return {
        templateUrl: "app/components/course/directives/course-final.html"
    }
}

angular.module('courseeater.course', ['ui.bootstrap'])
	.run(['CourseStore', 'CourseListStore', '$rootScope', CourseRun])
	.factory('Course', ['$q', 'Retriever', CourseFactory])
	.factory('ButtonConfiguration', [ButtonConfigurationFactory])
	.directive('classView', [ClassViewDirective])
	.directive('courseView', [CourseViewDirective])
	.directive('courseMiniView', [CourseMiniViewDirective])
	.directive('courseTitle', [CourseTitleDirective])
	.directive('courseInfo', [CourseInfoDirective])
	.directive('courseCode', [CourseCodeDirective])
	.directive('courseName', [CourseNameDirective])
	.directive('courseInstructor', ['$http', CourseInstructorDirective])
	.directive('courseActions', [CourseActionsDirective])
	.directive('courseMiniActions', [CourseMiniActionsDirective])
	.directive('courseSearch', [CourseSearchDirective])
	.directive('courseHeldDays', [CourseHeldDaysDirective])
	.directive('courseTime',[CourseTimeDirective])
	.directive('coursePlace', [CoursePlaceDirective])
	.directive('courseProgress', [CourseProgressDirective])
	.directive('courseFinal', [CourseFinalDirective]);