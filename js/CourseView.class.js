/*global navigator*/

var getCourseInfo, getCourseName, getCourseReqs, getCourseDays, getCourseLocation, getCourseProgress, getCourseTime, getCourseInstructor, getCourseActions, buildPanel, buildSubPanel, buildCollapsible, buildCourse;

// CourseView class
function CourseView(course) {
    "use strict";
    this.instructor = course.instructor;
    this.courseName = course.courseName;
    this.courseIdentifier = course.courseIdentifier;
    this.courseCode = course.courseCode;
    this.max = course.max;
    this.enrolled = course.totalEnr;
    this.waitlist = course.wl;
    this.final = course.final;
    this.placeURL = course.placeURL;
    this.placeBuilding = course.placeBuilding;
    this.time = course.time;
    this.days = course.days;
    this.type = course.type;
    this.cocourses = course.cocourses;
    this.prerequisites = course.prerequisites;
};

CourseView.prototype.getCourseInfo = function () {
    "use strict";
    var infoString;
    infoString = '<span class="label label-info panel-label label-type">' +
    this.type.toUpperCase() +
    '</span> ' +
    '<span class="label label-success panel-label label-identifier">' +
    this.courseIdentifier.toUpperCase().replace(/ /g, '') +
    '</span>' +
    this.getCourseReqs() +
    ' <span class="badge pull-right course-view-courseID">' +
    this.courseCode +
    '</span>';
	return infoString;
};

CourseView.prototype.getCourseName = function () {
    "use strict";
    var courseName;
    courseName = '<span class="glyphicon glyphicon-pencil list-detail-glyphicon">';
    courseName += '</span> ';
    courseName += this.courseName;
    return courseName;
};

CourseView.prototype.getCourseReqs = function () {
    "use strict";
    var additionalClasses;
    additionalClasses = '';
    if (this.prerequisites) {
        additionalClasses += ' <span class="label label-warning top panel-label label-reqss" title="Prerequisites required" data-original-title="Tooltip on right">P</span>';
    }
    if (this.cocourses) {
        additionalClasses += ' <span class="label label-warning top panel-label" title="Cocourses needed" data-original-title="Tooltip on right">C</span>';
    }
    return additionalClasses;
};

CourseView.prototype.getCourseDays = function () {
    "use strict";
    if (this.days == "TBA") {
        return "TBA";
    }
    var dayString, heldDays, predefinedDays, i;
    dayString = '<span class="glyphicon glyphicon-calendar list-detail-glyphicon"></span>';
    if (this.days.indexOf("M") > -1) {
        dayString += '<span class="label label-primary label-day">Mon</span>';
    } else {
	    dayString += '<span class="label label-default label-day">Mon</span>';
    }
    if (this.days.indexOf("Tu") > -1) {
        dayString += '<span class="label label-primary label-day">Tue</span>';
    } else {
	    dayString += '<span class="label label-default label-day">Tue</span>';
    }
    if (this.days.indexOf("W") > -1) {
        dayString += '<span class="label label-primary label-day">Wed</span>';
    } else {
	    dayString += '<span class="label label-default label-day">Wed</span>';
    }
    if (this.days.indexOf("Th") > -1) {
        dayString += '<span class="label label-primary label-day">Thu</span>';
    } else {
	    dayString += '<span class="label label-default label-day">Thu</span>';
    }
    if (this.days.indexOf("F") > -1) {
        dayString += '<span class="label label-primary label-day">Fri</span>';
    } else {
	    dayString += '<span class="label label-default label-day">Fri</span>';
    }
    return dayString;
};

CourseView.prototype.getCourseLocation = function () {
    "use strict";
    var locationString;
    locationString = '<span class="glyphicon glyphicon-flag list-detail-glyphicon"></span>' +
    ' <a href="' + this.placeURL + '" target="_blank">' + this.placeBuilding + '</a>';
    return locationString;
};

CourseView.prototype.getCourseProgress = function () {
    "use strict";
    var remaining, progressString, coursePercentFull;
	remaining = this.max - this.enrolled;
	progressString = '<span class="glyphicon glyphicon-stats list-detail-glyphicon pull-left">' +
	'</span>' + 
	'<div class="progress">';
    if (this.enrolled == 0) {
        progressString += '<div class="progress-bar progress-bar-info" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width:100%;">' +
        'Class empty!';
    } else if (this.waitlist > 0 && remaining == 0) {
        progressString += '<div class="progress-bar progress-bar-warning" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width:100%">' +
        this.waitlist + ' waitlisted';
	} else if (remaining == 0) {
        progressString += '<div class="progress-bar progress-bar-danger" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width:100%;">' + 
        'Class full!';
    } else {
    	coursePercentFull = this.enrolled / this.max * 100;
		if (coursePercentFull < 30) {
			coursePercentFull *= 3;
		}
	    progressString += '<div class="progress-bar progress-bar-success" role="progressbar" aria-valuenow="' + coursePercentFull + '" aria-valuemin="0" aria-valuemax="100" style="width:' + coursePercentFull + '%;">' + 
	    remaining + ' spots left of ' + this.max;
    }
    progressString += '</div></div>';
    return progressString;
};

