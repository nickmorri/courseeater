/*global require, Parse*/

var information, toTitleCase, getBlock, getBlocks, processBlock, processClassNameAndIdentifier, processClass, processCourseInstructor, processCourseTime, processCoursePlace, processCourseStatus, processCourse, checkExisting, createCourse;

information = require("cloud/information.js");

getBlocks = function (blocks, status) {
    "use strict";
    var promises, i;
    promises = [];
    for (i = 0; i < blocks.length; i++) {
        promises.push(getBlock(blocks[i], status));
    }
    return Parse.Promise.when(promises);
};

getBlock = function (block, status) {
    "use strict";
    status.message("Processing " + block + " block.");
    var term, URL;
    term = '2014-92';
    URL = 'http://websoc.reg.uci.edu/perl/WebSoc?YearTerm=' + term + '&ShowFinals=1&ShowComments=1&CourseCodes=' + block;
    return Parse.Cloud.httpRequest({url: URL}).then(function (data) {
    	return processBlock(data.text);
    });
};

// Splits department data into class chunks
processBlock = function (HTML) {
    "use strict";
    var savePromises, classBlock, blockData;
    blockData = HTML.split('<tr bgcolor="#fff0ff" valign="top"><td class="CourseTitle" colspan="17" nowrap="nowrap">');
    // Array of promises created from course.save()
    savePromises = [];
    for (classBlock = 1; classBlock < blockData.length; classBlock++) {
        savePromises = savePromises.concat(processClass(blockData[classBlock]));
    }
    return Parse.Promise.when(savePromises);
};

processClassNameAndIdentifier = function (className) {
    "use strict";
    var name, courseNameRaw, courseIdentifier, courseName, position;
    className = className.replace("&nbsp; ", "");
    className = className.replace("&amp;", "&");
    className = className.replace("&nbsp; ", "");
    className = className.replace("&amp;", "&");
    name = className.replace('&nbsp; &nbsp; <font face="sans-serif"><b>', "");
    courseNameRaw = name.trim(" ").split(" ");
    courseIdentifier = "";
    courseName = "";
    for (position = 0; position < courseNameRaw.length; position++) {
        if (isNaN(parseInt(courseNameRaw[position], 10))) {
            courseIdentifier += courseNameRaw[position] + " ";
        } else {
            courseIdentifier += courseNameRaw[position];
            position++;
            break;
        }
    }
    for (; position < courseNameRaw.length; position++) {
        courseName += courseNameRaw[position]
        if (position + 1 < courseNameRaw.length) {
            courseName += " ";
        }
    }
    return {
        className: courseName,
        classIdentifier: courseIdentifier
    };
};

// Data cleaning and sanitation for overall class information
processClass = function (classData) {
    "use strict";
    var auxCourseSearch, prerequisites, nameAndIdentifier, className, classIdentifier, courses, savePromises, courseNum;
    auxCourseSearch = classData.split('</b></font>')[1];
    prerequisites = auxCourseSearch.indexOf("Prerequisites") != -1;
    // Only useful information in index 0 of this split is the classname
    nameAndIdentifier = processClassNameAndIdentifier(classData.split('</b></font>')[0]);
    className = nameAndIdentifier.className;
    classIdentifier = nameAndIdentifier.classIdentifier;
    // Useful information begins at index 1
    courses = classData.split('<tr valign="top"');
    // Array of promises created from course.save()
    savePromises = [];
    for (courseNum = 1; courseNum < courses.length; courseNum++) {
        savePromises.push(processCourse(courses[courseNum], className, classIdentifier, prerequisites));
    }
    return savePromises;
};

processCourseInstructor = function (rawInstructorData) {
    "use strict";
    var instructor, instructorString, instructors, i;
    instructor = rawInstructorData.replace("<br />", ";");
    instructors = instructor.split(";");
    instructorString = "";
    if (instructors.length > 1) {
        for (i = 0; i < instructors.length; i++) {
            if (instructors[i].indexOf("STAFF") == -1) {
                instructorString += instructors[i];
            }
        }
    } else {
        instructorString += instructors[0];
    }
    return instructorString;
};

