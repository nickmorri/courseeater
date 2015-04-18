var course = angular.module('courseeater.course', ['ui.bootstrap']);

course.run(['CourseStore', 'CourseListStore', '$rootScope', function (CourseStore, CourseListStore, $rootScope) {
    $rootScope.listStore = CourseListStore;
    $rootScope.courseStore = CourseStore;
    $rootScope.$watch('listStore.activeList', function (newList, oldList) {
        if (newList !== undefined && newList !== oldList) {
            $rootScope.courseStore.setCourseCodes(newList.courseCodes, newList.id);
        }
    });
}]);

course.factory('Course', ['$http', function ($http) {
    return function (courseCode, color) {
        
        var course = this;
        
        // Course relevant data
        this.courseCode = courseCode;
        
        // SHOULD ONLY BE A TEMPORARY FIX
        this.term = "2015-14";
        
        // Set to true on first retrieval of remote data
        this.initialized = false;
        
        // Used to decide which buttons to display in search modals
        this.tracking = true;
        this.replacement = false;
        
        // Used for animated button states
        this.fetchingRemoteData = false;
        this.isSubmitting = null;
        this.result = null;
        
        // FullSchedule Calendar configuration
        this.color = color;
        this.events = undefined;
        
        this.makeEvent = function () {
            // If event objects have already been created
            if (this.events !== undefined) return this.events;
            
            var title, start, end, end_front, end_back, start_front, start_back, days_held;
            
            // When course time is not available
            if (this.time == null) return [];
            
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
        
        this.makeFinal = function () {
            if (this.finalEvent !== undefined) return this.finalEvent;
            
            var starting_day, final_string, title, day_held, time, start, end, end_front, end_back;
            
            // Static value that currently has to be manually changed each quarter..
            starting_day = "2015-06-";
            
            if (this.final == undefined || this.final.indexOf("TBA") !== -1) {
                return undefined;
            }
            else {
                final_string = this.final;
            }
            
            // Title processing
            title = this.identifier.toUpperCase() + " - " + this.type.toUpperCase();
            // Day processing
            day_held = starting_day + final_string.split(", ")[1].split(" ")[1];
            
            if (day_held.split("-")[2].length == 1) {
                day_held = [day_held.slice(0, day_held.length - 1), "0", day_held.slice(day_held.length - 1)].join('');
            }
            
            // Time parsing
            time = final_string.split("-");
            start = time[0].split(", ")[2];
            start = parseInt(start.split(":")[0], 10);
            end = time[1];
            if (end.indexOf("am") !== -1) {
                end = end.split("am")[0];
                end_front = parseInt(end.split(":")[0], 10);
                end_back = parseInt(end.split(":")[1], 10);
                if (end_back === 0) {
                    end_back = "00";
                }
                start = "0" + start;
            } else {
                end = end.split("pm")[0];
                end_front = parseInt(end.split(":")[0], 10);
                end_back = parseInt(end.split(":")[1], 10);
                if (end_front !== 12) {
                    start += 12;
                    end_front += 12;
                }
                if (end_back === 0) {
                    end_back = "00";
                }
            }
            start = "T" + start + ":" + time[0].split(", ")[2].split(":")[1] + ":00";
            end = "T" + end_front + ":" + end_back + ":00";
            
            //Event object creation
            this.finalEvent = {
                id: this.courseCode,
                title: title,
                start: day_held + start + "Z",
                end: day_held + end + "Z",
                backgroundColor: this.color
            };
            
            return this.finalEvent;
        };
        
        this.getLatestCourseData = function () {
            this.fetchingRemoteData = true;
            
            return $http({
                url: 'php/search.php',
                method: "GET",
                params: {course_code: this.courseCode}
            });
        };
        
        this.findCoCourses = function (type) {
            return $http({
                url: 'php/search.php',
                method: 'GET',
                params: {
                    course_code_cocourses: this.cocoursesURL,
                    type: type
                } 
            });
        };
        
        this.findReplacements = function () {
            
            var index = this.identifier.lastIndexOf(" ");
            
            return $http({
                url: 'php/search.php',
                method: 'GET',
                params: {
                    replacement_course_num: this.identifier.substring(index).trim(),
                    department: this.identifier.substring(0, index).trim(),
                    type: this.type
                }
            });  
        };
        
        this.fetchRateMyProfessor = function () {
            this.instructor.forEach(function (instructor) {
                if (!instructor.staff) {
                    $http({
                        url: 'php/ratemyprofessor.php',
                        method: 'GET',
                        params: {last_name: instructor.last_name}
                    }).then(function (response) {
                        var potential_match = response.data.response.docs.find(function (potential) {
                            return potential.teacherlastname_t.toUpperCase() == this.toUpperCase();
                        }, response.config.params.last_name);
                        
                        if (potential_match !== undefined) {
                            var instructor = course.instructor.find(function (instructor) {
                                return instructor.last_name.toUpperCase() === this.teacherlastname_t.toUpperCase() && instructor.first_name[0].toUpperCase() === this.teacherfirstname_t[0].toUpperCase()
                            }, potential_match);
                            
                            instructor.rmp_id = potential_match.pk_id;
                            instructor.rmp_avg_rating = potential_match.averageratingscore_rf;
                            instructor.rmp_num_rating = potential_match.total_number_of_ratings_i;
                        }
                    });
                }
            });
        };
        
        this.processLatestData = function (response) {

            var classData = response.data[0];
            
            if (classData.course_data === undefined) debugger
            
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
            
            course.instructor = courseData.instructor.map(function (instructor) {
                if (instructor.indexOf("STAFF") !== -1) {
                    return {
                        first_name: "STAFF",
                        last_name: "STAFF",
                        staff: true
                    }
                }
                else {
                    var split_name = instructor.split(",");
                    return {
                        first_name: split_name[1].trim(),
                        last_name: split_name[0].trim(),
                        staff: false,
                        rmp_id: undefined,
                        rmp_avg_rating: undefined,
                        rmp_num_rating: undefined
                    }
                }
            });
            
            course.fetchRateMyProfessor();
            
        };
        
        return {response: this.getLatestCourseData().then(this.processLatestData), course: this};
        
    };
}]);

course.factory('TemporaryStore', ['Course', function (Course) {
    var TemporaryStore = [];
    
    TemporaryStore.courses = [];
    TemporaryStore.events = [];
    
    TemporaryStore.section_restricted = true;
    TemporaryStore.target_section = undefined;
    
    // Course code of course being considered for replacement
    TemporaryStore.course_code_for_replacement = undefined;
    
    TemporaryStore.empty = function () {
        return TemporaryStore.size() === 0;
    };
    
    TemporaryStore.size = function () {
        return TemporaryStore.courses.length;
    };
    
    TemporaryStore.clear = function () {
        TemporaryStore.courses = [];
        TemporaryStore.events = [];
        TemporaryStore.section_restricted = true;
        TemporaryStore.target_section = undefined;
        TemporaryStore.excluded_course_codes = [];
    };
        
    TemporaryStore.storeCourse = function (course) {
        TemporaryStore.courses.push(course);
        
        // If section restriction is in effect we should only generate event objects for course which meet the restriction. 
        // There may be a better way to do this if we have a self regulating event store.
        if (TemporaryStore.section_restricted && course.sec.startsWith(TemporaryStore.target_section)) {
            TemporaryStore.events = TemporaryStore.events.concat(course.makeEvent());    
        }
        
    };
    
    TemporaryStore.addCourse = function (course, replacement) {
        var request = new Course(course.courseCode, "black");
        request.response.then(function () {
            request.course.tracking = false;
            request.course.replacement = replacement;
            TemporaryStore.storeCourse(request.course);
        });
    };
    
    TemporaryStore.hasCourse = function (courseCode) {
        return TemporaryStore.getCourse(courseCode) === undefined;
    }
    
    TemporaryStore.getCourse = function (courseCode) {
        return TemporaryStore.courses.find(function (course) {
            return course.courseCode == this;
        }, courseCode);
    };
    
    TemporaryStore.filterCourses = function (filter) {
        var target_courses;
        
        // Set section to user desired section
        TemporaryStore.section_restricted = filter; 
            
        // Remove event objects from temporary store
        TemporaryStore.events.clear();
        
        // If filtering return courses whose section matches the target section, otherwise return all courses
        target_courses = TemporaryStore.section_restricted ? TemporaryStore.courses.filter(function (course) {
            return course.sec.startsWith(this);
        }, TemporaryStore.target_section) : TemporaryStore.courses;
        
        // Generate event objects
        TemporaryStore.events = target_courses.reduce(function (courses, course) {
            return courses.concat(course.makeEvent());
        }, []);
    };
    
    TemporaryStore.searchForCocourses = function (course, type, callback) {
        TemporaryStore.clear();
        
        // Get index 0 for courses with sec e.g. A1
        TemporaryStore.target_section = course.sec.charAt(0);
        return course.findCoCourses(type).then(function (response) {
            response.data[0].course_data.forEach(function (course) {
                if (course.type == this) TemporaryStore.addCourse(course, false);
            }, response.config.params.type);
        })
    };
    
    TemporaryStore.searchForReplacements = function (course, type, callback) {
        TemporaryStore.clear();
        
        // Add courseCode of course potentially being replaced
        TemporaryStore.course_code_for_replacement = course.courseCode.toString();
        
        // Get index 0 for courses with sec e.g. A1
        TemporaryStore.target_section = course.sec.charAt(0);
        
        return course.findReplacements().then(function (response) {
            response.data[0].course_data.filter(function (course) {
                return course.type == this && TemporaryStore.course_code_for_replacement != course.courseCode.toString();
            }, response.config.params.type).forEach(function (course) {
                TemporaryStore.addCourse(course, true);
            });
        });
    };
    
    return TemporaryStore;
    
}]);

course.factory('CourseStore', ['Course', '$rootScope', function (Course, $rootScope) {
    var CourseStore = {};
    
    CourseStore.listID = undefined;
    CourseStore.courseCodes = undefined;
    
    CourseStore.initialized = false;
    CourseStore.num_loading_courses = 0;
    CourseStore._collection = [];
    
    // FullCalendar EventSources
    CourseStore.events = [];
    CourseStore.finals = [];
    
    // Resonable colors to look at for FullCalendar events
    CourseStore.colors = ["red", "green", "blue", "purple", "orange", "brown", "burlywood", "cadetblue", "coral", "darkcyan", "darkgoldenrod", "darkolivegreen"];
    
    CourseStore.addCourse = function (courseCode) {
        return Parse.Cloud.run('addCourse', {courseCode : courseCode}).then(function (latestCourseCodes) {
            CourseStore.fetchCourses(latestCourseCodes);
        });
    };
    
    CourseStore.removeCourse = function (courseCode) {    
        return Parse.Cloud.run('removeCourse', {courseCode : courseCode}).then(function (latestCourseCodes) {
            CourseStore.fetchCourses(latestCourseCodes);
        });
    };
        
    CourseStore.replaceCourse = function (oldCourseCode, newCourseCode) {
        return Parse.Cloud.run('removeCourse', {courseCode : oldCourseCode}).then(function () {
            return Parse.Cloud.run('addCourse', {courseCode : newCourseCode}).then(function (latestCourseCodes) {
                CourseStore.fetchCourses(latestCourseCodes);
            });
        });
    };
    
    CourseStore.setCourseCodes = function (courseCodes, listID) {
        if (listID !== this.listID) {
            CourseStore.clear()
            CourseStore.fetchCourses(courseCodes);
            this.listID = listID;
        }
        
    };
    
    CourseStore.fetchCourses = function (courseCodes) {
        CourseStore.clearCourses();
        CourseStore.clearSchedule();
        if (courseCodes) this.courseCodes = courseCodes;
        this.courseCodes.forEach(function (courseCode) {
            this.retrieveCourse(courseCode);
        }, CourseStore);
    };
    
    CourseStore.retrieveCourse = function (courseCode) {
        CourseStore.num_loading_courses++;
        var request = new Course(courseCode);
        request.response.then(function () {
            CourseStore.storeCourse(request.course);
            CourseStore.num_loading_courses--;
            CourseStore.initialized = CourseStore.num_loading_courses == 0;
        });
    };
    
    CourseStore.empty = function () {
        return CourseStore._collection.length === 0;
    };
    
    CourseStore.getCourses = function () {
        return CourseStore._collection;
    };
    
    CourseStore.hasCourse = function (courseCode) {
        return CourseStore.getCourse(parseInt(courseCode)) !== undefined;
    };
    
    CourseStore.getCourse = function (courseCode) {
        return CourseStore._collection.find(function (course) {
            return course.courseCode === courseCode;
        }, courseCode);
    };
    
    CourseStore.getEquivalentCourse = function (course) {
        return CourseStore._collection.find(function (course) {
            return this.identifier == course.identifier
        }, course);
    };
    
    CourseStore.storeCourse = function (course) {
        course.color = CourseStore.getColor(course);
        CourseStore._collection.push(course);
        CourseStore.storeEvent(course.makeEvent());
        CourseStore.storeFinal(course.makeFinal());
    };
    
    CourseStore.storeEvent = function (event) {
        if (event === undefined) return false;
        CourseStore.events = CourseStore.events.concat(event);
    };
    
    CourseStore.storeFinal = function (event) {
        if (event === undefined) return false;
        CourseStore.finals = CourseStore.finals.concat(event);
    };
    
    CourseStore.clearCourses = function () {
        CourseStore.courseCodes = [];
        CourseStore._collection = [];
    };
    
    CourseStore.clearSchedule = function () {
        CourseStore.colors = ["red", "green", "blue", "purple", "orange", "brown", "burlywood", "cadetblue", "coral", "darkcyan", "darkgoldenrod", "darkolivegreen"];
        CourseStore.events = [];
        CourseStore.finals = [];
    };
    
    CourseStore.clear = function () {
        CourseStore.listID = undefined;
        CourseStore.initialized = false;
        CourseStore.clearCourses();
        CourseStore.clearSchedule();
    };
    
    CourseStore.getColor = function (course) {
        var equivalent_course = CourseStore.getEquivalentCourse(course);
        if (equivalent_course) return equivalent_course.color;
        
        // Random color for a class
        var hash = Math.abs(course.identifier.hash()) % CourseStore.colors.length;
        return CourseStore.colors.splice(CourseStore.colors.indexOf(CourseStore.colors[hash]), 1)[0];
    };
    
    // Listen for logout event and clear data store on event
    $rootScope.$on('logout', CourseStore.clear);
    
    return CourseStore;
    
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
            buttonSizeClass: 'col-xs-10',
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
});

course.directive('classView', function () {
    return {
        templateUrl: "app/components/course/directives/class-view.html"
    }
});

course.directive('courseView', function () {
    return {
        templateUrl: "app/components/course/directives/course-view.html"
    }
});

course.directive('courseMiniView', function () {
    return {
        templateUrl: "app/components/course/directives/course-mini-view.html"
    }
})

course.directive('courseTitle', function () {
    return {
        templateUrl: "app/components/course/directives/course-title.html"
    }
});

course.directive('courseInfo', function () {
     return {
        templateUrl: "app/components/course/directives/course-info.html"
    }
});

course.directive('courseCode', function () {
    return {
        templateUrl: 'app/components/course/directives/course-code.html'
    }
});

course.directive('courseName', function () {
    return {
        templateUrl: 'app/components/course/directives/course-name.html'
    }
});

course.directive('courseInstructor', function () {
    return {
        scope: {
            instructor: "="  
        },
        templateUrl: 'app/components/course/directives/course-instructor.html'
    }
});

course.directive('courseActions', function () {
    return {
        templateUrl: "app/components/course/directives/course-actions.html"
    }
});

course.directive('courseSearch', function () {
    return {
        templateUrl: 'app/components/course/directives/course-search.html'
    }
});

course.directive('courseHeldDays', function () {
    return {
        scope: {
            days: "="
        },
        templateUrl: "app/components/course/directives/course-held-days.html"
    }
});

course.directive('courseTime', function () {
    return {
        scope: {
            time: "="
        },
        templateUrl: "app/components/course/directives/course-time.html"
    }
});

course.directive('coursePlace', function () {
    return {
        templateUrl: "app/components/course/directives/course-place.html"
    }
});

course.directive('courseProgress', function () {
    return {
        templateUrl: "app/components/course/directives/course-progress.html"
    }
});

course.directive('courseFinal', function () {
    return {
        templateUrl: "app/components/course/directives/course-final.html"
    }
});

course.filter('section', function() {
    return function (input, sec, enabled) {
        return !enabled ? input : input.filter(function (course) {
            return course.sec.indexOf(this) == 0;
        }, sec);
    };
});

if (!Array.prototype.find) {
  Array.prototype.find = function(predicate) {
    if (this == null) {
      throw new TypeError('Array.prototype.find called on null or undefined');
    }
    if (typeof predicate !== 'function') {
      throw new TypeError('predicate must be a function');
    }
    var list = Object(this);
    var length = list.length >>> 0;
    var thisArg = arguments[1];
    var value;

    for (var i = 0; i < length; i++) {
      value = list[i];
      if (predicate.call(thisArg, value, i, list)) {
        return value;
      }
    }
    return undefined;
  };
}