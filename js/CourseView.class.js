/*global navigator*/

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
}

CourseView.prototype.getCourseInfoHTML = function () {
    "use strict";
    var infoString;
    infoString = '<div class="panel-heading">' +
    '<h3 class="panel-title">' +
    '<span class="label label-info panel-label label-type">' +
    this.type.toUpperCase() +
    '</span> ' +
    '<span class="label label-success panel-label label-identifier">' +
    this.courseIdentifier.toUpperCase().replace(/ /g, '') +
    '</span>' +
    this.getCourseReqsHTML() +
    ' <span class="badge pull-right course-view-courseID">' +
    this.courseCode +
    '</span>' +
    '</h3>' +
    '</div>';
	return infoString;
};

CourseView.prototype.buildCollapsable = function () {
	var collapse;
	collapse = '<div class="panel-group" id="accordion">' +
	'<div class="panel panel-default">' +
	'<div class="panel-heading">' +
	'<h4 class="panel-title">' +
	'<a data-toggle="collapse" data-parent="#accordion" href="#collapseOne">' +
	'<span class="label label-info panel-label label-type">' +
    this.type.toUpperCase() +
    '</span> ' +
    '<span class="label label-success panel-label label-identifier">' +
    this.courseIdentifier.toUpperCase().replace(/ /g, '') +
    '</span>' +
    this.getCourseReqsHTML() +
    ' <span class="badge pull-right course-view-courseID top">' +
    this.courseCode +
    '</span>' +
	'</a>' +
	'</h4>' +
    '</div>' +
    '<div id="collapseOne" class="panel-collapse collapse in">' +
    '<div class="panel-body">' +
	'<ul class="list-group">' +
	this.getCourseNameHTML() +
	this.getCourseInstructorHTML() +
	this.getCourseDaysHTML() +
	this.getCourseTimeHTML() +
	this.getCourseLocationHTML() +
	this.getCourseProgressHTML() +
	'</ul>' +
    '</div>' +
    '</div>' +
	'</div>' +
	'<div class="panel panel-default">' +
	'<div class="panel-heading">' +
	'<h4 class="panel-title">' +
	'<a data-toggle="collapse" data-parent="#accordion" href="#collapseTwo">' +
	'Collapsible Group Item #2' +
	'</a>' +
	'</h4>' +
    '</div>' +
    '<div id="collapseTwo" class="panel-collapse collapse in">' +
    '<div class="panel-body">' +
	'Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. 3 wolf moon officia aute, non cupidatat skateboard dolor brunch. Food truck quinoa nesciunt laborum eiusmod. Brunch 3 wolf moon tempor, sunt aliqua put a bird on it squid single-origin coffee nulla assumenda shoreditch et. Nihil anim keffiyeh helvetica, craft beer labore wes anderson cred nesciunt sapiente ea proident. Ad vegan excepteur butcher vice lomo. Leggings occaecat craft beer farm-to-table, raw denim aesthetic synth nesciunt you probably havent heard of them accusamus labore sustainable VHS.' +
    '</div>' +
    '</div>' +
	'</div>' +
  '<div class="panel panel-default">' +
	'<div class="panel-heading">' +
	'<h4 class="panel-title">' +
	'<a data-toggle="collapse" data-parent="#accordion" href="#collapseThree">' +
	'Collapsible Group Item #3' +
	'</a>' +
	'</h4>' +
    '</div>' +
    '<div id="collapseThree" class="panel-collapse collapse in">' +
    '<div class="panel-body">' +
	'Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. 3 wolf moon officia aute, non cupidatat skateboard dolor brunch. Food truck quinoa nesciunt laborum eiusmod. Brunch 3 wolf moon tempor, sunt aliqua put a bird on it squid single-origin coffee nulla assumenda shoreditch et. Nihil anim keffiyeh helvetica, craft beer labore wes anderson cred nesciunt sapiente ea proident. Ad vegan excepteur butcher vice lomo. Leggings occaecat craft beer farm-to-table, raw denim aesthetic synth nesciunt you probably havent heard of them accusamus labore sustainable VHS.' +
    '</div>' +
    '</div>' +
	'</div>' +
	'</div>';
	return collapse;
};

CourseView.prototype.getCourseNameHTML = function () {
    "use strict";
    var courseName;
    courseName = '<li class="list-group-item">';
    courseName += '<span class="glyphicon glyphicon-pencil list-detail-glyphicon">';
    courseName += '</span> ';
    courseName += this.courseName;
    courseName += '</li>';
    return courseName;
};