processCourseTime = function (time) {
    "use strict";
    var timeString, splitTime, extendsToAfternoon, beginsBeforeNoon, morningClass;
    if (time == "TBA") {
        return time;
    }
    splitTime = time.split("-");
    extendsToAfternoon = splitTime[1].indexOf("p") != -1;
    if (extendsToAfternoon !== undefined && extendsToAfternoon && splitTime[0].split(":")[0] >= 8 && splitTime[0].split(":")[0] <= 12) {
        beginsBeforeNoon = true;
    } else if (extendsToAfternoon !== undefined && !extendsToAfternoon) {
        morningClass = true;
    }
    if (morningClass) {
        timeString = splitTime[0] + " to " + splitTime[1] + "AM";
    } else if (beginsBeforeNoon) {
        timeString = splitTime[0] + " AM to " + splitTime[1].slice(0, -1) + " PM";
    } else if (extendsToAfternoon) {
        timeString = splitTime[0] + " to " + splitTime[1].split("p")[0] + " PM";
    }
    return timeString;
};

processCoursePlace = function (placeURL) {
    "use strict";
    var placeBuilding, splitLocation;
    splitLocation = placeURL.split(".html");
    if (splitLocation.length > 1) {
        placeBuilding = splitLocation[0].split("/").slice(-1)[0];
    } else {
        placeBuilding = splitLocation.slice(-1)[0].split("=").slice(-1)[0];
    }
    return placeBuilding;
};

processCourseStatus = function (rawStatusData) {
    "use strict";
    var status = rawStatusData.split('</td><td')[0].split('</td></tr>')[0];
    status = status.replace('<b><font color="blue">', "");
    status = status.replace('<b><font color="green">', "");
    status = status.replace('</font></b>', "");
    status = status.replace('<font color="red">', "");
    status = status.replace('</font>', "");
    return status;
};

// Data cleaning and sanitation for individual course information
processCourse = function (courseData, courseName, courseIdentifier, prerequisites) {
    "use strict";
    var infoBlock, courseCode, type, sec, units, instructor, time, days, place, placeURL, placeBuilding, finalTime, max, rawEnr, splitEnr, localEnr, totalEnr, wl, req, nor, rstr, textbooks, web, status, dataStore;
    infoBlock = courseData.split('nowrap="nowrap">');
    courseCode = infoBlock[1].split('</td><td')[0];
    type = infoBlock[2].split('</td><td')[0];
    sec = infoBlock[3].split('</td><td')[0];
    units = infoBlock[4].split('</td><td')[0];
    instructor = processCourseInstructor(infoBlock[5].split('</td><td')[0]);
    if (infoBlock[6].indexOf('TBA') != -1) {
        time = "TBA";
        days = "TBA";
    } else {
        time = infoBlock[6].split('</td><td')[0].split(" &nbsp; ");
        days = time[0];
        time = time[1];
    }
    time = processCourseTime(time);
    place = infoBlock[7].split('</td><td')[0];
    placeURL = place.split('" target="_blank">')[0].replace('<a href="', "");
    placeBuilding = processCoursePlace(placeURL);
    finalTime = infoBlock[8].split('</td><td')[0];
    if (finalTime.indexOf("TBA") != -1) {
        finalTime = 'TBA';
    } else {
        finalTime = finalTime.replace("&nbsp;", "NONE");
    }
    max = infoBlock[9].split('</td><td')[0];
    rawEnr = infoBlock[10].split('</td><td')[0];
    splitEnr = rawEnr.split(" / ");
    localEnr = rawEnr;
    totalEnr = rawEnr;
    if (splitEnr.length == 2) {
        totalEnr = splitEnr[1];
        localEnr = splitEnr[0];
    }
    wl = infoBlock[11].split('</td><td')[0];
    wl = wl.replace("n/a", "0");
    req = infoBlock[12].split('</td><td')[0];
    nor = infoBlock[13].split('</td><td')[0];
    rstr = infoBlock[14].split('</td><td')[0];
    if (rstr == '&nbsp;') {
        rstr = "NONE";
    }
    textbooks = infoBlock[15].split('</td><td')[0];
    web = infoBlock[16].split('</td><td')[0];
    web = web.replace("&nbsp;", "NONE");
    status = processCourseStatus(infoBlock[17]);
    dataStore = {};
    dataStore.courseName = courseName;
    dataStore.courseIdentifier = courseIdentifier;
    dataStore.courseCode = courseCode;
    dataStore.type = type;
    dataStore.sec = sec;
    dataStore.units = units;
    dataStore.instructor = instructor;
    dataStore.days = days;
    dataStore.time = time;
    dataStore.placeURL = placeURL;
    dataStore.placeBuilding = placeBuilding;
    dataStore.finalTime = finalTime;
    dataStore.max = max;
    dataStore.localEnr = localEnr;
    dataStore.totalEnr = totalEnr;
    dataStore.wl = wl;
    dataStore.req = req;
    dataStore.nor = nor;
    dataStore.rstr = rstr;
    dataStore.web = web;
    dataStore.status = status;
    dataStore.prerequisites = prerequisites;
    dataStore.textbooks = textbooks;
    return createCourse(dataStore);
};

