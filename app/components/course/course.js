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
    return function (courseCode) {
        
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
        this.color = undefined;
        this.events = undefined;
        
        this.makeEvent = function () {
            if (this.events !== undefined) return this.events;
            
            var calendarCourses, title, days, heldDays, time, start, end, event, i, endFront, endBack, startFront, startBack;
            if (this.time == null) return [];
            // Title processing
            title = this.identifier.toUpperCase() + " - " + this.type.toUpperCase();
            // Day parsing
            heldDays = [];
            if (this.days.indexOf("Mon") > -1) heldDays.push(getWeekday(0));
            if (this.days.indexOf("Tue") > -1) heldDays.push(getWeekday(1));
            if (this.days.indexOf("Wed") > -1) heldDays.push(getWeekday(2));
            if (this.days.indexOf("Thu") > -1) heldDays.push(getWeekday(3));
            if (this.days.indexOf("Fri") > -1) heldDays.push(getWeekday(4));
            // Time parsing

            // Further breaking things down into 4 distinct parts.
            startFront = parseInt(this.time.start.split(":")[0], 10);
            startBack = this.time.start.split(":")[1].slice(0, 2);
            endFront = parseInt(this.time.end.split(":")[0], 10);
            endBack = this.time.end.split(":")[1].slice(0, 2);
            // Processing of these parts
            
            if (this.time.am_pm == "PM" && endFront !== 12) endFront += 12;
            if (this.time.start == "PM" && startFront !== 12) startFront += 12;
            if (endFront > 12 && startFront !== 12) startFront += 12;
            if (startFront < 10) startFront = "0" + startFront;
            if (endFront < 10) endFront = "0" + endFront;
            // Formatting these four parts for the FullCalendar library
            start = "T" + startFront + ":" + startBack + ":00";
            end = "T" + endFront + ":" + endBack + ":00";
            
            calendarCourses = [];
            // Event object creation
            for (i = 0; i < heldDays.length; i++) {
                event = {
                    id: this.courseCode,
                    title: title,
                    start: heldDays[i] + start + "Z",
                    end: heldDays[i] + end + "Z",
                    backgroundColor: this.color
                };
                calendarCourses.push(event);
            }
            
            this.events = calendarCourses;
            return this.events;
        };
        
        this.makeFinal = function () {
            if (this.finalEvent !== undefined) return this.finalEvent;
            
            var startingDay, finalString, title, heldDay, time, start, end, endFront, endBack, event;
            startingDay = "2015-06-";
            
            if (this.final == undefined || this.final.indexOf("TBA") !== -1) {
                return undefined;
            }
            else {
                finalString = this.final;
            }
            
            // Title processing
            title = this.identifier.toUpperCase() + " - " + this.type.toUpperCase();
            // Day processing
            heldDay = startingDay + finalString.split(", ")[1].split(" ")[1];
            
            if (heldDay.split("-")[2].length == 1) {
                heldDay = [heldDay.slice(0, heldDay.length - 1), "0", heldDay.slice(heldDay.length - 1)].join('');
            }
            
            // Time parsing
            time = finalString.split("-");
            start = time[0].split(", ")[2];
            start = parseInt(start.split(":")[0], 10);
            end = time[1];
            if (end.indexOf("am") !== -1) {
                end = end.split("am")[0];
                endFront = parseInt(end.split(":")[0], 10);
                endBack = parseInt(end.split(":")[1], 10);
                if (endBack === 0) {
                    endBack = "00";
                }
                start = "0" + start;
            } else {
                end = end.split("pm")[0];
                endFront = parseInt(end.split(":")[0], 10);
                endBack = parseInt(end.split(":")[1], 10);
                if (endFront !== 12) {
                    start += 12;
                    endFront += 12;
                }
                if (endBack === 0) {
                    endBack = "00";
                }
            }
            start = "T" + start + ":" + time[0].split(", ")[2].split(":")[1] + ":00";
            end = "T" + endFront + ":" + endBack + ":00";
            
            //Event object creation
            event = {
                id: this.courseCode,
                title: title,
                start: heldDay + start + "Z",
                end: heldDay + end + "Z",
                backgroundColor: this.color
            };
            
            this.finalEvent = event;
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
                    course_code_cocourses: this.courseCode,
                    type: type
                } 
            });
        };
        
        this.findReplacements = function () {
            return $http({
                url: 'php/search.php',
                method: 'GET',
                params: {
                    course_code_cocourses: this.courseCode,
                    type: this.type
                }
            });  
        };
        
        this.fetchRateMyProfessor = function () {

            for (var instructor in course.instructor) {
                if (course.instructor[instructor] !== undefined) {
                    $http({
                        url: 'php/ratemyprofessor.php',
                        method: 'GET',
                        params: {last_name: course.instructor[instructor].last_name}
                    }).then(function (response) {
                        var potentials = response.data.response.docs;
                        var searched_last_name = response.config.params.last_name;

                        var potential_match = undefined;
                        
                        for (var i = 0; i < potentials.length; i++) {
                            if (potentials[i].teacherlastname_t.toUpperCase() == searched_last_name.toUpperCase()) {
                                potential_match = potentials[i];
                            }
                        }
                        
                        if (potential_match === undefined) return
                        
                        var instructor = course.instructor[potential_match.teacherlastname_t.toUpperCase() + ", " + potential_match.teacherfirstname_t.toUpperCase()[0] + "."];
                        
                        instructor.rmp_id = potential_match.pk_id;
                        instructor.rmp_avg_rating = potential_match.averageratingscore_rf;
                        instructor.rmp_num_rating = potential_match.total_number_of_ratings_i;
                    });
                }
            }
            
        };
        
        this.processLatestData = function (response) {

            var classData = response.data[0];
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
            
            course.instructor = {};
            
            for (var i = 0; i < courseData.instructor.length; i++) {
                if (courseData.instructor[i].indexOf("STAFF") != -1) {
                    course.instructor["STAFF"] = {
                        first_name: "STAFF",
                        last_name: "STAFF",
                        staff: true
                    };
                } else {
                    course.instructor[courseData.instructor[i]] = {
                        first_name: courseData.instructor[i].split(",")[1],
                        last_name: courseData.instructor[i].split(",")[0],
                        rmp_id: undefined,
                        rmp_avg_rating: undefined,
                        rmp_num_rating: undefined
                    };
                }
            }
            course.fetchRateMyProfessor();
            
            course.place = courseData.place;
            course.req = courseData.req;
            course.rstr = courseData.rstr;
            course.status = courseData.status;
            course.initialized = true;
            course.fetchingRemoteData = false;
            
        };
        
        return {response: this.getLatestCourseData().then(this.processLatestData), course: this};
        
    };
}]);

