/*global storeCourses, Ladda, cacheFresh */

var displayCalendar, getCourseEvents, getCalendar, displayCalendar, removeReplacements;

$(document).ready(function () {
    "use strict";
    getCalendar();
});

getCalendar = function () {
	"use strict";
    if (jQuery.isEmptyObject(JSON.parse(sessionStorage.courses))) {
        storeCourses().then(displayCalendar);
    } else {
        displayCalendar();
    }	
};

handleCourseClick = function (calEvent, jsEvent, view) {
	var courseObject, courseCode, coursePanel;
    courseCode = calEvent.id;
    if (getCourseFromCache(courseCode) !== undefined) {
        courseObject = getCourseFromCache(courseCode);
    } else {
     	courseObject = getTemporaryCourse(courseCode);
    }
    coursePanel = courseObject.buildPanel("scheduling");
	$("#coursePanelDisplay .modal-dialog").html(coursePanel);
	$("#coursePanelDisplay").modal("show"); 
};

displayCalendar = function () {
    "use strict";
    $('#calendar').fullCalendar({
    	eventClick: handleCourseClick,
        header: "",
        defaultView: "agendaWeek",
        defaultDate: "2014-07-14",
        minTime: "08:00:00",
        maxTime: "22:00:00",
        aspectRatio: .25,
        weekends: false,
        columnFormat: { week: "ddd" },
        timeFormat: "",
        allDaySlot: false,
        events: getCourseEvents()
    });
};

getCourseEvent = function (course, color) {
    "use strict";
    var startingDay, calendarCourses, title, color, days, heldDays, time, start, end, event, i, endFront, endBack, startFront, startBack;
    startingDay = "2014-07-";
    
    // Title processing
    title = course.courseIdentifier.toUpperCase() + " - " + course.type.toUpperCase();
    
    //Day parsing
    days = course.days;
    heldDays = [];
    if (days.indexOf("M") > -1) {
        heldDays.push(startingDay + "14");
    }
    if (days.indexOf("Tu") > -1) {
        heldDays.push(startingDay + "15");
    }
    if (days.indexOf("W") > -1) {
        heldDays.push(startingDay + "16");
    }
    if (days.indexOf("Th") > -1) {
        heldDays.push(startingDay + "17");
    }
    if (days.indexOf("F") > -1) {
        heldDays.push(startingDay + "18");
    }
    
    // Time parsing
    time = course.time.split(" to ");
    start = time[0];
    end = time[1];
    
    // Removing spaces
    if (time[0][0] == " ") {
        start = start.slice(1);
    }
    if (time[1][0] == " ") {
        end = end.slice(1);
    }
    if (start.indexOf("AM") != -1) {
        start = start.split(" AM")[0];
    }
    // Further breaking things down
    startFront = parseInt(start.split(":")[0], 10);
    startBack = start.split(":")[1].slice(0, 2);
    endFront = parseInt(end.split(":")[0], 10);
	endBack = end.split(":")[1].slice(0, 2);
    if (end.indexOf("PM") != -1) {    
        if (startFront != 12) {
            startFront += 12;
		} 
        if (endFront != 12) {
	        endFront += 12;
        }
    }
    if (startFront < 10) {
        startFront = "0" + startFront;
    }
    if (endFront < 10) {
        endFront = "0" + endFront;
    }
	start = "T" + startFront + ":" + startBack + ":00";
    end = "T" + endFront + ":" + endBack + ":00";
    calendarCourses = [];
    //Event object creation
    for (i = 0; i < heldDays.length; i++) {
        event = {
        	id: course.courseCode,
            title: title,
            start: heldDays[i] + start,
            end: heldDays[i] + end,
            backgroundColor: color
        };
        calendarCourses.push(event);
    }
    return calendarCourses;
};

getCourseEvents = function () {
    "use strict";
    var calendarCourses, courses, course, colors, color;
    colors = ["red", "green", "blue", "purple", "orange", "brown", "burlywood", "cadetblue", "coral", "darkcyan", "darkgoldenrod", "darkolivegreen"];
    
    calendarCourses = [];
    courses = JSON.parse(sessionStorage.courses);
    for (course in courses) {
        if (courses.hasOwnProperty(course)) {
            // Random color
            color = colors[parseInt((Math.random() * 5), 10)];
            colors.splice(colors.indexOf(color), 1);
            calendarCourses = calendarCourses.concat(getCourseEvent(courses[course], color));
        }
    }
    return calendarCourses;
};

