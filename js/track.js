/*global window, CourseView, Ladda, jQuery */

var cacheFresh, storeCourses, getCourses, displayCourses, removeCachedCourse, displaySearch, searchForCoCourses, searchCoursesByType, searchCoursesByDepartment, searchCoursesByCourseName, searchCoursesByInstructor, validateCourseCode;

$(document).ready(function () {
    "use strict";
    getCourses();
});

function toTitleCase(str) {
    "use strict";
    return str.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
}

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

// Stores course information from Parse
storeCourses = function () {
	"use strict";
    cacheFresh();
    var courseRelation, courses, i;
    courseRelation = Parse.User.current().relation("courses");
    courses = {};
    return courseRelation.query().find().then(function (remoteCourses) {
        for (i = 0; i < remoteCourses.length; i++) {
            courses[remoteCourses[i].attributes.courseCode] = remoteCourses[i];
        }
        sessionStorage.courses = JSON.stringify(courses);
    }, function (error) {
        console.log(error);
    });
};

// Retrieves course information from Parse
getCourses = function () {
    "use strict";
    if (sessionStorage.courses === undefined) {
        storeCourses().then(displayCourses);
    } else {
        displayCourses();
    }
};

// Determines if two courses belong to the same class
sameClass = function (course1, course2, courses) {
	return courses[course1].courseIdentifier == courses[course2].courseIdentifier && courses[course1].courseName == courses[course2].courseName;
};

// Groups courses by class
classGroups = function () {
	var courses, courseIDs, lastCourse, classGroups;
	courses = JSON.parse(sessionStorage.courses);
	courseIDs = Object.keys(courses);
	classGroups = {};
	lastCourse = courseIDs[0];
	
	for (var i = 1; i < Object.keys(courses).length; i++) {
		if (classGroups[lastCourse] === undefined) {
			classGroups[lastCourse] = [lastCourse];
		}
		if (sameClass(courseIDs[i], lastCourse, courses)) {
			classGroups[lastCourse].push(courseIDs[i]);
		} else {
			lastCourse = courseIDs[i];
			classGroups[lastCourse] = [lastCourse];
		}
	}
	return classGroups;
};

displayCollapsibleClasses = function () {
	"use strict";
    $("#courseDisplay").empty();
    var courses, courseView, course;
    courses = JSON.parse(sessionStorage.courses);
    
	var classes = classGroups();

	for (var i = 0; i < Object.keys(classes).length; i++) {
		var classView = new ClassView();
		var classGroup = classes[Object.keys(classes)[i]];
		for (var j = 0; j < classGroup.length; j++) {
			classView.addCourse(courses[classGroup[j]]);	
		}
		$("#courseDisplay").append(classView.buildCollapsible());		
	}
};

displayCourses = function () {
	"use strict";
	displayCollapsibleClasses();
};

// Display Legacy Course objects
displaySingleCourses = function () {
    "use strict";
    $("#courseDisplay").empty();
    var courses, courseView, course;
    courses = JSON.parse(sessionStorage.courses);
	
    if (courses === undefined || jQuery.isEmptyObject(courses)) {
        $("#courseDisplay").html("<div class='jumbotron'><h2>You're not tracking any courses.</h2></div>");
    } else {
        for (course in courses) {
            if (courses.hasOwnProperty(course)) {
                courseView = new CourseView(courses[course]);
                $("#courseDisplay").append(courseView.buildCourse());
            }
        }
        $(".top").tooltip({
            placement: "top"
        });
    }
};

// Converts a character respresentation of a dayt to a full string
toStringDays = function (days) {
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
}

// Determines if a a course object is locally cached
cachedCourse = function (courseCode) {
	return JSON.parse(sessionStorage.courses)[courseCode] !== undefined;
};

// Displays a search in a modal view
displaySearch = function (results) {
    "use strict";
    var i, potentialCourse;
    $("#courseInformationDisplay .modal-dialog .modal-content .modal-body").empty();
    if (results.length > 0) {
    	$("#courseInformationDisplay .modal-dialog .modal-content .modal-header .modal-title").html(results[0].attributes.courseName + " (" + results[0].attributes.type + ")");
        for (i = 0; i < results.length; i++) {
			potentialCourse = new CourseView(results[i].attributes);
            $("#courseInformationDisplay .modal-dialog .modal-content .modal-body").append(potentialCourse.buildCourse());
        }
        $(".top").tooltip({
            placement: "top"
        });
        $("#courseInformationDisplay").modal("show");
    } else {
    	$("#courseInformationDisplay .modal-dialog .modal-content .modal-header .modal-title").html("No results");
        $("#courseInformationDisplay .modal-dialog .modal-content .modal-body .list-group").empty();
        $("#courseInformationDisplay .modal-dialog .modal-content .modal-body .list-group").append("There were no courses found.");
        $("#courseInformationDisplay").modal("show");
    }
};

