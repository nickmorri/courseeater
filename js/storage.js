/*global window */

initializeStorage = function () {
	initializeCachedCourses();
	initializeTemporaryCourses();
};

initializeTemporaryCourses = function () {
	if (sessionStorage.temporaryCourses === undefined) {
		clearTemporaryCourses();
	}
};

initializeCachedCourses = function () {
	if (sessionStorage.courses === undefined) {
		clearCachedCourses();
	}
};

clearStorage = function () {
	clearCachedCourses();
	clearTemporaryCourses();
};

clearTemporaryCourses = function () {
	sessionStorage.temporaryCourses = JSON.stringify({});
};

clearCachedCourses = function () {
	sessionStorage.courses = JSON.stringify({});
};

addTemporaryCourse = function (course) {
	var temporaryCourses;
	temporaryCourses = JSON.parse(sessionStorage.temporaryCourses);
	temporaryCourses[course.courseCode] = course;
	sessionStorage.temporaryCourses = JSON.stringify(temporaryCourses);
	return true;
};

removeTemporaryCourse = function (courseCode) {
	var temporaryCourses, course;
	temporaryCourses = JSON.parse(sessionStorage.temporaryCourses);
	if (courses[courseCode] !== undefined) {
		delete courses[courseCode];
		sessionStorage.temporaryCourses = JSON.stringify(courses);
		return true;
	} else {
		return undefined;
	}
};

getTemporaryCourse = function (courseCode) {
	var course;
	course = JSON.parse(sessionStorage.temporaryCourses)[courseCode];
	if (course !== undefined) {
		return new CourseView(course);	
	} else {
		return undefined;
	}
};

transferCourseFromTemporaryToCache = function (courseCode) {
	var course = JSON.parse(sessionStorage.temporaryCourses)[courseCode];
	var courses = JSON.parse(sessionStorage.courses);
	courses[courseCode] = course;
	sessionStorage.courses = JSON.stringify(courses);
};

addCourseToCache = function (course) {
	var courses, promise;
	promise = new Parse.Promise();
	courses = JSON.parse(sessionStorage.courses);
	courses[course.attributes.courseCode] = course;
	sessionStorage.courses = JSON.stringify(courses);
	return promise.resolve();
};

removeCourseFromCache = function (courseCode) {
	var courses;
	courses = JSON.parse(sessionStorage.courses);
	if (courses[courseCode] === undefined) {
		return false;
	}
	delete courses[courseCode];
	sessionStorage.courses = JSON.stringify(courses);
	return true;
};

// Returns cached CourseView object
getCourseFromCache = function (courseCode) {
	var course;
	course = JSON.parse(sessionStorage.courses)[courseCode];
	if (course !== undefined) {
		return new CourseView(course);
	} else {
		return undefined;	
	} 
};

// Retrieves course information from Parse
retrieveCourses = function () {
    "use strict";
    return Parse.User.current().relation("courses").query().find();
};

// Stores course information 
storeCourses = function (remoteCourses) {
	var courses, i;
	courses = {};
	for (i = 0; i < remoteCourses.length; i++) {
    	courses[remoteCourses[i].attributes.courseCode] = remoteCourses[i];
    }
    sessionStorage.courses = JSON.stringify(courses);
    return new Parse.Promise.as();
};

// Determines cache's freshness
cacheFresh = function (reason) {
    "use strict";
    var expiration, currentTime, freshness, cacheTime;
    expiration = 1;
    currentTime = new Date();
    freshness = true;
    if (reason == "refresh") {
        freshness = false;
    } else if (sessionStorage.cacheAge === undefined) {
        freshness = false;
    } else {
        cacheTime = new Date(sessionStorage.cacheAge);
        if (currentTime.getMinutes() - cacheTime.getMinutes() > expiration || Parse.User.current().updatedAt > cacheTime) {
            freshness = false;
        }
    }
    if (freshness == false) {
        clearStorage();
        sessionStorage.cacheAge = currentTime;
    }
};