var course = angular.module('courseeater.course', ['ui.bootstrap']);

course.run(['CourseStore', 'CourseListStore', '$rootScope', function (CourseStore, CourseListStore, $rootScope) {
    $rootScope.listStore = CourseListStore;
    $rootScope.courseStore = CourseStore;
    $rootScope.$watch('listStore.activeList', function (newValue, oldValue) {
        if (newValue !== undefined) {
            $rootScope.courseStore.setQuery(newValue.getCourseQuery());
        }
    });
}]);

course.factory('Course', function () {
    return function (data, color) {
        this.courseCode = data.attributes.courseCode;
        this.courseIdentifier = data.attributes.courseIdentifier;
        this.courseName = data.attributes.courseName.replace(/&nbsp;/g, '');
        this.days = data.attributes.days;
        this.final = data.attributes.final;
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

        this.id = data.id;
        this.updatedAt = data.updatedAt;
        
        // Used to decide which buttons to display in search modals
        this.tracking = true;
        this.replacement = false;
        
        // Used for animated button states
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
                    start: heldDays[i] + start,
                    end: heldDays[i] + end,
                    backgroundColor: this.color
                };
                calendarCourses.push(event);
            }
            
            this.events = calendarCourses;
            return this.events;
        };
        
    };
});

course.factory('TemporaryStore', ['Course', function (Course) {
    var TemporaryStore = [];
    
    TemporaryStore.courses = {};
    TemporaryStore.events = [];
    
    TemporaryStore.hasCourses = function () {
        return Object.keys(TemporaryStore.courses).length !== 0;
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
    TemporaryStore.clear = function () {
        TemporaryStore.courses = {};
        TemporaryStore.events = [];
    };
    
    return TemporaryStore;
    
}]);

course.factory('CourseStore', ['Course', function (Course) {
    var CourseStore = {};
    
    CourseStore.query = undefined;
    
    CourseStore.ready = false;
    CourseStore._collection = {};
    CourseStore.events = [];
    
    CourseStore.colors = ["red", "green", "blue", "purple", "orange", "brown", "burlywood", "cadetblue", "coral", "darkcyan", "darkgoldenrod", "darkolivegreen"];
    
    CourseStore.setQuery = function (query) {
        CourseStore.ready = false;
        CourseStore.query = query;
        CourseStore.fetchCourses();
    };
    
    CourseStore.fetchCourses = function (query) {
        CourseStore.query.find().then(CourseStore.makeCourses);
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
    
    CourseStore.makeCourses = function (data) {
        CourseStore.clear();
        for (var i = 0; i < data.length; i++) {
            CourseStore.makeCourse(data[i]);
        }
        CourseStore.ready = true;
    };
    
    CourseStore.makeCourse = function (course) {
        var course = new Course(course, CourseStore.getColor(course.attributes.courseName));
        CourseStore.events = CourseStore.events.concat(course.makeEvent());
        
        if (CourseStore._collection[course.courseIdentifier] !== undefined) {
            CourseStore._collection[course.courseIdentifier].courses.push(course);
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
    
    CourseStore.clear = function () {
        CourseStore.colors = ["red", "green", "blue", "purple", "orange", "brown", "burlywood", "cadetblue", "coral", "darkcyan", "darkgoldenrod", "darkolivegreen"];
        CourseStore._collection = {};
        CourseStore.events = [];
    };
    
    CourseStore.getEquivalentCourse = function (course) {
        var courseGroup = CourseStore._collection[course.courseIdentifier];
        for (var i = 0; i < courseGroup.courses.length; i++) {
            if (courseGroup.courses[i].type == course.type) return courseGroup.courses[i];
        }
    };
        
    CourseStore.empty = function () {
        return Object.keys(CourseStore._collection).length === 0;
    };
    
    CourseStore.addCourse = function (courseCode) {
        return Parse.Cloud.run('addCourse', {courseCode : courseCode}).then(CourseStore.fetchCourses);
    };
    
    CourseStore.removeCourse = function (courseCode) {
        return Parse.Cloud.run('removeCourse', {courseCode : courseCode}).then(CourseStore.fetchCourses);
    };
        
    CourseStore.replaceCourse = function (oldCourseCode, newCourseCode) {
        return Parse.Cloud.run('removeCourse', {courseCode : oldCourseCode}).then(function () {
            return Parse.Cloud.run('addCourse', {courseCode : newCourseCode}).then(CourseStore.fetchCourses);
        });
    };
                
    CourseStore.getColor = function (string) {
        // Random color for a class
        hash = Math.abs(string.hash()) % CourseStore.colors.length;
        return CourseStore.colors.splice(CourseStore.colors.indexOf(CourseStore.colors[hash]), 1)[0];
    };
    
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