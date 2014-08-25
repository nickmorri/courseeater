/*global window, CourseView, ClassView, Ladda, jQuery, storeCourses, sameClass, toTitleCase, cacheFresh */

var getCourses, classGroups, displayCourses, displayCollapsibleClasses, displaySingleCourses, cachedCourse, removeCachedCourse, displaySearch, searchForCoCourses, searchCoursesByType, searchCoursesByDepartment, searchCoursesByCourseName, searchCoursesByInstructor, validateCourseCode;

$(document).ready(function () {
    "use strict";
    getCourses();
});

// Retrieves course information from Parse
getCourses = function () {
    "use strict";
    if (jQuery.isEmptyObject(JSON.parse(sessionStorage.courses))) {
        retrieveCourses().then(storeCourses).then(displayCourses);
    } else {
        displayCourses();
    }
};

displayCourses = function () {
    "use strict";
    $("#courseDisplay").empty();
    var courses = JSON.parse(sessionStorage.courses);
	if (jQuery.isEmptyObject(courses)) {
		$("#courseDisplay").html("<div class='container'><h2>Not tracking any courses.</h2></div>");
	} else {
    	displayCollapsibleClasses(courses);
    }
};

displayCollapsibleClasses = function (courses) {
    "use strict";
    var classes, classView, classGroup, i, j;
    classes = classGroups();
    for (i = 0; i < Object.keys(classes).length; i++) {
        classView = new ClassView();
        classGroup = classes[Object.keys(classes)[i]];
        for (j = 0; j < classGroup.length; j++) {
            classView.addCourse(courses[classGroup[j]]);
        }
        $("#courseDisplay").append('<div class="col-lg-4 col-md-6">' + classView.buildCollapsible() + '</div>');
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
        $("#courseInformationDisplay .modal-dialog .modal-content .modal-body").append('<div class="col-lg-4 col-md-6">' + getTemporaryCourse(course).buildPanel() + '</div>');
    }
    $("#courseInformationDisplay").modal("show");
	clearTemporaryCourses();
};

validateCourseCode = function (courseCode) {
    "use strict";
    var courses;
    if ($("#courseID").val() == "") {
        $(".alert-invalid-courseid").html("<strong>No courseID entered.</strong>");
        $(".alert-invalid-courseid").show();
        $("#courseID").val('');
        return false;
    }
    if ($("#courseID").val() != courseCode || courseCode > 99999) {
        $(".alert-invalid-courseid").html("<strong>" + $("#courseID").val() + "</strong> is an invalid Course ID. Valid courseIDs must be 5 exactly 5 nubmers.");
        $(".alert-invalid-courseid").show();
        $("#courseID").val('');
        return false;
    }
    courses = JSON.parse(sessionStorage.courses);
    if (getCourseFromCache(courseCode) !== undefined) {
        $(".alert-invalid-courseid").html("<strong>" + $("#courseID").val() + "</strong> is already being tracked.");
        $(".alert-invalid-courseid").show();
        $("#courseID").val('');
        return false;
    }
    return true;
};

// Allows enter to submit course by calling #addCourse button click
$(document).on("keypress", "#courseID", function (event) {
    "use strict";
    if (event.which == 13) { $(".btn-add.btn-primary.btn-block").click(); }
});

// Conducts search for CoCourses
$(document).on("click", ".btn-search", function () {
    "use strict";
    var type, courseCode;
    type = $(this).attr("class").split(" ")[1].split("-")[1];
    courseCode = $(this).parent().parent().parent().parent().parent().attr("id").split("-")[1];
    getCourseFromCache(courseCode).findCoCourses(type, displaySearch);
});

$(document).on('click', ".btn-search-replacements", function () {
	var courseCode, course;
    courseCode = $(this).parent().parent().parent().parent().parent().attr("id").split("-")[1];
    course = getCourseFromCache(courseCode);
    course.findCoCourses(course.type, displaySearch);
});

$(document).on("click", ".btn-add", function (event) {
	"use strict";
	var courseCode, modal, lBtn;
	if ($(event.target).parent().parent().attr("class") == "panel panel-primary course-list-item") {
		courseCode = parseInt($(this).parent().parent().attr('id'), 10);
	    modal = $(this).parent().parent().parent().parent().parent().parent().parent();
	} else {
		courseCode = parseInt($("#courseID").val(), 10);
		$(".alert-invalid-courseid").hide();
	    if (!validateCourseCode(courseCode)) {
	        return;
	    }
	}
	lBtn = Ladda.create(this);
	lBtn.start();
    lBtn.setProgress('.50');
	Parse.Cloud.run('addCourse', {courseCode: courseCode}).then(function () {
        $("#courseID").val('');
    }, function (error) {
        if (error.code == 141) {
        	 lBtn.stop();
            $(".alert-invalid-courseid").html("Course <strong>" + $("#courseID").val() + "</strong> does not exist.");
            $(".alert-invalid-courseid").show();
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
    if (courseCode === undefined ) {
		courseCode = $(this).parent().parent().parent().attr("id");
		modal = $(this).parent().parent().parent().parent().parent().parent().parent().parent();
	}
    getCourseFromCache(courseCode).remove().then(function () {
		displayCourses();
    }, function(error) {
	    console.log(error);
        $(".alert-invalid-courseid").html("Whoops something went wrong.");
        $(".alert-invalid-courseid").show();
        displayCourses();
        lBtn.stop();
    }).then(function () {
        cacheFresh("refresh");
        if (modal !== undefined) {
	        modal.modal('hide');
        }
        storeCourses();
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