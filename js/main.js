/*global window */

var googleAnalytics, cachedCourse, toStringDays, sameClass, storeCourses, toTitleCase, cacheFresh;

Parse.initialize("ZJuxK6cPbOs5u3hy78QuIIojsBLnrDgpPeY9EQNU", "Rncx0sNYiCARajhzNE2m86l4HXdmYxo3yZ2AGJNy");
if (!Parse.User.current()) {window.location.replace("/"); }	

$(document).ready(function () {
    "use strict";
    $(".user-name-display").text(Parse.User.current().get("username"));
    cacheFresh();
    googleAnalytics();
});

// Groups courses by class
classGroups = function () {
    "use strict";
    var courses, courseIDs, lastCourse, classGroups, i;
    courses = JSON.parse(sessionStorage.courses);
    courseIDs = Object.keys(courses);
    lastCourse = courseIDs[0];
    classGroups = {};
    classGroups[lastCourse] = [lastCourse];
    for (i = 1; i < Object.keys(courses).length; i++) {
        if (sameClass(courseIDs[i], lastCourse, courses)) {
            classGroups[lastCourse].push(courseIDs[i]);
        } else {
            lastCourse = courseIDs[i];
            classGroups[lastCourse] = [lastCourse];
        }
    }
    return classGroups;
};

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

// Determines if two courses belong to the same class
sameClass = function (course1, course2) {
    "use strict";
    var courses;
    courses = JSON.parse(sessionStorage.courses);
    return courses[course1].courseIdentifier == courses[course2].courseIdentifier && courses[course1].courseName == courses[course2].courseName;
};

// Transforms a string to Title Case
toTitleCase = function (str) {
    "use strict";
    return str.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
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