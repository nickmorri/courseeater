/*global window, CourseView, ClassView, Ladda, jQuery, storeCourses, sameClass, toTitleCase, cacheFresh, $, document, sessionStorage, retrieveCourses, getTemporaryCourse, clearTemporaryCourses, getCourseFromCache, Parse, console */
/*jslint plusplus: true */

var initialize, getCourses, displayCourses, classGroups, displayCollapsibleClasses, displaySearch, displayAlertError, validateCourseCode;

initialize = function () {
	"use strict";
	getCourseLists();	
	getCourses();
	var intercom = Intercom.getInstance();
	intercom.on('notice', handleNotice);
};

// Handles messages from other tabs
handleNotice = function (notice) {
	if (notice.code === 300 && notice.page !== window.location.pathname.substr(1)) displayCourses();
};

// Initializes calendar. Loads data if needed.
getCourses = function () {
    "use strict";
    if (jQuery.isEmptyObject(getStoredCourses())) {
        retrieveCourses(displayCourses);
    } else {
        displayCourses();
    }
};

// Prepares HTML for a single CourseList
getCourseListHTML = function(list) {
	"use strict";
	if (list.active) return "<li class='active'><a class='course-list-item-title'>" + list.title + " <span class='glyphicon glyphicon-cog pull-right'></span></a><span class='hidden'>" + list.shared + "</span></li>";
	return "<li><a class='course-list-item-title'>" + list.title + " </a><span class='hidden'>" + list.shared + "</span></li>";
};

// Retrieves and displays CourseLists
getCourseLists = function () {
	"use strict";
	var courseListQuery, display;
	display = $("#courseListDisplay");
	display.html('<li class="divider"></li><li><a id="createCourseList" href="#">New <span class="glyphicon glyphicon-plus pull-right"></span></a></li>');
	courseListQuery = new Parse.Query("CourseList");
	courseListQuery.equalTo("owner", Parse.User.current());
	courseListQuery.each(function(list) {
		display.prepend(getCourseListHTML(list.attributes));
	});
};

/*
$(document).on("click", ".btn-duplicate-courselist", function () {
	var courseListTitle;
	courseListTitle = $(this).parent().parent().children(".modal-header").children(".modal-title").children("input").val().trim();
	$(".spinner").show();
	$("#courseDisplay").hide();
	Parse.Cloud.run("duplicateCourseList", {title: courseListTitle}).then(function () {
		getCourseLists();
		clearCachedCourses().then(getCourses);
	}, function (error) {
		console.log(error);
	});
});
*/

// Collapses Navbar
closeNavbarDropdown = function () {
	"use strict"
	if ($(".navbar-header .navbar-toggle").css("display") != "none") $(".navbar-header .navbar-toggle").trigger("click");
};

// Handles courseListSettings modal
openCourseListSettings = function (newList, courseListTitle, placeholder) {
	var title;
	title = $("#courseListSettings .modal-dialog .modal-content .modal-header .modal-title input");
	title.val(courseListTitle);
	if (newList) {
		title.attr("placeholder", placeholder);
		// Hiding the erase button
		$("#courseListSettings").children(".modal-dialog").children(".modal-content").children(".modal-footer").children(".btn-delete-courselist").hide();
		// Editing text from save to create for a new CourseList
		$("#courseListSettings").children(".modal-dialog").children(".modal-content").children(".modal-footer").children(".btn-save-courselist").text("Create");
	} else {
		// Sharing settings
		if ($(event.target).parent().parent().children(".hidden").text() == "true") {
			$('#courseListSettings .modal-dialog .modal-content .modal-body .radio input[name=listPrivacy]').filter('[value="shared"]').attr('checked', true);
		} else {
			$('#courseListSettings .modal-dialog .modal-content .modal-body .radio input[name=listPrivacy]').filter('[value="private"]').attr('checked', true);
		}
	}
	// Saving show modal method for end so view is built before display
	$("#courseListSettings").modal("show");
	closeNavbarDropdown();
};

// Dispatches to approriate display function
displayCourses = function () {
    "use strict";
    var courses, target;
    target = $("#courseDisplay");
    target.empty();
    courses = getStoredCourses();
    if (jQuery.isEmptyObject(courses)) {
        target.html("<div class='container'><h2>Not tracking any courses.</h2></div>");
    } else {
        displayCollapsibleClasses(courses);
    }
    $(".spinner").hide();
    $("#courseDisplay").show();
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
    temporaryCourses = getTemporaryCourses();
    if (jQuery.isEmptyObject(temporaryCourses)) {
        $("#courseInformationDisplay .modal-dialog .modal-content").html("<div class='modal-header'><h4 class='modal-title'>No results</h4></div>");
        $("#courseInformationDisplay").modal("show");
        return;
    }
    $("#courseInformationDisplay .modal-dialog .modal-content").html("<div class='modal-header'><button type='button' class='close' data-dismiss='modal'><span aria-hidden='true'>&times;</span><span class='sr-only'>Close</span></button><h4 class='modal-title'>Results</h4></div><div class='modal-body row'></div>");
    for (course in temporaryCourses) {
        $("#courseInformationDisplay .modal-dialog .modal-content .modal-body").append('<div class="col-lg-4 col-md-6">' + getTemporaryCourse(course).buildDefaultPanel() + '</div>');
    }
    $("#courseInformationDisplay").modal("show");
    clearTemporaryCourses();
};

// Displays error text in a controlled location
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

