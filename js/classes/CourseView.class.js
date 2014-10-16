/*global Parse, cachedCourse, getCourseFromCache, clearTemporaryCourses, toTitleCase, addTemporaryCourse, removeCourseFromCache, console*/
/*jslint plusplus: true */

var getCourseHeader, getCourseName, getCourseDays, getCourseLocation, getCourseProgress, getCourseTime, getCourseInstructor, getCourseActions, buildPanel, buildSubPanel, buildCourse;

// CourseView class
function CourseView(course) {
    "use strict";
    this.instructor = course.instructor;
    this.courseName = course.courseName;
    this.courseIdentifier = course.courseIdentifier;
    this.courseCode = course.courseCode;
    this.max = course.max;
    this.enrolled = course.totalEnr;
    this.remaining = this.max - this.enrolled;
    this.waitlist = course.wl;
    this.final = course.final;
    this.placeURL = course.placeURL;
    this.placeBuilding = course.placeBuilding;
    this.time = course.time;
    this.days = course.days;
    this.type = course.type.toUpperCase();
    this.updatedAt = new Date(course.updatedAt);
}

CourseView.prototype.isEmpty = function () {
    "use strict";
    return this.enrolled === 0;
};

CourseView.prototype.isFull = function () {
    "use strict";
    return this.remaining <= 0;
};

CourseView.prototype.isWaitlist = function () {
    "use strict";
    return this.waitlist > 0;
};

CourseView.prototype.getCourseHeader = function () {
    "use strict";
    var infoString, typeString;
    infoString = '<span class="label panel-label label-type ';
    if (this.type === "LEC") {
    	typeString = 'label-warning';
    } else if (this.type === "DIS") {
        typeString = 'label-info';
    } else if (this.type === "LAB") {
    	typeString = 'label-danger';
    } else {
    	typeString = 'label-primary';
    }
    infoString += typeString + '">' + this.type + '</span>';
    infoString += '<span class="label panel-label label-identifier' + typeString + '">' + this.courseIdentifier.toUpperCase().replace(/ /g, '') + '</span>';
    infoString += ' <span class="label panel-label label-course-code label-default">' + this.courseCode + '</span>';
    return infoString;
};

CourseView.prototype.getCourseName = function () {
    "use strict";
    var courseName;
    courseName = '<span class="glyphicon glyphicon-pencil list-detail-glyphicon"></span> ' + this.courseName;
    return courseName;
};

CourseView.prototype.getCourseDays = function () {
    "use strict";
    var baseDayString, heldDayString, unheldDayString;
    baseDayString = '<span class="glyphicon glyphicon-calendar list-detail-glyphicon"></span>';
    heldDayString = '<span class="label label-primary label-day">';
    unheldDayString = '<span class="label label-default label-day">';
    if (this.days === "TBA") {
        return baseDayString + "TBA";
    }
    if (this.days.indexOf("M") > -1) {
        baseDayString += heldDayString;
    } else {
        baseDayString += unheldDayString;
    }
    baseDayString += 'Mon' + '</span>';
    if (this.days.indexOf("Tu") > -1) {
        baseDayString += heldDayString;
    } else {
        baseDayString += unheldDayString;
    }
    baseDayString += 'Tue' + '</span>';
    if (this.days.indexOf("W") > -1) {
        baseDayString += heldDayString;
    } else {
        baseDayString += unheldDayString;
    }
    baseDayString += 'Wed' + '</span>';
    if (this.days.indexOf("Th") > -1) {
        baseDayString += heldDayString;
    } else {
        baseDayString += unheldDayString;
    }
    baseDayString += 'Thu' + '</span>';
    if (this.days.indexOf("F") > -1) {
        baseDayString += heldDayString;
    } else {
        baseDayString += unheldDayString;
    }
    baseDayString += 'Fri' + '</span>';
    return baseDayString;
};

