/*global cachedCourse*/

var getCourseHeader, getCourseName, getCourseDays, getCourseLocation, getCourseProgress, getCourseTime, getCourseInstructor, getCourseActions, buildPanel, buildSubPanel, buildCourse;

// CourseView class
function CourseView(course) {
    "use strict";
    this.instructor = course.instructor;
    this.courseName = course.courseName;
    this.courseIdentifier = course.courseIdentifier.toUpperCase().replace(/ /g, '');
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
}

CourseView.prototype.getCourseHeader = function () {
    "use strict";
    var infoString;
    infoString = '<span class="label panel-label label-type ';
    if (this.type == "LEC") {
        infoString += 'label-warning';
    } else if (this.type == "DIS") {
        infoString += 'label-info';
    } else if (this.type == "LAB") {
        infoString += 'label-danger';
    } else {
        infoString += 'label-primary';
    }
    infoString += '">' + this.type + '</span>';
    infoString += '<span class="label panel-label label-identifier label-success">' + this.courseIdentifier + '</span>';
    infoString += ' <span class="label panel-label label-course-code label-default">' + this.courseCode + '</span>';
    return infoString;
};

CourseView.prototype.getCourseName = function () {
    "use strict";
    var courseName;
    courseName = '<span class="glyphicon glyphicon-pencil list-detail-glyphicon"></span> ' + this.courseName;;
    return courseName;
};

CourseView.prototype.getCourseDays = function () {
    "use strict";
    var baseDayString, heldDayString, unheldDayString;
    baseDayString = '<span class="glyphicon glyphicon-calendar list-detail-glyphicon"></span>';
    heldDayString = '<span class="label label-primary label-day">';
    unheldDayString = '<span class="label label-default label-day">';
    if (this.days == "TBA") {
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
    baseDayString += 'Thu' + '</span>'
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
    locationString = '<span class="glyphicon glyphicon-flag list-detail-glyphicon"></span> ';
    if (this.placeBuilding.indexOf("TBA") != -1) {
	    return locationString + this.placeBuilding;
    }
    locationString += '<a href="' + this.placeURL + '" target="_blank">' + this.placeBuilding + '</a>';
    return locationString;
};

CourseView.prototype.isEmpty = function () {
	"use strict";
	return this.enrolled == 0;	
};

CourseView.prototype.isFull = function () {
	"use strict";
	return this.remaining <= 0;
};

CourseView.prototype.isWaitlist = function () {
	"use strict";
	return this.waitlist > 0;
};

CourseView.prototype.percentFull = function () {
	return this.enrolled / this.max * 100;
};

CourseView.prototype.getCourseProgress = function () {
    "use strict";
    var remaining, progressString, coursePercentFull;
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
        progressString += '<div class="progress-bar progress-bar-success" role="progressbar" aria-valuenow="' + coursePercentFull + '" aria-valuemin="0" aria-valuemax="100" style="width:' + this.percentFull() + '%;">';
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
    if (this.instructor.indexOf("STAFF") != -1) {
	    return instructorString + "" + this.instructor;
    }
    instructorString += ' <a href="http://www.ratemyprofessors.com/SelectTeacher.jsp?searchName=';
    if (this.instructor.indexOf(", ") != -1) {
		instructorString += this.instructor.split(", ")[0];    
    } else {
	    instructorString += this.instructor;
    }
    instructorString += '&search_submit1=Search&sid=1074" target="_blank">';
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
    actionString += '<button type="button" class="btn col-xs-10 btn-danger btn-remove ladda-button" data-loading-text="Removing...">Remove</button>';
    actionString += '<button type="button" class="btn col-xs-2 btn-default dropdown-toggle" data-toggle="dropdown">';
    actionString += '<span class="caret"></span>';
    actionString += '<span class="sr-only">Toggle Dropdown</span>';
    actionString += '</button>';
    actionString += '<ul class="dropdown-menu col-md-12" role="menu">';
    actionString += '<li><a class="btn-search-replacements" href="#">Search for replacements</a></li>';
	actionString += '<li class="divider"></li>';
	if (this.type != "LEC") {
		actionString += '<li><a class="btn-search search-Lec" href="#">Search for lectures</a></li>';	
	}
	if (this.type != "DIS") {
		actionString += '<li><a class="btn-search search-Dis" href="#">Search for discussions</a></li>';	
	}
	if (this.type != "LAB") {
		actionString += '<li><a class="btn-search search-Lab" href="#">Search for labs</a></li>';	
	}
    actionString += '</ul>';
    actionString += '</div>';
    return actionString;
};

CourseView.prototype.buildPanelBody = function() {
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
    var courseString;
    courseString = "<div id='" + this.courseCode + "' class='panel panel-primary course-list-item'>";
    courseString += '<div class="panel-heading"><h3 class="panel-title">' + this.getCourseHeader() + '</h3></div>';
    courseString += this.buildPanelBody();
    courseString += '<div class="panel-footer">';
    courseString += this.getCourseActions();
    courseString += '</div>';
    courseString += '</div>';
    return courseString;
};

CourseView.prototype.buildCollapsiblePanel = function (num, mainCourseCode) {
    "use strict";
    var courseString;
    courseString = '<div class="panel panel-primary">';
    courseString += '<div class="panel-heading">';
    courseString += '<h4 class="panel-title">';
    courseString += '<a data-toggle="collapse" data-parent="#accordion-' + mainCourseCode + '" href="#collapse' + num + '-' + this.courseCode + '">';
    courseString += this.getCourseHeader();
    courseString += '</a>';
    courseString += '</h4>';
    courseString += '</div>';
    if (num == 0) {
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
    var Course, courseQuery, courseName, courseIdentifier, coCourseQuery, exclusionQuery, i;
    clearTemporaryCourses();
    Course = Parse.Object.extend("Course");
    courseQuery = new Parse.Query(Course);
    courseQuery.equalTo("courseCode", parseInt(this.courseCode, 10));
    courseQuery.first().then(function (course) {
        courseName = course.get("courseName");
        courseIdentifier = course.get("courseIdentifier");        
        coCourseQuery = new Parse.Query(Course);
        coCourseQuery.equalTo("courseName", courseName);
        coCourseQuery.equalTo("courseIdentifier", courseIdentifier);
        coCourseQuery.equalTo("type", toTitleCase(type));
        return coCourseQuery.find();
    }).then(function (results) {
        for (i = 0; i < results.length; i++) {
        	if (getCourseFromCache(results[i].attributes.courseCode) === undefined) {
    			addTemporaryCourse(results[i].attributes);
            }
        }
    }).then(callback);
};

CourseView.prototype.remove = function () {
	"use strict";
	var courseCode;
	courseCode = this.courseCode;
    return Parse.Cloud.run("removeCourse", {courseCode: courseCode}).then(function () {
		removeCourseFromCache(courseCode);
    }, function (error) {
        console.log(error);
    });	
};