displayReplacements = function () {
	"use strict";
	var temporaryCourses, event, course, data;
	temporaryCourses = [];
	data = JSON.parse(sessionStorage.temporaryCourses);
	if (jQuery.isEmptyObject(data)) {
		$("#coursePanelDisplay .modal-dialog").html("<div class='modal-content'><div class='modal-header'><h4 class='modal-title'>No replacements found.</h4></div></div>");
		return;
	}
	for (course in data) {
		if (getCourseFromCache(data) === undefined) {
			temporaryCourses = temporaryCourses.concat(getCourseEvent(getTemporaryCourse(course), "black"));	
		}
	}
	$("#coursePanelDisplay").modal("hide");
	$('#calendar').fullCalendar( 'addEventSource', temporaryCourses);
};

displaySearch = function () {
    "use strict";
    var temporaryCourses, event, course, data;
	temporaryCourses = [];
	data = JSON.parse(sessionStorage.temporaryCourses);
	if (jQuery.isEmptyObject(data)) {
		$("#coursePanelDisplay .modal-dialog").html("<div class='modal-content'><div class='modal-header'><h4 class='modal-title'>No replacements found.</h4></div></div>");
		return;
	}
	for (course in data) {
		if (getCourseFromCache(data) === undefined) {
			temporaryCourses = temporaryCourses.concat(getCourseEvent(getTemporaryCourse(course), "black"));	
		}
	}
	$("#coursePanelDisplay").modal("hide");
	$('#calendar').fullCalendar( 'addEventSource', temporaryCourses);
};

// Conducts search for CoCourses or replacements
$(document).on("click", ".btn-search", function () {
    "use strict";
    var type, courseCode;
    type = $(this).attr("class").split(" ")[1].split("-")[1];
    courseCode = $(this).parent().parent().parent().parent().parent().attr("id");
    getCourseFromCache(courseCode).findCoCourses(type, displayReplacements);
});

$(document).on('click', ".btn-search-replacements", function () {
	var courseCode, course;
    courseCode = $(this).parent().parent().parent().parent().parent().attr("id");
    course = getCourseFromCache(courseCode);
    course.findCoCourses(course.type, displayReplacements);
});

$(document).on("click", ".btn-add", function () {
    "use strict";
    var courseCode, modal, temporaryCourse, lBtn;
    courseCode = parseInt($(this).parent().parent().attr('id'), 10);
    modal = $(this).parent().parent().parent().parent();
    lBtn = Ladda.create(this);
	lBtn.start();
    lBtn.setProgress('.50');
    Parse.Cloud.run('addCourse', {courseCode: courseCode}).then(function () {
    	return getCourseFromCache(getEquivalentCourse(courseCode).courseCode).remove();
    }, function (error) {
    	lBtn.stop();
        console.log(error);
    }).then(function () {
	    transferCourseFromTemporaryToCache(courseCode);
		$("#calendar").fullCalendar('destroy');
		displayCalendar();
		modal.modal('hide');
		lBtn.stop();
		storeCourses();
		delete sessionStorage.temporaryCourses;
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
		modal = $(this).parent().parent().parent().parent().parent();
	}
    Parse.Cloud.run("removeCourse", {courseCode: courseCode}).then(function () {
        $("#calendar").fullCalendar('removeEvents', [courseCode]);
    }, function (error) {
        console.log(error);
        $(".alert-invalid-courseid").html("Whoops something went wrong.");
        $(".alert-invalid-courseid").show();
        lBtn.stop();
    }).then(function () {
        cacheFresh("refresh");
        lBtn.setProgress('1');
        lBtn.stop();
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
    cacheFresh("refresh");
    storeCourses().then(function () {
        $('#calendar').fullCalendar('destroy');
        displayCalendar();
    });
    btn.stop();
});