CourseView.prototype.getCourseReqsHTML = function () {
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

CourseView.prototype.getCourseDaysHTML = function () {
    "use strict";
    if (this.days == "TBA") {
        return "TBA";
    }
    var dayString, heldDays, predefinedDays, i;
    dayString = "";
    heldDays = "";
    predefinedDays = ["Mon", "Tue", "Wed", "Thu", "Fri"];
    if (this.days.indexOf("M") > -1) {
        heldDays += "Mon";
    }
    if (this.days.indexOf("Tu") > -1) {
        heldDays += "Tue";
    }
    if (this.days.indexOf("W") > -1) {
        heldDays += "Wed";
    }
    if (this.days.indexOf("Th") > -1) {
        heldDays += "Thu";
    }
    if (this.days.indexOf("F") > -1) {
        heldDays += "Fri";
    }
    dayString += '<li class="list-group-item day-labels"><span class="glyphicon glyphicon-calendar list-detail-glyphicon"></span>';
    for (i = 0; i < predefinedDays.length; i++) {
        if (heldDays.indexOf(predefinedDays[i]) > -1) {
            dayString += '<span class="label label-primary label-day">' + predefinedDays[i] + '</span>';
        } else {
            dayString += '<span class="label label-default label-day">' + predefinedDays[i] + '</span>';
        }
    }
    dayString += "</li>";
    return dayString;
};

CourseView.prototype.getCourseLocationHTML = function () {
    "use strict";
    var locationString;
    locationString = '<li class="list-group-item"><span class="glyphicon glyphicon-flag list-detail-glyphicon"></span> <a href="' + this.placeURL + '" target="_blank">' + this.placeBuilding + '</a></li>';
    return locationString;
};

CourseView.prototype.getCourseProgressHTML = function () {
    "use strict";
    var coursePercentFull, remaining, progressString, waitlistPercentage, waitlistPercentageOffset;
	remaining = this.max - this.enrolled;
	coursePercentFull = this.enrolled / this.max * 100;
    if (this.enrolled == 0) {
        progressString = '<li class="list-group-item"><span class="glyphicon glyphicon-stats list-detail-glyphicon pull-left"></span><div class="progress"><div class="progress-bar progress-bar-info" role="progressbar" aria-valuenow="' + 100 + '" aria-valuemin="0" aria-valuemax="100" style="width:' + 100 + '%;">Class empty!</div></div></li>';
    } else if (this.waitlist > 0 && remaining == 0) {
        waitlistPercentage = (this.waitlist / this.max) * 100 * 10;
        waitlistPercentageOffset = (100 - waitlistPercentage);
        progressString = '<li class="list-group-item"><span class="glyphicon glyphicon-stats list-detail-glyphicon pull-left"></span><div class="progress"><div class="progress-bar progress-bar-warning" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width:100%">' + this.waitlist + ' waitlisted</div></div></li>';
	} else if (remaining == 0) {
        progressString = '<li class="list-group-item"><span class="glyphicon glyphicon-stats list-detail-glyphicon pull-left"></span><div class="progress"><div class="progress-bar progress-bar-danger" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width:100%;">Class full!</div></div></li>';
     } else {
		if (coursePercentFull < 30) {
			coursePercentFull *= 3;
		}
	    progressString = '<li class="list-group-item"><span class="glyphicon glyphicon-stats list-detail-glyphicon pull-left"></span><div class="progress"><div class="progress-bar progress-bar-success" role="progressbar" aria-valuenow="' + coursePercentFull + '" aria-valuemin="0" aria-valuemax="100" style="width:' + coursePercentFull + '%;">' + remaining + ' spots remaining of ' + this.max + '</div></div></li>';
    }
    return progressString;
};

CourseView.prototype.getCourseTimeHTML = function () {
    "use strict";
    return '<li class="list-group-item"><span class="glyphicon glyphicon-time list-detail-glyphicon"></span> ' + this.time + '</li>';
};

CourseView.prototype.getCourseInstructorHTML = function () {
    "use strict";
	return '<li class="list-group-item">' + 
	'<span class="glyphicon glyphicon-user list-detail-glyphicon">' + 
	'</span> <a href="http://www.ratemyprofessors.com/SelectTeacher.jsp?searchName=' + 
	this.instructor + 
	'&search_submit1=Search&sid=1074" target="_blank">' + 
	this.instructor + 
	'</a></li>';
};

CourseView.prototype.getCourseActionsHTML = function () {
    "use strict";
	if (!cachedCourse(this.courseCode)) {
		return '<div class="panel-footer"><button type="button" class="btn btn-block btn-success btn-add ladda-button" data-loading-text="Adding...">Add</button></div>';
	} else {
    return '<div class="panel-footer">' +
    '<div class="btn-group btn-block dropup">' +
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
	'</div>' +
	'</div>';
	}
};

CourseView.prototype.buildHTML = function () {
    "use strict";
    var courseString;
    courseString = '';
    courseString += "<div id='" + this.courseCode + "' class='panel panel-primary course-list-item'>";
    courseString += this.getCourseInfoHTML();
    courseString += '<ul class="list-group">';
    courseString += this.getCourseNameHTML();
    courseString += this.getCourseInstructorHTML();
    courseString += this.getCourseDaysHTML();
    courseString += this.getCourseTimeHTML();
    courseString += this.getCourseLocationHTML();
    courseString += this.getCourseProgressHTML();
    courseString += '</ul>';
    courseString += this.getCourseActionsHTML();
    courseString += "</div>";
    return courseString;
};