CourseView.prototype.getCourseLocation = function () {
    "use strict";
    var locationString;
    
    var roomfinderURL = "http://www.classrooms.uci.edu/GAC/";
    
    locationString = '<span class="glyphicon glyphicon-flag list-detail-glyphicon"></span> ';
    if (this.placeBuilding.indexOf("TBA") !== -1) {
        return locationString + this.placeBuilding;
    }
    locationString += '<a href="' + this.placeURL + '" target="_blank">' + this.placeBuilding + '</a>';
    
    var building = "";
    for (var charIndex = 0; charIndex < this.placeBuilding.length; charIndex++) {
        if (isNaN(this.placeBuilding[charIndex])) {
            building += this.placeBuilding[charIndex];
        }
    }
    
    return "<span class='glyphicon glyphicon-flag list-detail-glyphicon'></span> <a href='" + roomfinderURL + building + ".html' target='blank'>" + this.placeBuilding + "</a>";
    
    
    return locationString;
};

CourseView.prototype.getPercentFull = function () {
    "use strict";
    return this.enrolled / this.max * 100;
};

CourseView.prototype.getCourseProgress = function () {
    "use strict";
    var progressString;
    progressString = '<span class="glyphicon glyphicon-stats list-detail-glyphicon pull-left"></span><div class="progress">';
    if (this.isEmpty()) {
        progressString += '<div class="progress-bar progress-bar-info" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width:100%;">';
        progressString += 'Class empty!';
    } else if (this.isWaitlist() && this.isFull()) {
        progressString += '<div class="progress-bar progress-bar-warning" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width:100%">';
        progressString += this.waitlist + ' waitlisted';
    } else if (this.isFull()) {
        progressString += '<div class="progress-bar progress-bar-danger" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width:100%;">';
        progressString += 'Class full!';
    } else {
        progressString += '<div class="progress-bar progress-bar-success" role="progressbar" aria-valuenow="' + this.getPercentFull() + '" aria-valuemin="0" aria-valuemax="100" style="width:' + this.getPercentFull() + '%;">';
        progressString += this.remaining + ' spots left of ' + this.max;
    }
    progressString += '</div></div>';
    return progressString;
};

CourseView.prototype.getCourseTime = function () {
    "use strict";
    var timeString;
    timeString = '<span class="glyphicon glyphicon-time list-detail-glyphicon"></span> ';
    timeString += this.time;
    return timeString;
};

CourseView.prototype.getCourseInstructor = function () {
    "use strict";
    var instructorString;
    instructorString = '<span class="glyphicon glyphicon-user list-detail-glyphicon"></span> ';
    if (this.instructor.indexOf("STAFF") !== -1) {
        return instructorString + this.instructor;
    }
    instructorString += ' <a href="http://www.ratemyprofessors.com/search.jsp?queryBy=teacherName&queryoption=HEADER&query=';
    if (this.instructor.indexOf(", ") !== -1) {
        instructorString += this.instructor.split(", ")[0];
    } else {
        instructorString += this.instructor;
    }
    instructorString += '&queryBy=schoolDetails&schoolName=University+of+California+Irvine&dept=" target="_blank">';
    instructorString += this.instructor;
    instructorString += '</a>';
    return instructorString;
};

CourseView.prototype.getCourseActions = function () {
    "use strict";
    if (getCourseFromCache(this.courseCode) === undefined) {
        return '<button type="button" class="btn btn-block btn-success btn-add ladda-button" data-loading-text="Adding...">Add</button>';
    }
    var actionString;
    actionString = '<div class="btn-group btn-block dropup">';
    actionString += '<button type="button" class="btn col-xs-10 btn-default btn-remove ladda-button" data-loading-text="Removing...">Remove</button>';
    actionString += '<button type="button" class="btn col-xs-2 btn-default dropdown-toggle" data-toggle="dropdown">';
    actionString += '<span class="caret"></span>';
    actionString += '<span class="sr-only">Toggle Dropdown</span>';
    actionString += '</button>';
    actionString += '<ul class="dropdown-menu col-md-12" role="menu">';
    actionString += '<li><a class="btn-search-replacements" href="#">Search for replacements</a></li>';
    actionString += '<li class="divider"></li>';
    if (this.type !== "LEC") {
        actionString += '<li><a class="btn-search search-Lec" href="#">Search for lectures</a></li>';
    }
    if (this.type !== "DIS") {
        actionString += '<li><a class="btn-search search-Dis" href="#">Search for discussions</a></li>';
    }
    if (this.type !== "LAB") {
        actionString += '<li><a class="btn-search search-Lab" href="#">Search for labs</a></li>';
    }
    actionString += '</ul>';
    actionString += '</div>';
    return actionString;
};