searchForCoCourses = function (courseCode, callback, type) {
    "use strict";
    var Course, courseQuery, courseName, coCourseQuery;
    Course = Parse.Object.extend("Course");
    courseQuery = new Parse.Query(Course);
    courseQuery.equalTo("courseCode", parseInt(courseCode));
    courseQuery.first().then(function (course) {
        courseName = course.get("courseName");
        coCourseQuery = new Parse.Query(Course);
        coCourseQuery.equalTo("courseName", courseName);
        coCourseQuery.equalTo("type", toTitleCase(type));
        return coCourseQuery.find();
    }).then(function (results) {
        callback(results);
    });
};

searchCoursesByType = function (type) {
    "use strict";
    var Course, query;
    Course = Parse.Object.extend("Course");
    query = new Parse.Query(Course);
    query.startsWith("type", toTitleCase(type));
    query.find().then(function (results) {
        displaySearch(results);
    });
};

searchCoursesByDepartment = function (department) {
    "use strict";
    var Course, query;
    Course = Parse.Object.extend("Course");
    query = new Parse.Query(Course);
    query.startsWith("courseIdentifier", toTitleCase(department));
    query.find().then(function (results) {
        displaySearch(results);
    });
};

searchCoursesByCourseName = function (courseName) {
    "use strict";
    var Course, query;
    Course = Parse.Object.extend("Course");
    query = new Parse.Query(Course);
    query.startsWith("courseName", courseName.toUpperCase());
    query.find().then(function (results) {
        displaySearch(results);
    });
};

searchCoursesByInstructor = function (instructor) {
    "use strict";
    var Course, query;
    Course = Parse.Object.extend("Course");
    query = new Parse.Query(Course);
    query.startsWith("instructor", instructor.toUpperCase());
    query.find().then(function (results) {
        displaySearch(results);
    });
};

displayRateData = function (data) {
	console.log(data);	
};

$(document).on("click", ".btn-search-lab", function () {
    var courseCode;
    courseCode = $(this).parent().parent().parent().parent().parent().children(".panel-heading").children(".panel-title").children(".course-view-courseID").text();
    searchForCoCourses(courseCode, displaySearch, "Lab");
});

$(document).on("click", ".btn-search-lec", function () {
    var courseCode;
    courseCode = $(this).parent().parent().parent().parent().parent().children(".panel-heading").children(".panel-title").children(".course-view-courseID").text();
    searchForCoCourses(courseCode, displaySearch, "Lec");
});

$(document).on("click", ".btn-search-dis", function () {
    var courseCode;
    courseCode = $(this).parent().parent().parent().parent().parent().children(".panel-heading").children(".panel-title").children(".course-view-courseID").text();
    searchForCoCourses(courseCode, displaySearch, "Dis");
});

// Allows enter to submit course by calling #addCourse button click
$(document).on("keypress", "#courseID", function (event) {
    "use strict";
    if (event.which == 13) { $(".button-add").click(); }
});

// Selects courseCode on click of courseCode div
$(document).on("click", ".course-view-courseID", function () {
    "use strict";
    var range, selection;
    if (window.getSelection && document.createRange) {
        selection = window.getSelection();
        range = document.createRange();
        range.selectNodeContents($(this)[0]);
        selection.removeAllRanges();
        selection.addRange(range);
    } else if (document.selection && document.body.createTextRange) {
        range = document.body.createTextRange();
        range.moveToElementText($(this)[0]);
        range.select();
    }
});

