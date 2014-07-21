/*global window, CourseView, Ladda */

var cacheFresh, storeCourses, getCourses, displayCourses;

$(document).ready(function () {
    "use strict";
    getCourses();
});

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
        console.log("Cache freshened.");
    }
};

// Stores course information from Parse
storeCourses = function () {
    "use strict";
    cacheFresh();
    var courses;
    courses = Parse.User.current().relation("betaCourses");
    return courses.query().find().then(function (remoteCourses) {
        sessionStorage.courses = JSON.stringify(remoteCourses);
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
    var courses, i, courseView;
    courses = JSON.parse(sessionStorage.courses);
    if (courses.length < 1) {
        $("#courseDisplay").html("<div class='jumbotron'><h1><small>You're not tracking any courses.</small></h1><h3><small>Go checkout Earth Systems Science 1: <b>42000</b></h3><small></div>");
    } else {
        for (i = 0; i < courses.length; i++) {
            courseView = new CourseView(courses[i]);
            $("#courseDisplay").append(courseView.buildHTML());
        }
        $(".top").tooltip({
            placement: "top"
        });
    }
};

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

// Adds to user profile
$(document).on("click", ".button-add", function () {
    "use strict";
    var courseCode, courses, i, lBtn, bBtn, Course, courseQuery;
    courseCode = parseInt($("#courseID").val(), 10);
    $(".alert-invalid-courseid").hide();
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
    courses = JSON.parse(sessionStorage.getItem('courses'));
    if (courses) {
        for (i = 0; i < courses.length; i++) {
            if (courses[i].courseCode == courseCode) {
                $(".alert-invalid-courseid").html("<strong>" + $("#courseID").val() + "</strong> is already being tracked.");
                $(".alert-invalid-courseid").show();
                $("#courseID").val('');
                return false;
            }
        }
    }
    lBtn = Ladda.create(this);
    bBtn = $(this);
    lBtn.start();
    bBtn.button("loading");
    lBtn.setProgress(0);
    Course = Parse.Object.extend("BetaCourse");
    courseQuery = new Parse.Query(Course);
    courseQuery.equalTo("courseCode", courseCode);
    courseQuery.first().then(function (course) {
        lBtn.setProgress('.25');
        Parse.User.current().relation("betaCourses").add(course);
        return Parse.User.current().save();
    }).then(function (course) {
        course.relation("trackers").add(Parse.User.current());
        return course.save();
    }).then(function () {
        lBtn.setProgress(1);
        sessionStorage.clear();
        getCourses();
        $("#courseID").val('');
        lBtn.stop();
        bBtn.button("reset");
    }, function (error) {
        console.log(error);
        lBtn.stop();
        bBtn.button("reset");
    });
});

// Remove course from user's profile
$(document).on('click', ".btn-remove", function () {
    "use strict";
    var btn, Course, courseQuery, courseID;
    btn = Ladda.create(this);
    $(this).button("loading");
    btn.start();
    btn.setProgress('.25');
    Course = Parse.Object.extend("BetaCourse");
    courseQuery = new Parse.Query(Course);
    courseID = $(this).parent().attr('id');
    courseQuery.get(courseID).then(function (course) {
        btn.setProgress('.5');
        Parse.User.current().relation("betaCourses").remove(course);
        return Parse.User.current().save();
    }).then(function (course) {
        course.relation("trackers").remove(Parse.User.current());
        return course.save();
    }).then(function () {
        btn.setProgress(1);
        cacheFresh("refresh");
        getCourses();
    }, function (error) {
        console.log(error);
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