checkExisting = function (data) {
    "use strict";
    var Course, query;
    Course = Parse.Object.extend("Course");
    query = new Parse.Query(Course);
    query.equalTo("courseCode", parseInt(data.courseCode, 10));
    return query.first().then(function (course) {
        if (!course) {
            return Parse.Promise.error("Course object does not yet exist.");
        }
        course.set("courseName", data.courseName);
        course.set("courseIdentifier", data.courseIdentifier);
        course.set("courseCode", parseInt(data.courseCode, 10));
        course.set("type", data.type);
        course.set("sec", data.sec);
        course.set("units", data.units);
        course.set("instructor", data.instructor);
        course.set("days", data.days);
        course.set("time", data.time);
        course.set("placeURL", data.placeURL);
        course.set("placeBuilding", data.placeBuilding);
        course.set("final", data.finalTime);
        course.set("max", parseInt(data.max, 10));
        course.set("localEnr", parseInt(data.localEnr, 10));
        course.set("totalEnr", parseInt(data.totalEnr, 10));
        course.set("wl", parseInt(data.wl, 10));
        course.set("req", parseInt(data.req, 10));
        course.set("nor", parseInt(data.nor, 10));
        course.set("rstr", data.rstr);
        course.set("web", data.web);
        course.set("status", data.status);
        course.set("prerequisites", data.prerequisites);
        course.set("textbooks", data.textbooks);
        return course.save();
    }, function () {
        return Parse.Promise.error("Course object does not yet exist.");
    });
};

createCourse = function (data) {
    "use strict";
    return checkExisting(data).then(function (course) {
        return course;
    }, function () {
        var Course, course;
        Course = Parse.Object.extend("Course");
        course = new Course();
        course.set("courseName", data.courseName);
        course.set("courseIdentifier", data.courseIdentifier);
        course.set("courseCode", parseInt(data.courseCode, 10));
        course.set("type", data.type);
        course.set("sec", data.sec);
        course.set("units", data.units);
        course.set("instructor", data.instructor);
        course.set("days", data.days);
        course.set("time", data.time);
        course.set("placeURL", data.placeURL);
        course.set("placeBuilding", data.placeBuilding);
        course.set("final", data.finalTime);
        course.set("max", parseInt(data.max, 10));
        course.set("localEnr", parseInt(data.localEnr, 10));
        course.set("totalEnr", parseInt(data.totalEnr, 10));
        course.set("wl", parseInt(data.wl, 10));
        course.set("req", parseInt(data.req, 10));
        course.set("nor", parseInt(data.nor, 10));
        course.set("rstr", data.rstr);
        course.set("web", data.web);
        course.set("status", data.status);
        course.set("prerequisites", data.prerequisites);
        course.set("textbooks", data.textbooks);
        return course.save();
    });
};

toTitleCase = function (str) {
    "use strict";
    return str.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
};

Parse.Cloud.job("updateAllCourses", function (response, status) {
	"use strict";
	Parse.Cloud.useMasterKey();
    var BlockHistory, query;
    BlockHistory = Parse.Object.extend("BlockHistory");
    query = new Parse.Query(BlockHistory);
    query.descending("createdAt");
    query.first().then(function (lastBlock) {
        var blocks, history;
        blocks = information.getNextBlockChunk(lastBlock.get("lastBlock"));
        history = new BlockHistory();
        history.set("lastBlock", blocks.slice(-1)[0]);
        Parse.Promise.when(getBlocks(blocks, status)).then(function () {
            history.save();
            status.success("Done");
        }, function (error) {
            console.log(error);
            status.error(" " + error);
        });
    });
});