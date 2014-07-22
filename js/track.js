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

// Display Course objects
displayCourses = function () {
    "use strict";
    $("#courseDisplay").empty();
    var courses, courseView, course;
    courses = JSON.parse(sessionStorage.courses);
    if (courses === undefined || jQuery.isEmptyObject(courses)) {
        $("#courseDisplay").html("<div class='jumbotron'><h1><small>You're not tracking any courses.</small></h1></div>");
    } else {
        for (course in courses) {
            if (courses.hasOwnProperty(course)) {
                courseView = new CourseView(courses[course]);
                $("#courseDisplay").append(courseView.buildHTML());
            }
        }
        $(".top").tooltip({
            placement: "top"
        });
    }
};

filterLec = function (course) {
    return course.attributes.type == "Lec";  
};

filterLab = function (course) {
    return course.attributes.type == "Lab";  
};

filterDis = function (course) {
    return course.attributes.type == "Dis";
};

displaySearch = function (results, filter) {
    "use strict";
    var i;
    if (filter) {
        for (i = 0; i < results.length; i++) {
            if (filter(results[i])) {
                console.log(results[i].attributes);
            }
        }  
    } else {
        for (i = 0; i < results.length; i++) {
            console.log(results[i].attributes);
        }
    }
};

searchForCoCourses = function (courseCode, callback, filter) {
    "use strict";
    var Course, courseQuery, courseName, coCourseQuery;
    Course = Parse.Object.extend("Course");
    courseQuery = new Parse.Query(Course);
    courseQuery.equalTo("courseCode", parseInt(courseCode));
    courseQuery.first().then(function (course) {
        courseName = course.get("courseName");
        coCourseQuery = new Parse.Query(Course);
        coCourseQuery.equalTo("courseName", courseName);
        return coCourseQuery.find();
    }).then(function (results) {
        callback(results, filter);
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

$(document).on("click", ".btn-log-lab", function () {
    var courseCode, filter;
    courseCode = $(this).parent().parent().parent().parent().parent().children(".panel-heading").children(".panel-title").children(".course-view-courseID").text();
    filter = filterLab;
    searchForCoCourses(courseCode, displaySearch, filter);
});

$(document).on("click", ".btn-log-lec", function () {
    var courseCode, filter;
    courseCode = $(this).parent().parent().parent().parent().parent().children(".panel-heading").children(".panel-title").children(".course-view-courseID").text();
    filter = filterLec;
    searchForCoCourses(courseCode, displaySearch, filter);
});

$(document).on("click", ".btn-log-dis", function () {
    var courseCode, filter;
    courseCode = $(this).parent().parent().parent().parent().parent().children(".panel-heading").children(".panel-title").children(".course-view-courseID").text();
    filter = filterDis;
    searchForCoCourses(courseCode, displaySearch, filter);
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
        }
        console.log(error);
        lBtn.stop();
        bBtn.button("reset");
        cacheFresh("refresh");
        getCourses();
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