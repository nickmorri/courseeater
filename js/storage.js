/*global window */

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
	var courses;
	courses = JSON.parse(sessionStorage.courses);
	courses[course.attributes.courseCode] = course;
	sessionStorage.courses = JSON.stringify(courses);
	return true;
};

removeCourseFromCache = function (courseCode) {
	var courses;
	courses = JSON.parse(sessionStorage.courses);
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

// Stores course information from Parse
storeCourses = function () {
    "use strict";
    var courses, courseRelation, i;
	courses = {};
    courseRelation = Parse.User.current().relation("courses");
    return courseRelation.query().find().then(function (remoteCourses) {
        for (i = 0; i < remoteCourses.length; i++) {
        	courses[remoteCourses[i].attributes.courseCode] = remoteCourses[i];
        }
        
        sessionStorage.courses = JSON.stringify(courses);
    }, function (error) {
        console.log(error);
    });
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