/*global window, CourseView, ClassView, Ladda, jQuery, storeCourses, sameClass, toTitleCase, cacheFresh, $, document, sessionStorage, retrieveCourses, getTemporaryCourse, clearTemporaryCourses, getCourseFromCache, Parse, console */
/*jslint plusplus: true */

var getCourses, displayCourses, classGroups, displayCollapsibleClasses, displaySearch, displayAlertError, validateCourseCode;

// Retrieves course information from Parse
getCourses = function () {
    "use strict";
    if (jQuery.isEmptyObject(JSON.parse(sessionStorage.courses))) {
        retrieveCourses().then(storeCourses).then(displayCourses);
    } else {
        displayCourses();
    }
};

// Dispatches to approriate display function
displayCourses = function () {
    "use strict";
    var courses, target;
    target = $("#courseDisplay");
    target.empty();
    courses = JSON.parse(sessionStorage.courses);
    if (jQuery.isEmptyObject(courses)) {
        target.html("<div class='container'><h2>Not tracking any courses.</h2></div>");
    } else {
        displayCollapsibleClasses(courses);
    }
};

// Groups courses by class
classGroups = function (courses) {
    "use strict";
    var courseIDs, lastCourse, classGroups, i;
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

// Creates ClassViews with CourseViews
displayCollapsibleClasses = function (courses) {
    "use strict";
    var target, classes, classView, classGroup, i, j;
    target = $("#courseDisplay");
    classes = classGroups(courses);
    for (i = 0; i < Object.keys(classes).length; i++) {
        classView = new ClassView();
        classGroup = classes[Object.keys(classes)[i]];
        for (j = 0; j < classGroup.length; j++) {
            classView.addCourse(courses[classGroup[j]]);
        }
        target.append('<div class="col-lg-4 col-md-6">' + classView.buildCollapsible() + '</div>');
    }
};

// Displays a search in a modal view
displaySearch = function () {
    "use strict";
    var temporaryCourses, course;
    temporaryCourses = JSON.parse(sessionStorage.temporaryCourses);
    if (jQuery.isEmptyObject(temporaryCourses)) {
        $("#courseInformationDisplay .modal-dialog .modal-content").html("<div class='modal-header'><h4 class='modal-title'>No results</h4></div>");
        $("#courseInformationDisplay").modal("show");
        return;
    }
    $("#courseInformationDisplay .modal-dialog .modal-content").html("<div class='modal-body row'></div>");
    for (course in temporaryCourses) {
        $("#courseInformationDisplay .modal-dialog .modal-content .modal-body").append('<div class="col-lg-4 col-md-6">' + getTemporaryCourse(course).buildDefaultPanel() + '</div>');
    }
    $("#courseInformationDisplay").modal("show");
    clearTemporaryCourses();
};

displayAlertError = function (errorText) {
    "use strict";
    var alert;
    alert = $(".alert-error");
    alert.html(errorText);
    alert.show();
};

// Performs courseCode validations
validateCourseCode = function (courseCode, errorCallback) {
    "use strict";
    try {
        if (isNaN(courseCode) || courseCode > 99999) throw { name: "Invalid CourseCode Error" };
        if (getCourseFromCache(courseCode) !== undefined) throw { name: "Currently tracked CourseCode Error" };
        return true;
    } catch (exception) {
        if (exception.name === "Invalid CourseCode Error") errorCallback("Invalid Course ID entered. Valid courseIDs must be 5 exactly 5 nubmers.");
		if (exception.name === "Currently tracked CourseCode Error") errorCallback("<strong>" + courseCode + "</strong> is already being tracked.");
        return false;
    }
};

// Allows enter to submit course by calling #addCourse button click
$(document).on("keypress", "#courseID", function (event) {
    "use strict";
    if (event.which === 13) $(".btn-add.btn-primary.btn-block").click();
});

// Conducts search for CoCourses
$(document).on("click", ".btn-search", function () {
    "use strict";
    var type, courseCode;
    type = $(this).attr("class").split(" ")[1].split("-")[1];
    courseCode = $(this).parent().parent().parent().parent().parent().attr("id").split("-")[1];
    getCourseFromCache(courseCode).findCoCourses(type, displaySearch);
});

// Conducts search for equivalent courses
$(document).on('click', ".btn-search-replacements", function () {
    "use strict";
    var courseCode, course;
    courseCode = $(this).parent().parent().parent().parent().parent().attr("id").split("-")[1];
    course = getCourseFromCache(courseCode);
    course.findCoCourses(course.type, displaySearch);
});

// Handles adding courses to user's account
$(document).on("click", ".btn-add", function (event) {
    "use strict";
    var courseCode, modal, lBtn;
    $(".alert-error").hide();
    if ($(event.target).parent().parent().attr("class") === "panel panel-primary course-list-item") {
        courseCode = parseInt($(this).parent().parent().attr('id'), 10);
        modal = $(this).parent().parent().parent().parent().parent().parent().parent();
    } else {
        courseCode = parseInt($("#courseID").val(), 10);
        $("#courseID").val('');
        if (!validateCourseCode(courseCode, displayAlertError)) {
            return;
        }
    }
    lBtn = Ladda.create(this);
    lBtn.start();
    lBtn.setProgress('.50');
    Parse.Cloud.run('addCourse', {courseCode: courseCode}).then(function (error) {
        if (error.code === 141) {
            lBtn.stop();
            displayAlertError("Course <strong>" + $("#courseID").val() + "</strong> does not exist.");
        } else {
            console.log(error);
        }
    }).then(function () {
        lBtn.stop();
        cacheFresh("refresh");
        if (modal !== undefined) {
            modal.modal('hide');
        }
        getCourses();
    });
});

// Remove course from user's profile
$(document).on('click', ".btn-remove", function () {
    "use strict";
    var courseCode, modal, lBtn;
    lBtn = Ladda.create(this);
    lBtn.start();
    lBtn.setProgress('.50');
    courseCode = $(this).parent().parent().parent().attr("id").split("-")[1];
    if (courseCode === undefined) {
        courseCode = $(this).parent().parent().parent().attr("id");
        modal = $(this).parent().parent().parent().parent().parent().parent().parent().parent();
    }
    getCourseFromCache(courseCode).remove().then(function () {
        displayCourses();
    }, function (error) {
        console.log(error);
        displayAlertError("Whoops something went wrong.");
        displayCourses();
        lBtn.stop();
    }).then(function () {
        cacheFresh("refresh");
        if (modal !== undefined) {
            modal.modal('hide');
        }
        retrieveCourses().then(storeCourses);
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
    $(".alert-error").hide();
    btn.stop();
});

$(document).ready(getCourses);