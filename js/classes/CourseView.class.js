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
    infoString += '">';
    infoString += this.type;
    infoString += '</span>';
    infoString += '<span class="label panel-label label-identifier label-success">';
    infoString += this.courseIdentifier;
    infoString += '</span>';
    infoString += ' <span class="label panel-label label-course-code label-default">';
    infoString += this.courseCode;
    infoString += '</span>';
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

CourseView.prototype.getCourseDays = function () {
    "use strict";
    if (this.days == "TBA") {
        return "TBA";
    }
    var dayString;
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
    locationString = '<span class="glyphicon glyphicon-flag list-detail-glyphicon"></span>';
    locationString += ' <a href="' + this.placeURL + '" target="_blank">' + this.placeBuilding + '</a>';
    return locationString;
};

CourseView.prototype.getCourseProgress = function () {
    "use strict";
    var remaining, progressString, coursePercentFull;
    remaining = this.max - this.enrolled;
    progressString = '<span class="glyphicon glyphicon-stats list-detail-glyphicon pull-left">';
    progressString += '</span>';
    progressString += '<div class="progress">';
    if (this.enrolled == 0) {
        progressString += '<div class="progress-bar progress-bar-info" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width:100%;">';
        progressString += 'Class empty!';
    } else if (this.waitlist > 0 && remaining <= 0) {
        progressString += '<div class="progress-bar progress-bar-warning" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width:100%">';
        progressString += this.waitlist + ' waitlisted';
    } else if (remaining <= 0) {
        progressString += '<div class="progress-bar progress-bar-danger" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width:100%;">';
        progressString += 'Class full!';
    } else {
        coursePercentFull = this.enrolled / this.max * 100;
        if (coursePercentFull < 30) {
            coursePercentFull *= 3;
        }
        progressString += '<div class="progress-bar progress-bar-success" role="progressbar" aria-valuenow="' + coursePercentFull + '" aria-valuemin="0" aria-valuemax="100" style="width:' + coursePercentFull + '%;">';
        progressString += remaining + ' spots left of ' + this.max;
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
    instructorString = '<span class="glyphicon glyphicon-user list-detail-glyphicon">';
    instructorString += '</span> <a href="http://www.ratemyprofessors.com/SelectTeacher.jsp?searchName=';
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
    var actionString;
    if (getCourseFromCache(this.courseCode) === undefined) {
        actionString = '<button type="button" class="btn btn-block btn-success btn-add ladda-button" data-loading-text="Adding...">Add</button>';
    } else {
        actionString = '<div class="btn-group btn-block dropup">';
        actionString += '<button type="button" class="btn col-xs-10 btn-danger btn-remove ladda-button" data-loading-text="Removing...">Remove</button>';
        actionString += '<button type="button" class="btn col-xs-2 btn-default dropdown-toggle" data-toggle="dropdown">';
        actionString += '<span class="caret"></span>';
        actionString += '<span class="sr-only">Toggle Dropdown</span>';
        actionString += '</button>';
        actionString += '<ul class="dropdown-menu col-md-12" role="menu">';
        actionString += '<li><a class="btn-search search-Dis" href="#">Search for discussions</a></li>';
        actionString += '<li><a class="btn-search search-Lec" href="#">Search for lectures</a></li>';
        actionString += '<li><a class="btn-search search-Lab" href="#">Search for labs</a></li>';
        actionString += '</ul>';
        actionString += '</div>';
    }
    return actionString;
};

CourseView.prototype.getSchedulingCourseActions = function () {
    "use strict";
    var actionString;
    if (getCourseFromCache(this.courseCode) === undefined) {
        actionString = '<button type="button" class="btn btn-block btn-success btn-add ladda-button" data-loading-text="Adding...">Add</button>';
    } else {
        actionString = '<div class="btn-group btn-block dropup">';
        actionString += '<button type="button" class="btn col-xs-10 btn-danger btn-remove ladda-button" data-loading-text="Removing...">Remove</button>';
        actionString += '<button type="button" class="btn col-xs-2 btn-default dropdown-toggle" data-toggle="dropdown">';
        actionString += '<span class="caret"></span>';
        actionString += '<span class="sr-only">Toggle Dropdown</span>';
        actionString += '</button>';
        actionString += '<ul class="dropdown-menu col-md-12" role="menu">';
        actionString += '<li><a class="btn-search-replacements" href="#">Search for replacements</a></li>';
        actionString += '</ul>';
        actionString += '</div>';
    }
    return actionString;
};

CourseView.prototype.buildSchedulingPanel = function () {
    "use strict";
    var courseString;
    courseString = "<div id='" + this.courseCode + "' class='panel panel-primary course-list-item'>";
    courseString += '<div class="panel-heading">';
    courseString += '<h3 class="panel-title">';
    courseString += this.getCourseHeader();
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
    courseString += this.getSchedulingCourseActions();
    courseString += '</div>';
    courseString += "</div>";
    return courseString;
};

CourseView.prototype.buildPanel = function () {
    "use strict";
    var courseString;
    courseString = "<div id='" + this.courseCode + "' class='panel panel-primary course-list-item'>";
    courseString += '<div class="panel-heading">';
    courseString += '<h3 class="panel-title">';
    courseString += this.getCourseHeader();
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
    return courseString;
};

CourseView.prototype.buildSubPanel = function (num, mainCourseCode) {
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

CourseView.prototype.buildCourse = function () {
    "use strict";
    return this.buildPanel();
};

CourseView.prototype.findCoCourses = function (type, callback) {
	"use strict";
    var Course, courseQuery, courseName, courseIdentifier, coCourseQuery, exclusionQuery, i;
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