var course = angular.module('courseeater.course', ['ui.bootstrap']);

course.run(['CourseStore', 'CourseListStore', '$rootScope', function (CourseStore, CourseListStore, $rootScope) {
    $rootScope.listStore = CourseListStore;
    $rootScope.courseStore = CourseStore;
    $rootScope.$watch('listStore.activeList', function (newValue, oldValue) {
        if (newValue !== undefined && newValue !== oldValue) {
            $rootScope.courseStore.setCourseCodes(newValue.courseCodes, newValue);
        }
    });
}]);

course.factory('Course', ['$http', function ($http) {
    return function (data, color) {
        
        var course = this;
        
        // Course relevant data
        this.courseCode = data.attributes.courseCode;
        this.courseIdentifier = data.attributes.courseIdentifier;
        this.courseName = data.attributes.courseName.replace(/&nbsp;/g, '');
        this.days = data.attributes.days;
        this.finalExam = data.attributes.final;
        this.instructor = data.attributes.instructor;
        this.localEnr = data.attributes.localEnr;
        this.max = data.attributes.max;
        this.nor = data.attributes.nor;
        this.placeBuilding = data.attributes.placeBuilding;
        this.placeURL = data.attributes.placeURL;
        this.prerequisites = data.attributes.prerequisities;
        this.req = data.attributes.req;
        this.rstr = data.attributes.rstr;
        this.sec = data.attributes.sec;
        this.status = data.attributes.status;
        this.textboooks = data.attributes.textbooks;
        this.time = data.attributes.time;
        this.totalEnr = data.attributes.totalEnr;
        this.type = data.attributes.type.toUpperCase();
        this.units = data.attributes.units;
        this.web = data.attributes.web;
        this.wl = data.attributes.wl;
        this.term = data.attributes.term;

        if (this.finalExam === "NONE") this.finalExam = undefined;

        // Parse object relevant data
        this.id = data.id;
        this.updatedAt = data.updatedAt;
        this.timeSinceUpdate = new Date().getTime() - new Date(this.updatedAt).getTime();
        
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
            if (this.events !== undefined) return this.events;
            
            var calendarCourses, title, days, heldDays, time, start, end, event, i, endFront, endBack, startFront, startBack;
            if (this.time.indexOf("TBA") !== -1) return [];
            // Title processing
            title = this.courseIdentifier.toUpperCase() + " - " + this.type.toUpperCase();
            // Day parsing
            days = this.days;
            heldDays = [];
            if (days.indexOf("M") > -1) heldDays.push(getWeekday(0));
            if (days.indexOf("Tu") > -1) heldDays.push(getWeekday(1));
            if (days.indexOf("W") > -1) heldDays.push(getWeekday(2));
            if (days.indexOf("Th") > -1) heldDays.push(getWeekday(3));
            if (days.indexOf("F") > -1) heldDays.push(getWeekday(4));
            // Time parsing
            time = this.time.split(" to ");
            start = time[0];
            end = time[1];
            // Removing spaces
            if (time[0][0] === " ") start = start.slice(1);
            if (time[1][0] === " ") end = end.slice(1);
            // Further breaking things down into 4 distinct parts.
            startFront = parseInt(start.split(":")[0], 10);
            startBack = start.split(":")[1].slice(0, 2);
            endFront = parseInt(end.split(":")[0], 10);
            endBack = end.split(":")[1].slice(0, 2);
            // Processing of these parts
            if (end.indexOf("PM") !== -1 && endFront !== 12) endFront += 12;
            if (start.indexOf("PM") !== -1 && startFront !== 12) startFront += 12;
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
            startingDay = "2015-12-";
            
            if (this.finalExam === undefined || this.finalExam.indexOf("TBA") !== -1) {
                return undefined;
            }
            else {
                finalString = this.finalExam;
            }
            
            // Title processing
            title = this.courseIdentifier.toUpperCase() + " - " + this.type.toUpperCase();
            // Day processing
            heldDay = startingDay + finalString.split(", ")[1].split(" ")[1];
            
            if (heldDay.split("-")[2].length == 1) {
                heldDay = [heldDay.slice(0, heldDay.length - 1), "0", heldDay.slice(heldDay.length - 1)].join('');
            }
            
            // Title processing
            title = this.courseIdentifier.toUpperCase() + " - " + this.type.toUpperCase();
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
                backgroundColor: color
            };
            
            
            
            this.finalEvent = event;
            return this.finalEvent;
        };
        
        this.checkLatestCourseData = function () {
            this.fetchingRemoteData = true;
            
            return $http({
                url: 'php/scrape.php',
                method: "GET",
                params: {course_code: this.courseCode, term: this.term}
            });
        };
        
        this.processLatestData = function (response) {
            try {
                course.totalEnr = parseInt(response.data.enr.split("/")[1], 10);
            } catch (e) {
                debugger
            }
            
            if (isNaN(course.totalEnr)) course.totalEnr = parseInt(response.data.enr);
            
            course.max = parseInt(response.data.max);
            course.wl = parseInt(response.data.wl);
            if (isNaN(course.wl)) course.wl = response.data.wl;
            course.final = response.data.final;
            course.instructor = response.data.instructor;
            
            course.place = response.data.place;
            course.req = response.data.req;
            course.rstr = response.data.rstr;
            course.status = response.data.status;
            
            
            
            if (course.wl == "n/a") course.wl = 0;
            
            course.fetchingRemoteData = false;
        };

        this.checkLatestCourseData().then(course.processLatestData);
        
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
    
    CourseStore.list = undefined;
    CourseStore.courseCodes = undefined;
    
    CourseStore.initialized = false;
    CourseStore._collection = {};
    
    // FullCalendar EventSources
    CourseStore.events = [];
    CourseStore.finals = [];
    
    // FullCalendar event colors
    CourseStore.colors = ["red", "green", "blue", "purple", "orange", "brown", "burlywood", "cadetblue", "coral", "darkcyan", "darkgoldenrod", "darkolivegreen"];
    
    CourseStore.setCourseCodes = function (courseCodes, list) {
        CourseStore.clear()
        CourseStore.list = list;
        CourseStore.fetchCourses();
    };
    
    CourseStore.fetchCourses = function () {
        
        CourseStore.clearSchedule();
        
        CourseStore.list.courseCodes.forEach(function (courseCode) {
            var query = new Parse.Query("Course");
            query.equalTo("courseCode", courseCode);
            query.equalTo("term", this.list.term);
            query.descending("updatedAt");
            query.find().then(this.makeCourse);
        }, CourseStore);
        
        CourseStore.initialized = true;
    };
    
    CourseStore.empty = function () {
        return Object.keys(CourseStore._collection).length === 0;
    };
    
    CourseStore.hasCourse = function (courseCode) {
        return CourseStore.getCourse(courseCode) !== undefined;
    };
    
    CourseStore.getCourse = function (courseCode) {
        for (var className in CourseStore._collection) {
            var classObj = CourseStore._collection[className];
            for (var i = 0; i < classObj.courses.length; i++) {
                if (classObj.courses[i].courseCode === courseCode) return classObj.courses[i]
            }
        }
        return undefined;
    };
    
    CourseStore.getEquivalentCourse = function (course) {
        var courseGroup = CourseStore._collection[course.courseIdentifier];
        for (var i = 0; i < courseGroup.courses.length; i++) {
            if (courseGroup.courses[i].type == course.type) return courseGroup.courses[i];
        }
    };
    
    CourseStore.putCourse = function (course) {
        if (CourseStore._collection[course.courseIdentifier] !== undefined) {
            var existingCourse = CourseStore.getCourse(course.courseCode);
            
            if (existingCourse) existingCourse = course;
            else {
                CourseStore._collection[course.courseIdentifier].courses.push(course);    
            }
            
            if (course.type == "LEC") CourseStore._collection[course.courseIdentifier].mainCourse = course;
        }
        else {
            CourseStore._collection[course.courseIdentifier] = {};
            CourseStore._collection[course.courseIdentifier].className = course.courseName;
            CourseStore._collection[course.courseIdentifier].classIdentifier = course.courseIdentifier;
            CourseStore._collection[course.courseIdentifier].courses = [course];
            CourseStore._collection[course.courseIdentifier].mainCourse = course;
        }
    };
    
    CourseStore.putEvent = function (event) {
        CourseStore.events = CourseStore.events.concat(event);
    };
    
    CourseStore.putFinal = function (event) {
        if (event !== undefined) {
            
            if (CourseStore.finals.length === 0) {
                CourseStore.finals = CourseStore.finals.concat(event);
            }
            
            else {
                var existed = false;
                for (var i = 0; i < CourseStore.finals.length; i++) {
                    if (event.id === CourseStore.finals[i].id) {
                        existed = true;
                        break;
                    }
                }
                if (!existed) {
                    CourseStore.finals = CourseStore.finals.concat(event);
                }
            }
            
        }
    };
    
    CourseStore.makeCourse = function (course) {
        var course = new Course(course[0], CourseStore.getColor(course[0].attributes.courseName));
        CourseStore.putCourse(course);
        CourseStore.putEvent(course.makeEvent());
        CourseStore.putFinal(course.makeFinal());
    };
    
    CourseStore.clearSchedule = function () {
        CourseStore.colors = ["red", "green", "blue", "purple", "orange", "brown", "burlywood", "cadetblue", "coral", "darkcyan", "darkgoldenrod", "darkolivegreen"];
        CourseStore.events = [];
        CourseStore.finals = [];
    };
    
    CourseStore.clear = function () {
        CourseStore.list = undefined;
        CourseStore.courseCodes = [];
        CourseStore.initialized = false;    
        CourseStore._collection = {};
        CourseStore.clearSchedule();
    };
        
    CourseStore.addCourse = function (courseCode) {
        return Parse.Cloud.run('addCourseNew', {courseCode : courseCode}).then(function (list) {
            CourseStore.list.courseCodes = list.attributes.courseCodes;
            CourseStore.fetchCourses();
        });
    };
    
    CourseStore.removeCourse = function (courseCode) {
        return Parse.Cloud.run('removeCourseNew', {courseCode : courseCode}).then(function (list) {
            CourseStore._removeCourseFromCollection(courseCode);
            CourseStore.list.courseCodes = list.attributes.courseCodes;
            CourseStore.fetchCourses();
        });
    };
    
    CourseStore._removeCourseFromCollection = function (courseCode) {
        for (var className in CourseStore._collection) {
            var courses = CourseStore._collection[className].courses;
            for (var i = 0; i < courses.length; i++) {
                if (courses[i].courseCode === courseCode) {
                    return CourseStore._collection[className].courses.splice(i, 1);
                }
            }
        }

        return undefined;
    };
        
    CourseStore.replaceCourse = function (oldCourseCode, newCourseCode) {
        return Parse.Cloud.run('removeCourse', {courseCode : oldCourseCode}).then(function () {
            return Parse.Cloud.run('addCourse', {courseCode : newCourseCode}).then(function (latestCourseCodes) {
                CourseStore._removeCourseFromCollection(oldCourseCode);
                CourseStore.fetchCourses(latestCourseCodes);
            });
        });
    };
    
    CourseStore.getColor = function (courseIdentifier) {
        if (CourseStore._collection[courseIdentifier] !== undefined) {
            return CourseStore._collection[courseIdentifier].mainCourse.color;
        }
        
        // Random color for a class
        var hash = Math.abs(courseIdentifier.hash()) % CourseStore.colors.length;
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