validateCourseCode = function (courseCode) {
    "use strict";
    var courses, course;
    if ($("#courseID").val() == "") {
        $(".alert-invalid-courseid").html("<strong>No courseID entered.</strong>");
        $(".alert-invalid-courseid").show();
        $("#courseID").val('');
        return false;
    }
    if ($("#courseID").val() != courseCode || courseCode < 10000) {
        $(".alert-invalid-courseid").html("<strong>" + $("#courseID").val() + "</strong> is an invalid Course ID. Valid courseIDs must be 5 exactly 5 nubmers.");
        $(".alert-invalid-courseid").show();
        $("#courseID").val('');
        return false;
    }
    courses = JSON.parse(sessionStorage.courses);
    if (courses !== undefined || !jQuery.isEmptyObject(courses)) {
        for (course in courses) {
            if (courses.hasOwnProperty(course) && courses[course].courseCode == courseCode) {

                $(".alert-invalid-courseid").html("<strong>" + $("#courseID").val() + "</strong> is already being tracked.");
                $(".alert-invalid-courseid").show();
                $("#courseID").val('');
                return false;

            }
        }
    }
    return true;
};

// Adds to user profile
$(document).on("click", ".button-add", function () {
    "use strict";
    var courseCode, lBtn, bBtn;
    courseCode = parseInt($("#courseID").val(), 10);
    $(".alert-invalid-courseid").hide();
    if (!validateCourseCode(courseCode)) {
        return false;
    }
    lBtn = Ladda.create(this);
    bBtn = $(this);
    lBtn.start();
    bBtn.button("loading");
    lBtn.setProgress('.50');
    Parse.Cloud.run('addCourse', {courseCode: courseCode}).then(function () {
        $("#courseID").val('');
        lBtn.setProgress('1');
        lBtn.stop();
        bBtn.button("reset");
        cacheFresh("refresh");
        getCourses();
    }, function (error) {
        if (error.code == 141) {
            $(".alert-invalid-courseid").html("Course <strong>" + $("#courseID").val() + "</strong> does not exist.");
            $(".alert-invalid-courseid").show();
        } else {
			console.log(error);
        }
        lBtn.stop();
        bBtn.button("reset");
        cacheFresh("refresh");
        getCourses();
    });
});

$(document).on("click", ".btn-add", function () {
	"use strict";
	var courseCode, lBtn, bBtn, modal;
	courseCode = parseInt($(this).parent().parent().attr('id'));
	modal = $(this).parent().parent().parent().parent().parent().parent();
	lBtn = Ladda.create(this);
    bBtn = $(this);
    lBtn.start();
    bBtn.button("loading");
    lBtn.setProgress('.50');
	Parse.Cloud.run('addCourse', {courseCode: courseCode}).then(function () {
        $("#courseID").val('');
        lBtn.setProgress('1');
        lBtn.stop();
        bBtn.button("reset");
        cacheFresh("refresh");
        getCourses();
        modal.modal('hide');
    }, function (error) {
        if (error.code == 141) {
            $(".alert-invalid-courseid").html("Course <strong>" + $("#courseID").val() + "</strong> does not exist.");
            $(".alert-invalid-courseid").show();
        } else {
			console.log(error);
        }
        lBtn.stop();
        bBtn.button("reset");
        cacheFresh("refresh");
        getCourses();
        modal.modal('hide');
    });
});

// Remove course from user's profile
$(document).on('click', ".btn-remove", function () {
    "use strict";
    var courseCode, lBtn, bBtn;
    lBtn = Ladda.create(this);
    bBtn = $(this);
    lBtn.start();
    bBtn.button("loading");
    lBtn.setProgress('.50');
    courseCode = $(this).parent().parent().parent().children(".panel-heading").children(".panel-title").children(".course-view-courseID").text();
    Parse.Cloud.run("removeCourse", {courseCode: courseCode}).then(function () {
        lBtn.setProgress('1');
        lBtn.stop();
        bBtn.button("reset");
        cacheFresh("refresh");
        getCourses();
    }, function (error) {
        console.log(error);
        $(".alert-invalid-courseid").html("Whoops something went wrong.");
        $(".alert-invalid-courseid").show();
        lBtn.setProgress('1');
        lBtn.stop();
        bBtn.button("reset");
        cacheFresh("refresh");
        getCourses();
    });
});

// Clears any sessionStorage data and reloads data from Parse
$(document).on("click", ".refresh-data", function () {
    "use strict";
    var btn;
    btn = Ladda.create(this);
    btn.start();
    $("#courseDisplay").empty();
    cacheFresh("refresh");
    getCourses();
    $(".alert").hide();
    btn.stop();
});