CourseView.prototype.getCourseTime = function () {
    "use strict";
    var timeString;
    timeString = '<span class="glyphicon glyphicon-time list-detail-glyphicon"></span> ' +
    this.time;
    return timeString;
};

CourseView.prototype.getCourseInstructor = function () {
    "use strict";
    var instructorString;
    instructorString = '<span class="glyphicon glyphicon-user list-detail-glyphicon">' + 
	'</span> <a href="http://www.ratemyprofessors.com/SelectTeacher.jsp?searchName=' + 
	this.instructor + 
	'&search_submit1=Search&sid=1074" target="_blank">' + 
	this.instructor + 
	'</a>';
	return instructorString;
};

CourseView.prototype.getCourseActions = function () {
    "use strict";
    var actionString;
	if (!cachedCourse(this.courseCode)) {
		actionString = '<button type="button" class="btn btn-block btn-success btn-add ladda-button" data-loading-text="Adding...">Add</button>';
	} else {
    actionString = '<div class="btn-group btn-block dropup">' +
    '<button type="button" class="btn col-xs-10 btn-danger btn-remove ladda-button" data-loading-text="Removing...">Remove</button>' +
	'<button type="button" class="btn col-xs-2 btn-default dropdown-toggle" data-toggle="dropdown">' +
    '<span class="caret"></span>' +
    '<span class="sr-only">Toggle Dropdown</span>' +
	'</button>' +
	'<ul class="dropdown-menu col-md-12" role="menu">' +
    '<li><a class="btn-search-dis" href="#">Search for discussions</a></li>' +
    '<li><a class="btn-search-lec" href="#">Search for lectures</a></li>' +
    '<li><a class="btn-search-lab" href="#">Search for labs</a></li>' +
	'</ul>' +
	'</div>';
	}
	return actionString;
};

CourseView.prototype.buildPanel = function () {
    "use strict";
    var courseString;
    courseString = '<div class="col-lg-4 col-md-6">';
    courseString += "<div id='" + this.courseCode + "' class='panel panel-primary course-list-item'>";
    courseString += '<div class="panel-heading">';
    courseString += '<h3 class="panel-title">';
    courseString += this.getCourseInfo();
    courseString += '</h3>';
    courseString += '</div>';
    courseString += '<ul class="list-group">';
    courseString += '<li class="list-group-item">' + this.getCourseName() + '</li>';
    courseString += '<li class="list-group-item">' + this.getCourseInstructor() + '</li>';
    courseString += '<li class="list-group-item">' + this.getCourseDays() + '</li>';
    courseString += '<li class="list-group-item">' + this.getCourseTime() + '</li>';
    courseString += '<li class="list-group-item">' + this.getCourseLocation() + '</li>';
    courseString += '<li class="list-group-item">' + this.getCourseProgress() + '</li>';
    courseString += '</ul>';
	courseString += '<div class="panel-footer">';
	courseString += this.getCourseActions();
	courseString += '</div>';
    courseString += "</div>";
    courseString += "</div>";
    return courseString;
};

CourseView.prototype.buildSubPanel = function (num, mainCourseCode) {
	var courseString;
	courseString = '<div class="panel panel-primary">' +
	'<div class="panel-heading">' +
	'<h4 class="panel-title">' +
	'<a data-toggle="collapse" data-parent="#accordion-' + mainCourseCode + '" href="#collapse' + num + '-' + this.courseCode + '">' +
	this.getCourseInfo() + 
	'</a>' +
	'</h4>' +
	'</div>';
	if (num == 0) {
		courseString += '<div id="collapse' + num + '-' + this.courseCode + '" class="panel-collapse collapse in">';
	} else {
		courseString += '<div id="collapse' + num + '-' + this.courseCode + '" class="panel-collapse collapse">';
	}
	courseString += '<div class="panel-body">';
	courseString += '<ul class="list-group">';
    courseString += '<li class="list-group-item">' + this.getCourseName() + '</li>';
    courseString += '<li class="list-group-item">' + this.getCourseInstructor() + '</li>';
    courseString += '<li class="list-group-item">' + this.getCourseDays() + '</li>';
    courseString += '<li class="list-group-item">' + this.getCourseTime() + '</li>';
    courseString += '<li class="list-group-item">' + this.getCourseLocation() + '</li>';
    courseString += '<li class="list-group-item">' + this.getCourseProgress() + '</li>';
    courseString += '</ul>';
	courseString += this.getCourseActions();
	courseString += '</div>';
	courseString += '</div>';
	courseString += '</div>';
	return courseString;
};

CourseView.prototype.buildCollapsible = function () {
	var collapsible, total;
	total = 3;
	collapsible = '<div class="col-lg-4 col-md-6">';
	collapsible += '<div class="panel-group course-list-item" id="accordion-' + this.courseCode + '">';
	for (var i = 0; i < total; i++) {
		collapsible += this.buildSubPanel(i);	
	}
	collapsible += '</div>';
	collapsible += '</div>';
	return collapsible;
};

CourseView.prototype.buildCourse = function () {
	return this.buildPanel();
	/* return this.buildCollapsible(); */
};