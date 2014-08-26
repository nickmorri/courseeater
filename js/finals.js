/*global sessionStorage, document, $, storeCourses, Ladda, cacheFresh, jQuery, retrieveCourses*/

var getCalendar, displayCalendar, getCourseFinal, getCourseFinals;

// Intelligently displays finals calendar. Loads data if needed.
getCalendar = function () {
    "use strict";
    if (jQuery.isEmptyObject(JSON.parse(sessionStorage.courses))) {
        retrieveCourses().then(storeCourses).then(displayCalendar);
    } else {
        displayCalendar();
    }
};

// Initializes FullCalendar library with relevant Course finals information
displayCalendar = function () {
    "use strict";
    $('#calendar').fullCalendar({
        header: "",
        defaultView: "agendaWeek",
        defaultDate: "2014-12-15",
        minTime: "08:00:00",
        maxTime: "22:00:00",
        weekends: false,
        allDaySlot: false,
        aspectRatio: '.25',
        eventSources: [getCourseFinals()]
    });
};

// Processes data for individual Course
getCourseFinal = function (course, color) {
    "use strict";
    var startingDay, finalString, title, heldDay, time, start, end, endFront, endBack, event;

    startingDay = "2014-12-";
    finalString = course.final;
    if (finalString === "NONE") {
        return undefined;
    }
    // Day processing
    heldDay = startingDay + finalString.split(", ")[1].split(" ")[1];
    // Title processing
    title = course.courseCode + " " + course.courseIdentifier.toUpperCase() + " - " + course.type.toUpperCase();
    // Time parsing
    time = finalString.split("-");
    start = time[0].split(", ")[2];
    start = parseInt(start.split(":")[0], 10);
    end = time[1];
    if (end.indexOf("am") !== -1) {
        end = end.split("am")[0];
        endFront = parseInt(end.split(":")[0], 10);
        endBack = parseInt(end.split(":")[1], 10);
        if (endBack === 0) {
            endBack = "00";
        }
        start = "0" + start;
    } else {
        end = end.split("pm")[0];
        endFront = parseInt(end.split(":")[0], 10);
        endBack = parseInt(end.split(":")[1], 10);
        if (endFront !== 12) {
            start += 12;
            endFront += 12;
        }
        if (endBack === 0) {
            endBack = "00";
        }
    }
    start = "T" + start + ":" + time[0].split(", ")[2].split(":")[1] + ":00";
    end = "T" + endFront + ":" + endBack + ":00";
    //Event object creation
    event = {
        id: course.courseCode,
        title: title,
        start: heldDay + start,
        end: heldDay + end,
        backgroundColor: color
    };
    return event;
};

// Retrieves finals information from local datastore
getCourseFinals = function () {
    "use strict";
    var finals, courses, courseFinal, course, colors, color;
    colors = ["red", "green", "blue", "purple", "orange", "brown", "burlywood", "cadetblue", "coral", "darkcyan", "darkgoldenrod", "darkolivegreen"];
    finals = [];
    courses = JSON.parse(sessionStorage.courses);
    for (course in courses) {
        if (courses.hasOwnProperty(course)) {
            color = colors[parseInt((Math.random() * 5), 10)];
            colors.splice(colors.indexOf(color), 1);
            courseFinal = getCourseFinal(courses[course], color);
            if (courseFinal !== undefined) {
                finals.push(courseFinal);
            }
        }
    }
    return finals;
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

$(document).ready(getCalendar);