// Resets courseListSettings to defaults on close
$(document).on("hidden.bs.modal", "#courseListSettings", function (e) {
	$("#courseListSettings").children(".modal-dialog").children(".modal-content").children(".modal-footer").children(".btn-delete-courselist").show();
	$("#courseListSettings").children(".modal-dialog").children(".modal-content").children(".modal-header").children(".modal-title").children("input").attr("placeholder", "");
	$("#courseListSettings").children(".modal-dialog").children(".modal-content").children(".modal-footer").children(".btn-save-courselist").text("Save");
});

// Saves CourseList
$(document).on("click", ".btn-save-courselist", function () {
	var courseListTitle, oldTitle;
	courseListTitle = $("#courseListSettings .modal-dialog .modal-content .modal-header .modal-title input").val().trim();
	if ($("#courseListSettings .modal-dialog .modal-content .modal-header .modal-title input").attr("placeholder") == "Enter new list title") {
		Parse.Cloud.run("createCourseList", {title: courseListTitle}).then(function () {
			$("#courseListDisplay").children(".active").children("a").children("span").remove();
			$("#courseListDisplay").children(".active").removeClass("active");	
			$("#courseListDisplay").prepend("<li class='active'><a href='#' class='course-list-item-title'>" + courseListTitle + "<span class='glyphicon glyphicon-cog pull-right'></a></li>");
			$("#courseListSettings").modal("hide");
			$(".spinner").show();
			$("#courseDisplay").hide();
			clearCachedCourses().then(getCourses);
		});
	} else {
		privacyState = $('#courseListSettings .modal-dialog .modal-content .modal-body .radio input[name=listPrivacy]:checked').val();
		oldTitle = $("#courseListDisplay").children(".active").children("a").text().trim();
		Parse.Cloud.run("updateCourseList", {oldTitle: oldTitle, newTitle: courseListTitle, shared: privacyState}).then(function () {
			$("#courseListDisplay").children(".active").children("a").html(courseListTitle + "<span class='glyphicon glyphicon-cog pull-right'>");
			$("#courseListSettings").modal("hide");
		});
	}
	if ($('.navbar-header .navbar-toggle').css('display') !='none'){
        $(".navbar-header .navbar-toggle").trigger( "click" );
    }
});

// Deletes CourseList
$(document).on("click", ".btn-delete-courselist", function () {
	var courseListTitle;
	courseListTitle = $(this).parent().parent().children(".modal-header").children(".modal-title").children("input").val().trim();
	$(".spinner").show();
	$("#courseDisplay").hide();
	Parse.Cloud.run("deleteCourseList", {title: courseListTitle}).then(function () {
		getCourseLists();
		clearCachedCourses().then(getCourses);
	}, function(error) {
		if (error.message == "Last CourseList cannot be deleted.") {
			displayAlertError(error.message);
			$(".spinner").hide();
			$("#courseDisplay").show();
			closeNavbarDropdown();
		} else {
			console.log(error);
		}
		
	});
});

// Handles user interactions on courseListDisplay
$(document).on("click", "#courseListDisplay li", function (event) {
	var courseListTitle, eventThis;
	courseListTitle = $(this).children("a").text().trim();
	eventThis = $(this);
	if (eventThis.children("a").attr("id") == "createCourseList") {
		openCourseListSettings(true, "", "Enter new list title");
		return;
	} else if ($(event.target).attr("class") == "glyphicon glyphicon-cog pull-right") {
		openCourseListSettings(false, courseListTitle, "");
		return;
	} else if ($(event.target).parent().attr("class") == "active") {
		event.stopPropagation();
		return;
	} else {
		// Temporarily shows loading spinner and hides courseDisplay div
		$(".spinner").show();
		$("#courseDisplay").hide();
		closeNavbarDropdown();
		Parse.Cloud.run("changeActiveCourseList", {title: courseListTitle.trim()}).then(function () {
			// Clears courses and retrives new set after context switch
			clearCachedCourses().then(getCourses);
			// Removes settings option from inactive listing and removes active class to indicate switch of context
			$("#courseListDisplay").children(".active").children("a").children("span").remove();
			$("#courseListDisplay").children(".active").removeClass("active");
			// Adds active class and settings option to the now active list
			eventThis.addClass("active");
			eventThis.children("a").append("<span class='glyphicon glyphicon-cog pull-right'>");
		});
		return;
	}
});

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
        if (!validateCourseCode(courseCode, displayAlertError)) return;
    }
    lBtn = Ladda.create(this);
    lBtn.start();
    lBtn.setProgress('.50');
    Parse.Cloud.run('addCourse', {courseCode: courseCode}).then(function () {
        lBtn.stop();
        cacheFresh("refresh");
        if (modal !== undefined) modal.modal('hide');
        getCourses();
    }, function (error) {
	    if (error.code === 141) {
            lBtn.stop();
            displayAlertError("Course <strong>" + $("#courseID").val() + "</strong> does not exist.");
        } else console.log(error);
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
        if (modal !== undefined) modal.modal('hide');
        retrieveCourses().then(storeCourses);
    });
});

// Clears any sessionStorage data and reloads data from Parse
$(document).on("click", ".refresh-data", function () {
    "use strict";
    var btn;
    btn = Ladda.create(this);
    btn.start();
    clearCachedCourses().then(getCourses);
    $(".alert-error").hide();
    btn.stop();
});

$(document).ready(initialize);