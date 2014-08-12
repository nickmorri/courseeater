/*global window */

var googleAnalytics, cachedCourse, toStringDays, sameClass, storeCourses, toTitleCase, cacheFresh;

Parse.initialize("ZJuxK6cPbOs5u3hy78QuIIojsBLnrDgpPeY9EQNU", "Rncx0sNYiCARajhzNE2m86l4HXdmYxo3yZ2AGJNy");
if (!Parse.User.current()) {window.location.replace("/"); }

$(document).ready(function () {
    "use strict";
    $(".user-name-display").text(Parse.User.current().get("username"));
    googleAnalytics();
});

getEquivalentCourse = function (courseCode) {
	var courses = JSON.parse(sessionStorage.courses);
	var initalCourse = JSON.parse(sessionStorage.temporaryCourses)[courseCode];
	for (course in courses) {
		if (courses[course].courseIdentifier == initalCourse.courseIdentifier && courses[course].courseName == initalCourse.courseName && courses[course].type == initalCourse.type) {
			return courses[course];
		}
	}
	return undefined;
};

addTemporaryCourse = function (course) {
	var temporaryCourses;
	if (sessionStorage.temporaryCourses !== undefined) {
		temporaryCourses = JSON.parse(sessionStorage.temporaryCourses);
	} else {
		temporaryCourses = {};
	}
	temporaryCourses[course.courseCode] = course;
	sessionStorage.temporaryCourses = JSON.stringify(temporaryCourses);
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
	if (sessionStorage.courses) {
		courses = JSON.parse(sessionStorage.courses);
	} else {
		courses = {};
	}
	courses[course.attributes.courseCode] = course;
	sessionStorage.courses = JSON.stringify(courses);
};

removeCourseFromCache = function (courseCode) {
	var courses;
	if (sessionStorage.courses) {
		courses = JSON.parse(sessionStorage.courses);
	} else {
		return false;
	}
	delete courses[courseCode];
	sessionStorage.courses = JSON.stringify(courses);
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

// Converts a character respresentation of a dayt to a full string
toStringDays = function (days) {
    "use strict";
    var dayString = "";
    if (days.indexOf("M") != -1) {
        dayString += "Monday";
    }
    if (days.indexOf("Tu") != -1) {
        dayString += "Tuesday";
    }
    if (days.indexOf("W") != -1) {
        dayString += "Wednesday";
    }
    if (days.indexOf("Th") != -1) {
        dayString += "Thursday";
    }
    if (days.indexOf("F") != -1) {
        dayString += "Friday";
    }
    return dayString;
};

// Determines if two courses belong to the same class
sameClass = function (course1, course2) {
    "use strict";
    var courses;
    if (sessionStorage.courses !== undefined) {
		courses = JSON.parse(sessionStorage.courses);    
    } else {
	    return undefined;
    }
    return courses[course1].courseIdentifier == courses[course2].courseIdentifier && courses[course1].courseName == courses[course2].courseName;
};

// Stores course information from Parse
storeCourses = function () {
    "use strict";
    var courses;
    courses = {};
    cacheFresh();
    var courseRelation, i;
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

toTitleCase = function (str) {
    "use strict";
    return str.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
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
        sessionStorage.clear();
        sessionStorage.cacheAge = currentTime;
    }
};

// Performs User logout
$(document).on("click", "#logout", function () {
    "use strict";
    Parse.User.logOut();
    sessionStorage.clear();
    window.location.replace("/");
});

// Google Analytics Information
function googleAnalytics() {
    "use strict";
    (function (i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function (){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
    ga('create', 'UA-9939990-3', 'courseeater.com');
    ga('send', 'pageview');
};