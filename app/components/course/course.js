var course = angular.module('courseeater.course', ['ui.bootstrap', 'courseeater.retrieve']);

course.run(['CourseStore', 'CourseListStore', '$rootScope', function (CourseStore, CourseListStore, $rootScope) {
    $rootScope.listStore = CourseListStore;
    $rootScope.courseStore = CourseStore;
    $rootScope.$watch('listStore.activeList', function (newList, oldList) {
        if (newList === undefined) return;
        else if ($rootScope.courseStore.list === undefined) $rootScope.courseStore.setActiveList(newList);
        else if (oldList !== undefined && !oldList.courseCodes.equals(newList.courseCodes)) $rootScope.courseStore.setActiveList(newList);
        else if (oldList === undefined && newList !== undefined) $rootScope.courseStore.setActiveList(newList);
    });
}]);

course.factory('Course', ['$q', 'ScheduleRetriever', 'InstructorRetriever', function ($q, ScheduleRetriever, InstructorRetriever) {
    return function (courseCode, term, color) {
        
        var course = this;
        
        // Course relevant data
        this.courseCode = courseCode;
        this.term = term;
        
        // Set to true on first retrieval of remote data
        this.initialized = false;
        
        // Used to decide which buttons to display in search modals
        this.tracking = true;
        this.replacement = false;
        
        // Used for animated button states
        this.fetchingRemoteData = false;
        this.isSubmitting = null;
        this.result = null;
        
        // Asyncronous variable
        this.deferred = $q.defer();
        
        // FullSchedule Calendar configuration
        this.color = color;
        this.events = undefined;
        
        this.makeEvent = function () {
            // If event objects have already been created
            if (this.events !== undefined) return this.events;
            
            var title, start, end, end_front, end_back, start_front, start_back, days_held;
            
            // When course time is not available
            if (this.time === null) return [];
            
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
                };
            }, this);
            
            return this.events;
        };
        
        this.makeFinal = function () {
            if (this.finalEvent !== undefined) return this.finalEvent;
            if (this.final === null) return undefined;
            
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
        
        this.getLatestCourseData = function () {
            this.fetchingRemoteData = true;
            
            var course = this;
            
            return ScheduleRetriever.get_course(this.courseCode, this.term).then(function (response) {
                var classData = response[0];
            
                if (classData.course_data === undefined || classData.course_data == "null") {
                    return undefined;
                }
                
                var courseData = classData.course_data[0];
            
                course.name = classData.name;
                course.identifier = classData.identifier;
                
                course.cocoursesURL = classData.cocourses;
                course.prerequistesURL = classData.prerequisites;
                course.comments = classData.comments;
                
                course.type = courseData.type;
                course.sec = courseData.sec;
                
                course.placeURL = courseData.placeURL;
                course.place = courseData.place;
                
                course.days = courseData.time.days;
                course.time = courseData.time.clock;
                
                course.localEnr = courseData.localEnr;
                course.totalEnr = courseData.totalEnr;
                course.max = courseData.max;
                course.wl = courseData.wl;
                course.final = courseData.final;
                
                course.req = courseData.req;
                course.rstr = courseData.rstr;
                course.status = courseData.status;
                course.initialized = true;
                
                course.fetchingRemoteData = false;
                
                course.instructor = courseData.instructor;
                
                course.getInstructorData();
                
                course.deferred.resolve(course);
            });
            
        };
        
        this.getInstructorData = function () {
            this.instructor = this.instructor.map(function (instructor) {
                var instructor_data = {};
            
                if (instructor === "") return undefined;
                
                else if (instructor.indexOf("STAFF") !== -1) {                
                    instructor_data.first_name = "STAFF";
                    instructor_data.last_name = "STAFF";
                    instructor_data.staff = true;
                }
                else {
                    var split_name = instructor.split(",");
                    instructor_data.first_name = split_name[1].trim();
                    instructor_data.last_name = split_name[0].trim();
                    instructor_data.staff = false;
                }
                
                if (!instructor_data.staff && Object.keys(instructor_data).length > 0) {
                    InstructorRetriever.retrieve(instructor_data.last_name, instructor_data.first_name).then(function (result) {
                        if (result === undefined) return undefined;
                        instructor_data.rmp_id = result.pk_id;
                        instructor_data.rmp_avg_rating = result.averageratingscore_rf;
                        instructor_data.rmp_num_rating = result.total_number_of_ratings_i;
                    });
                }
                return instructor_data;
            });
        };
        
        this.findCoCourses = function (type) {
            var index = this.identifier.lastIndexOf(" ");
            
            // Add term to results before returning response
            var process = function (response) {
                if (response.length === 0) return [];
                return response[0].course_data.map(function (course) {
                    course.term = this.term;
                    return course;
                }, this);
            };
            
            return Retriever.get_co_courses(this.identifier.substring(0, index).trim(), this.identifier.substring(index).trim(), type, this.term).then(process.bind(this));
        };
        
        this.findReplacements = function () {
            var index = this.identifier.lastIndexOf(" ");
            
            // Remove this from the results before returning response
            var filter = function (response) {
                if (response.length === 0) return [];
                return response[0].course_data.filter(function (course) {
                    return course.courseCode != this.courseCode;
                }, this).map(function (course) {
                    course.term = this.term;
                    return course;
                }, this);
            };
            
            return Retriever.get_replacement_courses(this.identifier.substring(0, index).trim(), this.identifier.substring(index).trim(), this.type, this.term).then(filter.bind(this));
        };
        
        this.getLatestCourseData();
        
        return this;
        
    };
}]);

