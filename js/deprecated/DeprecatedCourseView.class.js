// CourseView class
function CourseView(course) {
	this.ParseObjectID = course.objectId;
	this.instructor = course.instructor;
	this.courseIdentifier = course.courseIdentifier;
	this.courseCode = course.courseCode;
	this.max = course.max;
	this.enrolled = course.enrolled;
	this.waitlist = course.waitlist;
	this.courseName = course.courseName;
	this.final = course.final;
	this.location = course.place;
	this.time = course.time;
	this.days = course.days;
	this.type = course.type;
	this.cocourses = course.cocourses;
	this.prerequisites = course.prerequisites
};

CourseView.prototype.getCourseInfoHTML = function() {
	var copyString = "Control-C to copy.";
	if (navigator.appVersion.indexOf("Mac")!=-1) {
		copyString = "⌘-C to copy.";
	}
	var infoString = '<div class="panel-heading">';
	infoString += '<h3 class="panel-title">';
	infoString += '<span class="label label-info">';
	infoString += this.type.toUpperCase();
	infoString += '</span> ';
	infoString += '<span class="label label-success">';
	infoString += this.courseIdentifier.toUpperCase().replace(/ /g,'');
	infoString += '</span>';
	infoString += this.getCourseReqsHTML();
	infoString += ' <span class="badge pull-right course-view-courseID top" title="Click to highlight. ' + copyString +'" data-original-title="Tooltip on right">';
	infoString += this.courseCode;
	infoString += '</span>';
	infoString += '</h3>';
	infoString += '</div>';
	return infoString;
};

CourseView.prototype.getCourseNameHTML = function() {
	var courseName = '<li class="list-group-item">';
	courseName += '<span class="glyphicon glyphicon-pencil list-detail-glyphicon">';
	courseName += '</span> ';
	courseName += this.courseName;
	courseName += '</li>';
	return courseName;
};

CourseView.prototype.getCourseReqsHTML = function() {
	var additionalClasses = '';
	if (this.prerequisites) {
		additionalClasses += ' <span class="label label-warning top" title="Prerequisites needed" data-original-title="Tooltip on right">P</span>';
	}
	if (this.cocourses) {
		additionalClasses += ' <span class="label label-warning top" title="Cocourses needed" data-original-title="Tooltip on right">C</span>';
	}
	return additionalClasses;
};

CourseView.prototype.getCourseDaysHTML = function() {
	var dayString = "";
	var days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
	var heldDays = this.days.split(",");
	dayString += '<li class="list-group-item"><span class="glyphicon glyphicon-calendar list-detail-glyphicon"></span>';
	for (var i = 0; i < days.length; i++) {
		if (heldDays.indexOf(days[i]) > -1) {
			dayString += '<span class="label label-primary label-day">' + days[i] + '</span>';
		}
		else {
			dayString += '<span class="label label-default label-day">' + days[i] + '</span>';
		}
	}
	dayString += "</li>";
	return dayString;
};

CourseView.prototype.getCourseLocationHTML = function() {
	var building = this.location.substr(0, this.location.indexOf((" ")));
	var locationString = '<li class="list-group-item"><span class="glyphicon glyphicon-flag list-detail-glyphicon"></span> <a href="https://eee.uci.edu/toolbox/roomfinder/room.php?building_abbr=';
	locationString += building + '" target="_blank">' + this.location + '</a></li>';
	return locationString;
};

CourseView.prototype.getCourseProgressHTML = function() {
	var coursePercentFull = this.enrolled / this.max * 100;
	var remaining = this.max - this.enrolled;
	var progressString = "";
	if (this.waitlist > 0) {
		var waitlistPercentage = (this.waitlist / this.max) * 100;
		var waitlistPercentageOffset = 100 - waitlistPercentage;
		progressString = '<li class="list-group-item"><span class="glyphicon glyphicon-stats list-detail-glyphicon pull-left"></span><div class="progress"><div class="progress-bar progress-bar-warning" style="width:' + waitlistPercentage + '%"></div><div class="progress-bar progress-bar-danger" style="width:' + waitlistPercentageOffset + '%"></div>' + this.waitlist +' waitlisted</div></li>';
	}
	else if (remaining == 0) {
		progressString = '<li class="list-group-item"><span class="glyphicon glyphicon-stats list-detail-glyphicon pull-left"></span><div class="progress"><div class="progress-bar progress-bar-danger" role="progressbar" aria-valuenow="' + coursePercentFull + '" aria-valuemin="0" aria-valuemax="100" style="width:' + coursePercentFull + '%;">Class full!</div></div></li>';
		
	}
	else {
		progressString = '<li class="list-group-item"><span class="glyphicon glyphicon-stats list-detail-glyphicon pull-left"></span><div class="progress"><div class="progress-bar progress-bar-success" role="progressbar" aria-valuenow="' + coursePercentFull + '" aria-valuemin="0" aria-valuemax="100" style="width:' + coursePercentFull + '%;">' + remaining + ' spots left</div></div></li>';
	}
	return progressString;
};

CourseView.prototype.getCourseTimeHTML = function() {
	var timeString = '<li class="list-group-item"><span class="glyphicon glyphicon-time list-detail-glyphicon"></span> ' + this.time + '</li>';
	return timeString;
};

CourseView.prototype.getCourseInstructorHTML = function() {
	var instructorString = '<li class="list-group-item"><span class="glyphicon glyphicon-user list-detail-glyphicon"></span> <a href="http://www.ratemyprofessors.com/SelectTeacher.jsp?searchName=' + this.instructor.split(',')[0] + '&search_submit1=Search&sid=1074" target="_blank">' + this.instructor + '</a></li>';
	return instructorString;
};

CourseView.prototype.getCourseActionsHTML = function() {
	buttonString = '<button type="button" class="btn btn-danger btn-block btn-remove ladda-button" data-loading-text="Removing...">Remove</button>';
	return buttonString;
};

CourseView.prototype.buildHTML = function() {
	var courseString = '';
	courseString += "<div id='" + this.ParseObjectID + "' class='panel panel-primary course-list-item'>";
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