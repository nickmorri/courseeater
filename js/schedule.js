/*global storeCourses, Ladda, cacheFresh, $, document, jQuery, localStorage, retrieveCourses, getCourseFromCache, getTemporaryCourse, Parse, getEquivalentCourse, console, transferCourseFromTemporaryToCache */
/*jslint plusplus: true */

var getCalendar, handleCourseClick, makeScheduleImage, displayCalendar, getCourseEvent, getCourseEvents, displaySearch;

loadPage = function () {
	"use strict";
	getCalendar();
};

// Initializes calendar. Loads data if needed.
getCalendar = function () {
    "use strict";
    if (jQuery.isEmptyObject(getStoredCourses())) {
        retrieveCourses(displayCalendar);
    } else {
        displayCalendar();
    }
};

// Handles Modal launching and creation when Course calendar instance is selected.
handleCourseClick = function (calEvent) {
    "use strict";
    // Prevent Google Calendar launch
    if (calEvent.url) return false;
    var courseObject, courseCode, coursePanel;
    courseCode = calEvent.id;
    if (getCourseFromCache(courseCode) !== undefined) {
        courseObject = getCourseFromCache(courseCode);
    } else {
        courseObject = getTemporaryCourse(courseCode);
    }
    coursePanel = courseObject.buildDefaultPanel();
    $("#coursePanelDisplay .modal-dialog").html(coursePanel);
    $("#coursePanelDisplay").modal("show");
};

// Generates png image of schedule
makeScheduleImage = function (event) {
	html2canvas($("#calendar"), {
		onrendered: function(canvas) {
			var destinationCanvas, destinationContext, today, link;
		
			destinationCanvas = document.createElement('canvas');
			destinationCanvas.width = canvas.width;
			destinationCanvas.height = canvas.height;
			
			destinationContext = destinationCanvas.getContext("2d");
			destinationContext.rect(0, 0, canvas.width, canvas.height);
			destinationContext.fillStyle = "white";
			destinationContext.fill();

			destinationContext.drawImage(canvas, 0, 0, canvas.width, canvas.height);
			
			destinationContext.font = '10pt Helvetica';
			destinationContext.fillStyle = "black";
			destinationContext.fillText("http://courseeater.com", canvas.width - 140, canvas.height - 8);
			
			today = new Date();
			
			link = document.createElement("a");
			link.download = "Schedule - CourseEater - " + today.toLocaleDateString("en-US") + ".png";
			link.href = destinationCanvas.toDataURL();
			link.click();
	    }
	});
	closeNavbarDropdown();
};

// Initializes FullCalendar library with relevant Course information.
displayCalendar = function () {
    "use strict";
    var googleCalendar;
    $('#calendar').fullCalendar('destroy');
    $('#calendar').fullCalendar({
    	defaultDate: getWeekday(0),
        eventClick: handleCourseClick,
        header: "",
        defaultView: "agendaWeek",
        minTime: "08:00:00",
        maxTime: "22:00:00",
        aspectRatio: '.25',
        weekends: false,
        columnFormat: { week: "ddd" },
        timeFormat: "",
        allDaySlot: false,
        events: getCourseEvents()
    });
    googleCalendar = Parse.User.current().get("externalCalendar");
    if (googleCalendar !== undefined || googleCalendar !== "") {
		$('#calendar').fullCalendar('addEventSource', googleCalendar);
    }
};

// Returns the Date object for the Monday of the current week
getWeekday = function (day) {
	var date, dayOfMonth, dayOfWeek, thisMonday;
	date = new Date();
	// Setting time to midnight for consistent Datetime parsing
	date.setHours(0,0,0,0);
	dayOfMonth = date.getDate();
	dayOfWeek = date.getDay();
	thisMonday = (dayOfMonth - dayOfWeek) + 1;
	date.setDate(thisMonday + day);
	return date.toISOString().split("T")[0];;
};

