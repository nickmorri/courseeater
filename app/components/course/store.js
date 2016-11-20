var store = angular.module('courseeater.store', ['courseeater.course', 'ui.bootstrap']);

store.factory('TemporaryStore', ['Course', 'CourseListStore', function (Course, CourseListStore) {
    var TemporaryStore = {};
    
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
        TemporaryStore.no_results = false;
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
        
        var course = new Course(course.courseCode, course.term, "black");
        
        course.deferred.promise.then(function (fetched_course) {
        
            fetched_course.tracking = false;
            fetched_course.replacement = replacement;
            TemporaryStore.storeCourse(fetched_course);
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
            if (response.length == 0) {
                TemporaryStore.no_results = true;
            }
            else {
                TemporaryStore.no_results = false;
                response.forEach(function (course) {
                    TemporaryStore.addCourse(course, false);
                });
            }
        })
    };
    
    TemporaryStore.searchForReplacements = function (course, type, callback) {
        TemporaryStore.clear();
        
        // Add courseCode of course potentially being replaced
        TemporaryStore.course_code_for_replacement = course.courseCode.toString();
        
        // Get index 0 for courses with sec e.g. A1
        TemporaryStore.target_section = course.sec.charAt(0);
        
        return course.findReplacements().then(function (response) {
            if (response.length == 0) {
                TemporaryStore.no_results = true;
            }
            else {
                TemporaryStore.no_results = false;
                response.forEach(function (course) {
                    TemporaryStore.addCourse(course, true);
                });
            }
        });
    };
    
    return TemporaryStore;
    
}]);

store.factory('CourseStore', ['Course', '$rootScope', function (Course, $rootScope) {
    var CourseStore = {};
    
    CourseStore.list = undefined;
    
    CourseStore.initialized = false;
    CourseStore.num_loading_courses = 0;
    CourseStore._collection = [];
    
    // FullCalendar EventSources
    CourseStore.events = [];
    CourseStore.finals = [];
    
    // Resonable colors to look at for FullCalendar events
    CourseStore.colors = ["red", "green", "blue", "purple", "orange", "brown", "burlywood", "cadetblue", "coral", "darkcyan", "darkgoldenrod", "darkolivegreen"];
    
    CourseStore.addCourse = function (courseCode) {
        var putCourse = function (result) {
            CourseStore.retrieveCourse(this);
        };
        
        return CourseStore.list.addCourse(courseCode).then(putCourse.bind(courseCode));
    };
    
    CourseStore.removeCourse = function (courseCode) {
        var removeCourse = function (result) {
            CourseStore.cutCourse(this);
        };
        
        return CourseStore.list.removeCourse(courseCode).then(removeCourse.bind(courseCode));
    };
        
    CourseStore.replaceCourse = function (oldCourseCode, newCourseCode) {
        return CourseStore.removeCourse(oldCourseCode).then(function () {
            return CourseStore.addCourse(newCourseCode);
        });
    };
    
    CourseStore.setActiveList = function (list) {
        CourseStore.initialized = false;
        CourseStore.list = list;
        CourseStore.fetchCourses();
    };
    
    CourseStore.fetchCourses = function () {
        CourseStore.clearCourses();
        CourseStore.clearSchedule();
        if (CourseStore.list.courseCodes.length === 0) CourseStore.initialized = true;
        else CourseStore.list.courseCodes.forEach(CourseStore.retrieveCourse);
        
    };
    
    CourseStore.retrieveCourse = function (courseCode) {
        // TODO: Quick fix for null coursecodes in IE
        if (courseCode == null) return;
        
        CourseStore.num_loading_courses++;
        var course = new Course(parseInt(courseCode, 10), CourseStore.list.term, undefined);
        
        course.deferred.promise.then(function (fetched_course) {
            CourseStore.storeCourse(fetched_course);
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
        return CourseStore.getCourse(courseCode) != undefined;
    };
    
    CourseStore.getCourse = function (courseCode) {
        return CourseStore._collection.find(function (course) {
            return course.courseCode == this;
        }, courseCode);
    };
    
    CourseStore.getEquivalentCourse = function (course) {
        return CourseStore._collection.find(function (course) {
            return course.identifier == this;
        }, course.identifier);
    };
    
    CourseStore.storeCourse = function (course) {
        course.color = CourseStore.getColor(course);
        CourseStore._collection.push(course);
        CourseStore.storeEvent(course.makeEvent());
        CourseStore.storeFinal(course.makeFinal());
    };
    
    CourseStore.storeEvent = function (event) {
        if (event !== undefined) CourseStore.events = CourseStore.events.concat(event);
    };
    
    CourseStore.storeFinal = function (event) {
        if (event !== undefined) CourseStore.finals = CourseStore.finals.concat(event);
    };
    
    CourseStore.clearCourses = function () {
        CourseStore._collection = [];
    };
    
    CourseStore.clearSchedule = function () {
        CourseStore.colors = ["red", "green", "blue", "purple", "orange", "brown", "burlywood", "cadetblue", "coral", "darkcyan", "darkgoldenrod", "darkolivegreen"];
        CourseStore.events = [];
        CourseStore.finals = [];
    };
    
    CourseStore.cutSchedule = function (courseCode) {
        CourseStore.events = CourseStore.events.filter(function (event) {
            return event.id != this; 
        }, courseCode);
    };
    
    CourseStore.cutFinal = function (courseCode) {
        CourseStore.finals = CourseStore.finals.filter(function (event) {
            return event.id != this; 
        }, courseCode);
    };
    
    CourseStore.cutCourse = function (courseCode) {
        CourseStore._collection.splice(CourseStore._collection.findIndex(function (course) {
            return course.courseCode == this;
        }, courseCode), 1);
        
        CourseStore.cutSchedule(courseCode);
        CourseStore.cutFinal(courseCode);
    };
    
    CourseStore.clear = function () {
        CourseStore.list = undefined;
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

store.filter('section', function() {
    return function (input, sec, enabled) {
        return !enabled ? input : input.filter(function (course) {
            return course.sec.indexOf(this) == 0;
        }, sec);
    };
});