course.factory('ButtonConfiguration', function () {
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
        }
    };
    
    return ButtonConfiguration;
});

course.directive('classView', function () {
    return {
        templateUrl: "app/components/course/directives/class-view.html"
    };
});

course.directive('courseView', function () {
    return {
        templateUrl: "app/components/course/directives/course-view.html"
    };
});

course.directive('courseMiniView', function () {
    return {
        templateUrl: "app/components/course/directives/course-mini-view.html"
    };
});

course.directive('courseTitle', function () {
    return {
        templateUrl: "app/components/course/directives/course-title.html"
    };
});

course.directive('courseInfo', function () {
     return {
        templateUrl: "app/components/course/directives/course-info.html"
    };
});

course.directive('courseCode', function () {
    return {
        templateUrl: 'app/components/course/directives/course-code.html'
    };
});

course.directive('courseName', function () {
    return {
        templateUrl: 'app/components/course/directives/course-name.html'
    };
});

course.directive('courseInstructor', function () {
    return {
        scope: {
            instructor: "="  
        },
        templateUrl: 'app/components/course/directives/course-instructor.html'
    };
});

course.directive('courseActions', function () {
    return {
        templateUrl: "app/components/course/directives/course-actions.html"
    };
});

course.directive('courseMiniActions', function () {
    return {
        templateUrl: "app/components/course/directives/course-mini-actions.html",
    };
});

course.directive('courseSearch', function () {
    return {
        templateUrl: 'app/components/course/directives/course-search.html'
    };
});

course.directive('courseHeldDays', function () {
    return {
        scope: {
            days: "="
        },
        templateUrl: "app/components/course/directives/course-held-days.html"
    };
});

course.directive('courseTime', function () {
    return {
        scope: {
            time: "="
        },
        templateUrl: "app/components/course/directives/course-time.html"
    };
});

course.directive('coursePlace', function () {
    return {
        templateUrl: "app/components/course/directives/course-place.html"
    };
});

course.directive('courseProgress', function () {
    return {
        templateUrl: "app/components/course/directives/course-progress.html"
    };
});

course.directive('courseFinal', function () {
    return {
        templateUrl: "app/components/course/directives/course-final.html"
    };
});