var displayCalendar, returnCourseEvents;

$(document).ready(function() {
	"use strict";
	if (sessionStorage.courses === undefined) {
		storeCourses().then(displayCalendar);	
	} else {
	  	displayCalendar();  
    }
});

displayCalendar = function () {
	$('#calendar').fullCalendar({
    	header: "",
        defaultView: "agendaWeek",
        defaultDate: "2014-07-14",
        minTime: "08:00:00",
        maxTime: "22:00:00",
        weekends: false,
        columnFormat: {
	        week: "ddd"
        },
        allDaySlot: false,
        aspectRatio: '.25',
        eventSources: [returnCourseEvents()]
        /* Future feature */
        /* eventSources: [returnCourseEvents(), fetchFriendsClasses()] */
    });
}

returnCourseEvents = function () {
	var calendarCourses, courses, event, days, time, title, today, start, end, heldDays, i, colors, color;
	colors = ["red", "green", "blue", "purple", "orange", "brown"];
	startingDay = "2014-07-";
	calendarCourses = [];
	courses = JSON.parse(sessionStorage.courses);
	for (course in courses) {
		// Title processing
		title = courses[course].courseCode + " " + courses[course].courseIdentifier + " " + courses[course].courseName;
		
		// Random color
		color = colors[parseInt((Math.random() * 5) + 1)];
		colors.splice(colors.indexOf(color), 1);
		
		//Day parsing
		days = courses[course].days;
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
	    time = courses[course].time.split(" to ");
		if (time[1].indexOf("AM") == -1) {
			start = parseInt(time[0].split(":")[0]) + 12;
			start = start + ":" + time[0].split(":")[1] + ":00";
			start = "T" + start;
			end = time[1].split(" PM")[0];
			end = parseInt(end.split(":")[0]) + 12 + ":" + end.split(":")[1] + ":00";
			end = "T" + end;
		} else {
			start = parseInt(time[0].split(":")[0]);
			start = "0" + start + ":" + time[0].split(":")[1] + ":00";
			start = "T" + start;
			end = time[1].split(" AM")[0];
			end = "0" + parseInt(end.split(":")[0]) + ":" + end.split(":")[1] + ":00";
			end = "T" + end;
		}
		
	    //Event object creation
	    for (i = 0; i < heldDays.length; i++) {
		    event = {
				title: title,
				start: heldDays[i] + start,
				end: heldDays[i] + end,
				backgroundColor: color
			}
			calendarCourses.push(event);
	    }
	}
	return calendarCourses;
};

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