// Processes data for individual Course
getCourseEvent = function (course, color) {
    "use strict";
    var calendarCourses, title, days, heldDays, time, start, end, event, i, endFront, endBack, startFront, startBack;
    if (course.time.indexOf("TBA") !== -1) return [];
    // Title processing
    title = course.courseIdentifier.toUpperCase() + " - " + course.type.toUpperCase();
    // Day parsing
    days = course.days;
    heldDays = [];
    if (days.indexOf("M") > -1) heldDays.push(getWeekday(0));
    if (days.indexOf("Tu") > -1) heldDays.push(getWeekday(1));
    if (days.indexOf("W") > -1) heldDays.push(getWeekday(2));
    if (days.indexOf("Th") > -1) heldDays.push(getWeekday(3));
    if (days.indexOf("F") > -1) heldDays.push(getWeekday(4));
    // Time parsing
    time = course.time.split(" to ");
    start = time[0];
    end = time[1];
    // Removing spaces
    if (time[0][0] === " ") start = start.slice(1);
    if (time[1][0] === " ") end = end.slice(1);
    // Further breaking things down into 4 distinct parts.
    startFront = parseInt(start.split(":")[0], 10);
    startBack = start.split(":")[1].slice(0, 2);
    endFront = parseInt(end.split(":")[0], 10);
    endBack = end.split(":")[1].slice(0, 2);
    // Processing of these parts
    if (end.indexOf("PM") !== -1 && endFront !== 12) endFront += 12;
    if (start.indexOf("PM") !== -1 && startFront !== 12) startFront += 12;
    if (endFront > 12 && startFront !== 12) startFront += 12;
    if (startFront < 10) startFront = "0" + startFront;
    if (endFront < 10) endFront = "0" + endFront;
    // Formatting these four parts for the FullCalendar library
    start = "T" + startFront + ":" + startBack + ":00";
    end = "T" + endFront + ":" + endBack + ":00";
    calendarCourses = [];
    // Event object creation
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

// Retrieves courses information from local datastore
getCourseEvents = function () {
    "use strict";
    var calendarCourses, courses, course, colors, color, hash;
    colors = ["red", "green", "blue", "purple", "orange", "brown", "burlywood", "cadetblue", "coral", "darkcyan", "darkgoldenrod", "darkolivegreen"];
    calendarCourses = [];
    courses = getStoredCourses();
    for (course in courses) {
        if (courses.hasOwnProperty(course)) {
            // Random color
            hash = Math.abs(courses[course].courseName.hash()) % colors.length;
            color = colors[hash];
            colors.splice(colors.indexOf(color), 1);
            calendarCourses = calendarCourses.concat(getCourseEvent(courses[course], color));
        }
    }
    return calendarCourses;
};

// Displays general a course search
displaySearch = function () {
    "use strict";
    var temporaryCourses, course, data;
    temporaryCourses = [];
    data = getTemporaryCourses();
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
    $('#calendar').fullCalendar('addEventSource', temporaryCourses);
};

String.prototype.hash = function(){
	var hash = 0;
	if (this.length === 0) return hash;
	for (i = 0; i < this.length; i++) {
		char = this.charCodeAt(i);
		hash = ((hash << 5) - hash) + char;
		hash = hash & hash; // Convert to 32bit integer
	}
	return hash;
};

$(document).on("click", "#calendarImage", makeScheduleImage);

// Conducts search for CoCourses
$(document).on("click", ".btn-search", function () {
    "use strict";
    var type, courseCode;
    type = $(this).attr("class").split(" ")[1].split("-")[1];
    courseCode = $(this).parent().parent().parent().parent().parent().attr("id");
    getCourseFromCache(courseCode).findCoCourses(type, displaySearch);
});

// Conducts search for replacements
$(document).on('click', ".btn-search-replacements", function () {
    "use strict";
    var courseCode, course;
    courseCode = $(this).parent().parent().parent().parent().parent().attr("id");
    course = getCourseFromCache(courseCode);
    course.findCoCourses(course.type, displaySearch);
});

// Conducts addition of course to user account
$(document).on("click", ".btn-add", function () {
    "use strict";
    var courseCode, modal, lBtn, course;
    courseCode = parseInt($(this).parent().parent().attr('id'), 10);
    modal = $(this).parent().parent().parent().parent();
    lBtn = Ladda.create(this);
    lBtn.start();
    lBtn.setProgress('.50');
    Parse.Cloud.run('addCourse', {courseCode: courseCode}).then(function () {
        course = getEquivalentCourse(courseCode);
        if (course === undefined) return Parse.Promise.as();
        return getCourseFromCache(course.courseCode).remove();
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
        clearTemporaryCourses();
    });
});

// Remove course from user's account
$(document).on('click', ".btn-remove", function () {
    "use strict";
    var courseCode, modal, lBtn;
    lBtn = Ladda.create(this);
    lBtn.start();
    lBtn.setProgress('.50');
    courseCode = $(this).parent().parent().parent().attr("id").split("-")[1];
    if (courseCode === undefined) {
        courseCode = $(this).parent().parent().parent().attr("id");
        modal = $(this).parent().parent().parent().parent().parent();
    }
    Parse.Cloud.run("removeCourse", {courseCode: courseCode}).then(function () {
        $("#calendar").fullCalendar('removeEvents', [courseCode]);
    }, function (error) {
        console.log(error);
        lBtn.stop();
    }).then(function () {
        lBtn.setProgress('1');
        lBtn.stop();
        cacheFresh("refresh");
        if (modal !== undefined) modal.modal('hide');
        retrieveCourses().then(storeCourses);
    });
});

// Clears any localStorage data and reloads data from Parse
$(document).on("click", ".refresh-data", function () {
    "use strict";
    var btn;
    btn = Ladda.create(this);
    btn.start();
    cacheFresh("refresh");
    retrieveCourses(displayCalendar);
    btn.stop();
});

// Have to use on window load, more traditional on document ready has issues with fullCalendar library and rendering
$(window).load(loadPage);