CourseView.prototype.buildPanelBody = function () {
    "use strict";
    var bodyString;
    bodyString = '<ul class="list-group">';
    bodyString += '<li class="list-group-item">' + this.getCourseName() + '</li>';
    bodyString += '<li class="list-group-item">' + this.getCourseInstructor() + '</li>';
    bodyString += '<li class="list-group-item">' + this.getCourseDays() + '</li>';
    bodyString += '<li class="list-group-item">' + this.getCourseTime() + '</li>';
    bodyString += '<li class="list-group-item">' + this.getCourseLocation() + '</li>';
    bodyString += '<li class="list-group-item">' + this.getCourseProgress() + '</li>';
    bodyString += '</ul>';
    return bodyString;
};

CourseView.prototype.buildDefaultPanel = function () {
    "use strict";
    var courseString, colorString;
    courseString = "<div id='" + this.courseCode + "' class='panel panel-primary course-list-item'>";
    
    if (this.type === "LEC") {
		colorString = '#F0AD4E';
    } else if (this.type === "DIS") {
		colorString = '#5BC0DE';
    } else if (this.type === "LAB") {
		colorString = '#D9534F';
    }
    
    if (colorString) {
	    courseString += '<div class="panel-heading" style="background-color: ' + colorString + '!important;">';
    } else {
	    courseString += '<div class="panel-heading>"';
    }

    courseString += '<h3 class="panel-title">' + this.getCourseHeader() + '</h3></div>';
    courseString += this.buildPanelBody();
    courseString += '<div class="panel-footer">';
    courseString += this.getCourseActions();
    courseString += '</div>';
    courseString += '</div>';
    return courseString;
};

CourseView.prototype.buildCollapsiblePanel = function (num, mainCourseCode) {
    "use strict";
    var courseString, colorString, hours, title;
    courseString = '<div class="panel panel-primary">';

	if (this.type === "LEC") {
		colorString = '#F0AD4E';
    } else if (this.type === "DIS") {
		colorString = '#5BC0DE';
    } else if (this.type === "LAB") {
		colorString = '#D9534F';
    }
    
    if (colorString) {
	    courseString += '<div class="panel-heading" style="background-color:' + colorString + '!important;">';
    } else {
	    courseString += '<div class="panel-heading>"';
    }
	hours = Math.round(Math.abs(new Date - this.updatedAt) / 36e5);
	title = "Updated about " + hours;
	if (hours > 1) {
		title += " hours ago"
	} else {
		title += " hour ago"
	}
    courseString += '<h4 class="panel-title">';
    courseString += '<a data-toggle="collapse" data-parent="#accordion-' + mainCourseCode + '" href="#collapse' + num + '-' + this.courseCode + '" title="' + title + '" >';
    courseString += this.getCourseHeader();
    courseString += '</a>';
    courseString += '</h4>';
    courseString += '</div>';
    if (num === 0) {
        courseString += '<div id="collapse' + num + '-' + this.courseCode + '" class="panel-collapse collapse in">';
    } else {
        courseString += '<div id="collapse' + num + '-' + this.courseCode + '" class="panel-collapse collapse">';
    }
    courseString += '<div class="panel-body">';
    courseString += this.buildPanelBody();
    courseString += this.getCourseActions();
    courseString += '</div>';
    courseString += '</div>';
    courseString += '</div>';
    return courseString;
};

CourseView.prototype.findCoCourses = function (type, callback) {
    "use strict";
    var courseQuery;
    clearTemporaryCourses();
    courseQuery = new Parse.Query("Course");
    courseQuery.equalTo("courseName", this.courseName);
    courseQuery.equalTo("courseIdentifier", this.courseIdentifier);
    courseQuery.equalTo("type", type.toTitleCase());
	courseQuery.find().then(addTemporaryCourses).then(callback);
};

CourseView.prototype.remove = function () {
    "use strict";
    return Parse.Cloud.run("removeCourse", {courseCode: this.courseCode});
};