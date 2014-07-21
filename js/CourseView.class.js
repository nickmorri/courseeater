/*global navigator*/

// CourseView class
function CourseView(course) {
    "use strict";
    this.ParseObjectID = course.objectId;
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
    var copyString, infoString;
    copyString = "Control-C to copy.";
    if (navigator.appVersion.indexOf("Mac") != -1) {
        copyString = "⌘-C to copy.";
    }
    infoString = '<div class="panel-heading">';
    infoString += '<h3 class="panel-title">';
    infoString += '<span class="label label-info">';
    infoString += this.type.toUpperCase();
    infoString += '</span> ';
    infoString += '<span class="label label-success">';
    infoString += this.courseIdentifier.toUpperCase().replace(/ /g, '');
    infoString += '</span>';
    infoString += this.getCourseReqsHTML();
    infoString += ' <span class="badge pull-right course-view-courseID top" title="Click to highlight. ' + copyString + '" data-original-title="Tooltip on right">';
    infoString += this.courseCode;
    infoString += '</span>';
    infoString += '</h3>';
    infoString += '</div>';
    return infoString;
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
        additionalClasses += ' <span class="label label-warning top course-details" title="Prerequisites needed" data-original-title="Tooltip on right">P</span>';
    }
    if (this.cocourses) {
        additionalClasses += ' <span class="label label-warning top course-details" title="Cocourses needed" data-original-title="Tooltip on right">C</span>';
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
    dayString += '<li class="list-group-item"><span class="glyphicon glyphicon-calendar list-detail-glyphicon"></span>';
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
    if (this.enrolled == 0) {
        return '<li class="list-group-item"><span class="glyphicon glyphicon-stats list-detail-glyphicon pull-left"></span><div class="progress"><div class="progress-bar progress-bar-info" role="progressbar" aria-valuenow="' + 100 + '" aria-valuemin="0" aria-valuemax="100" style="width:' + 100 + '%;">Class empty!</div></div></li>';
    }
    coursePercentFull = this.enrolled / this.max * 100;
    remaining = this.max - this.enrolled;
    progressString = "";
    if (this.waitlist > 0) {
        waitlistPercentage = (this.waitlist / this.max) * 100 * 10;
        waitlistPercentageOffset = (100 - waitlistPercentage);
        progressString = '<li class="list-group-item"><span class="glyphicon glyphicon-stats list-detail-glyphicon pull-left"></span><div class="progress"><div class="progress-bar progress-bar-warning" style="width:' + waitlistPercentage + '%"></div><div class="progress-bar progress-bar-danger" style="width:' + waitlistPercentageOffset + '%">' + this.waitlist + ' waitlisted</div></div></li>';
    } else if (remaining == 0) {
        progressString = '<li class="list-group-item"><span class="glyphicon glyphicon-stats list-detail-glyphicon pull-left"></span><div class="progress"><div class="progress-bar progress-bar-danger" role="progressbar" aria-valuenow="' + coursePercentFull + '" aria-valuemin="0" aria-valuemax="100" style="width:' + coursePercentFull + '%;">Class full!</div></div></li>';
    } else {
        progressString = '<li class="list-group-item"><span class="glyphicon glyphicon-stats list-detail-glyphicon pull-left"></span><div class="progress"><div class="progress-bar progress-bar-success" role="progressbar" aria-valuenow="' + coursePercentFull + '" aria-valuemin="0" aria-valuemax="100" style="width:' + coursePercentFull + '%;">' + remaining + ' spots left</div></div></li>';
    }
    return progressString;
};

CourseView.prototype.getCourseTimeHTML = function () {
    "use strict";
    var timeString;
    timeString = '<li class="list-group-item"><span class="glyphicon glyphicon-time list-detail-glyphicon"></span> ' + this.time + '</li>';
    return timeString;
};

CourseView.prototype.getCourseInstructorHTML = function () {
    "use strict";
    var instructorString;
    instructorString = '<li class="list-group-item"><span class="glyphicon glyphicon-user list-detail-glyphicon"></span> <a href="http://www.ratemyprofessors.com/SelectTeacher.jsp?searchName=' + this.instructor.split(',')[0] + '&search_submit1=Search&sid=1074" target="_blank">' + this.instructor + '</a></li>';
    return instructorString;
};

CourseView.prototype.getCourseActionsHTML = function () {
    "use strict";
    var buttonString;
    buttonString = '<button type="button" class="btn btn-danger btn-block btn-remove ladda-button" data-loading-text="Removing...">Remove</button>';
    return buttonString;
};

CourseView.prototype.buildHTML = function () {
    "use strict";
    var courseString;
    courseString = '';
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