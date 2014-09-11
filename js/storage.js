/*global window, sessionStorage, CourseView, Parse */
/*jslint plusplus: true */

var initializeStorage, initializeTemporaryCourses, initializeCachedCourses, clearStorage, clearTemporaryCourses, clearCachedCourses, addTemporaryCourse, removeTemporaryCourse, getTemporaryCourse, transferCourseFromTemporaryToCache, addCourseToCache, removeCourseFromCache, getCourseFromCache, getEquivalentCourse, sameClass, retrieveCourses, storeCourses, cacheFresh;

initializeStorage = function () {
    "use strict";
    initializeCachedCourses();
    initializeTemporaryCourses();
};

initializeTemporaryCourses = function () {
    "use strict";
    if (sessionStorage.temporaryCourses === undefined) {
        clearTemporaryCourses();
    }
};

initializeCachedCourses = function () {
    "use strict";
    if (localStorage.courses === undefined) {
        clearCachedCourses();
    }
};

clearStorage = function () {
    "use strict";
    clearCachedCourses();
    clearTemporaryCourses();
};

clearTemporaryCourses = function () {
    "use strict";
    sessionStorage.temporaryCourses = JSON.stringify({});
};

clearCachedCourses = function () {
    "use strict";
    localStorage.courses = JSON.stringify({});
    return Parse.Promise.as();
};

addTemporaryCourse = function (course) {
    "use strict";
    var temporaryCourses;
    temporaryCourses = JSON.parse(sessionStorage.temporaryCourses);
    temporaryCourses[course.courseCode] = course;
    sessionStorage.temporaryCourses = JSON.stringify(temporaryCourses);
    return true;
};

removeTemporaryCourse = function (courseCode) {
    "use strict";
    var temporaryCourses;
    temporaryCourses = JSON.parse(sessionStorage.temporaryCourses);
    if (temporaryCourses[courseCode] !== undefined) {
        delete temporaryCourses[courseCode];
        sessionStorage.temporaryCourses = JSON.stringify(temporaryCourses);
    } else {
        return undefined;
    }
};

getTemporaryCourse = function (courseCode) {
    "use strict";
    var course;
    course = JSON.parse(sessionStorage.temporaryCourses)[courseCode];
    if (course !== undefined) {
        return new CourseView(course);
    }
};

transferCourseFromTemporaryToCache = function (courseCode) {
    "use strict";
    var course, courses;
    course = JSON.parse(sessionStorage.temporaryCourses)[courseCode];
    courses = JSON.parse(localStorage.courses);
    courses[courseCode] = course;
    localStorage.courses = JSON.stringify(courses);
};

addCourseToCache = function (course) {
    "use strict";
    var courses, promise;
    promise = new Parse.Promise();
    courses = JSON.parse(localStorage.courses);
    courses[course.attributes.courseCode] = course;
    localStorage.courses = JSON.stringify(courses);
    return promise.resolve();
};

removeCourseFromCache = function (courseCode) {
    "use strict";
    var courses;
    courses = JSON.parse(localStorage.courses);
    if (courses[courseCode] === undefined) {
        return false;
    }
    delete courses[courseCode];
    localStorage.courses = JSON.stringify(courses);
    return true;
};

// Returns array of courses from localStorage
getStoredCourses = function () {
	"use strict";
	return JSON.parse(localStorage.courses);	
};

// Returns array of temporary courses from sessionStorage
getTemporaryCourses = function () {
	return JSON.parse(sessionStorage.temporaryCourses);
	"use strict";
};

// Returns cached CourseView object
getCourseFromCache = function (courseCode) {
    "use strict";
    var course;
    course = JSON.parse(localStorage.courses)[courseCode];
    if (course !== undefined) {
        return new CourseView(course);
    }
};

// Determines if two courses are equivalent 
getEquivalentCourse = function (courseCode) {
    "use strict";
    var course, courses, initalCourse;
    courses = JSON.parse(localStorage.courses);
    initalCourse = JSON.parse(sessionStorage.temporaryCourses)[courseCode];
    for (course in courses) {
        if (courses[course].courseIdentifier === initalCourse.courseIdentifier && courses[course].courseName === initalCourse.courseName && courses[course].type === initalCourse.type) {
            return courses[course];
        }
    }
    return undefined;
};

// Determines if two courses belong to the same class
sameClass = function (course1, course2, courses) {
    "use strict";
    return courses[course1].courseIdentifier === courses[course2].courseIdentifier && courses[course1].courseName === courses[course2].courseName;
};

// Retrieves course information from Parse
retrieveCoursesOld = function () {
    "use strict";
    return Parse.User.current().relation("courses").query().find();
};

// Retrieves courses from active CourseList
retrieveCourses = function (callback) {
	"use strict";
	var courseListQuery, coursesQuery;
	courseListQuery = new Parse.Query("CourseList");
	courseListQuery.equalTo("owner", Parse.User.current());
	courseListQuery.equalTo("active", true);
	return courseListQuery.first().then(function (activeList) {
		activeList.relation("courses").query().find().then(function (list) {
			storeCourses(list, callback);
		});
	});
};


// Stores course information 
storeCourses = function (remoteCourses, callback) {
    "use strict";
    var courses, i;
    courses = {};
    if (remoteCourses !== undefined) {
		for (i = 0; i < remoteCourses.length; i++) {
	        courses[remoteCourses[i].attributes.courseCode] = remoteCourses[i];
	    }
    }
    localStorage.courses = JSON.stringify(courses);
    if (callback) {
		callback();    
    }
    var intercom = Intercom.getInstance();
	intercom.emit('notice', {message: 'Data updated!', code: 300});
};

// Determines cache's freshness
cacheFresh = function (reason) {
    "use strict";
    var expiration, currentTime, freshness, cacheTime;
    expiration = 1;
    currentTime = new Date();
    freshness = true;
    if (reason === "refresh") {
        freshness = false;
    } else if (sessionStorage.cacheAge === undefined) {
        freshness = false;
    } else {
        cacheTime = new Date(sessionStorage.cacheAge);
        if (currentTime.getMinutes() - cacheTime.getMinutes() > expiration || Parse.User.current().updatedAt > cacheTime) {
            freshness = false;
        }
    }
    if (freshness === false) {
        clearStorage();
        sessionStorage.cacheAge = currentTime;
    }
};