course.factory('TemporaryStore', ['Course', function (Course) {
    var TemporaryStore = [];
    
    TemporaryStore.courses = {};
    TemporaryStore.events = [];
    
    TemporaryStore.section_restricted = true;
    TemporaryStore.target_section = undefined;
    
    TemporaryStore.empty = function () {
        return Object.keys(TemporaryStore.courses).length === 0;
    };
    
    TemporaryStore.size = function () {
        return Object.keys(TemporaryStore.courses).length;
    };
    
    TemporaryStore.clear = function () {
        TemporaryStore.courses = {};
        TemporaryStore.events = [];
        TemporaryStore.section_restricted = true;
        TemporaryStore.target_section = undefined;
    };
    
    TemporaryStore.addCourse = function (course, replacement) {
        temporaryCourse = new Course(course, "black");
        temporaryCourse.tracking = false;
        temporaryCourse.replacement = replacement;
        TemporaryStore.courses[temporaryCourse.courseCode] = temporaryCourse;
        TemporaryStore.events = TemporaryStore.events.concat(temporaryCourse.makeEvent());
    };
    
    TemporaryStore.getCourse = function (courseCode) {
        return TemporaryStore.courses[courseCode];
    };
    
    TemporaryStore.filterEvents = function (filter) {
        
        TemporaryStore.section_restricted = filter; 
            
        TemporaryStore.events = [];
        
        if (TemporaryStore.section_restricted) {
            for (var course in TemporaryStore.courses) {
                if (TemporaryStore.courses[course].sec.indexOf(TemporaryStore.target_section) == 0) {
                    TemporaryStore.events = TemporaryStore.events.concat(TemporaryStore.courses[course].makeEvent());
                }
            }    
        }
        else {
            for (course in TemporaryStore.courses) {
                TemporaryStore.events = TemporaryStore.events.concat(TemporaryStore.courses[course].makeEvent());
            }   
        }
    };
    
    TemporaryStore.searchForCocourses = function (course, type, callback) {
        TemporaryStore.clear();
        TemporaryStore.target_section = course.sec.charAt(0);
        
        course.findCoCourses(type).then(function (response) {
            debugger;
        })
    };
    
    TemporaryStore.searchForCocoursesOld = function (course, type, callback) {
        TemporaryStore.clear();
        TemporaryStore.target_section = course.sec.charAt(0);
        
        var query = new Parse.Query("Course");
        query.equalTo("courseIdentifier", course.courseIdentifier);
        query.equalTo("term", course.term);
        query.equalTo("type", type.toTitleCase());
        query.find().then(function (results) {
            callback(results, false, course.sec);
        });
    };
    
    TemporaryStore.searchForReplacements = function (course, type, callback) {
        TemporaryStore.clear();
        TemporaryStore.target_section = course.sec.charAt(0);
        
        course.findReplacements().then(function (response) {
            debugger;
        })
    };

    TemporaryStore.searchForReplacementsOld = function (course, type, callback) {
        TemporaryStore.clear();
        TemporaryStore.target_section = course.sec.charAt(0);
        
        var query = new Parse.Query("Course");
        query.equalTo("courseIdentifier", course.courseIdentifier);
        query.equalTo("term", course.term);
        query.notEqualTo("courseCode", course.courseCode);
        query.equalTo("type", type.toTitleCase());
        query.find().then(function (results) {
            callback(results, true, course.sec);
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
        for (var i = 0; i < this.courseCodes.length; i++) {
            CourseStore.retrieveCourse(this.courseCodes[i]);
        }
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
        return CourseStore.getCourse(courseCode) !== undefined;
    };
    
    CourseStore.getCourse = function (courseCode) {
        for (var i = 0; i < CourseStore._collection.length; i++) {
            if (courseCode === CourseStore._collection[i].courseCode) return CourseStore._collection[i];
        }
        return undefined;
    };
    
    CourseStore.getEquivalentCourse = function (course) {
        for (var i = 0; i < CourseStore._collection.length; i++) {
            if (course.identifier === CourseStore._collection[i].identifier) return CourseStore._collection[i];
        }
        return undefined;
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
    $rootScope.$on('logout', function () {
        CourseStore.clear();
    });
    
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

course.directive('courseTitleView', function () {
    return {
        templateUrl: "app/components/course/directives/course-title-view.html"
    }
});

course.directive('courseInfoView', function () {
     return {
        templateUrl: "app/components/course/directives/course-info-view.html"
    }
});

course.directive('courseCodeView', function () {
    return {
        templateUrl: 'app/components/course/directives/course-code-view.html'
    }
});

course.directive('courseInstructorView', function () {
    return {
        templateUrl: 'app/components/course/directives/course-instructor-view.html'
    }
});

course.directive('courseActionsView', function () {
    return {
        templateUrl: "app/components/course/directives/course-actions-view.html"
    }
});

course.directive('courseSearchView', function () {
    return {
        templateUrl: 'app/components/course/directives/course-search-view.html'
    }
});

course.directive('courseHeldDaysView', function () {
    return {
        templateUrl: "app/components/course/directives/course-held-days-view.html"
    }
});

course.directive('courseTimeView', function () {
    return {
        templateUrl: "app/components/course/directives/course-time-view.html"
    }
});

course.directive('coursePlaceView', function () {
    return {
        templateUrl: "app/components/course/directives/course-place-view.html"
    }
});

course.directive('courseProgressView', function () {
    return {
        templateUrl: "app/components/course/directives/course-progress-view.html"
    }
});

course.filter('section', function() {
    return function (input, sec, enabled) {
        if (enabled) {
            var output = [];
            for (course in input) if (input[course].sec.indexOf(sec) == 0) output.push(input[course]);
            return output;
        }
        else return input;    
    };
});