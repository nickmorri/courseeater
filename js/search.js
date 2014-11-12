/*global window, CourseView, ClassView, Ladda, jQuery, storeCourses, sameClass, toTitleCase, cacheFresh, $, document, Parse, console, getCourseFromCache */
/*jslint plusplus: true */

var instructorSearch, identifierSearch, displaySearch;

instructorSearch = function (searchTerm, displayFunction) {
    "use strict";
    var query = new Parse.Query("Course");
    query.startsWith("instructor", searchTerm.toUpperCase());
    return query.find().then(function (results) {
        if (results.length > 0) {
            displayFunction(results);
        }
    });
};

identifierSearch = function (searchTerm, displayFunction) {
    "use strict";
    var query = new Parse.Query("Course");
    query.startsWith("courseIdentifier", toTitleCase(searchTerm));
    return query.find().then(function (results) {
        if (results.length > 0) {
            displayFunction(results);
        }
    });
};

displaySearch = function (courses) {
    "use strict";
    var course, i;
    for (i = 0; i < courses.length; i++) {
        course = new CourseView(courses[i].attributes);
        $("#searchDisplay").append('<div class="col-lg-4 col-md-6">' + course.buildDefaultPanel() + '</div>');
    }
};

// Allows enter to submit course by calling #addCourse button click
$(document).on("keypress", "#searchField", function (event) {
    "use strict";
    if (event.which === 13) { $(".btn-search").click(); }
});

$(document).on("click", ".btn-search", function () {
    "use strict";
    var search;
    search = $("#searchField").val();
    $("#searchDisplay").val('');
    instructorSearch(search, displaySearch);
    identifierSearch(search, displaySearch);
    if ($("#searchDisplay").val() === "") {
        $("#searchDisplay").html("<div class='container'><h2>No results found.</h2></div>");
    }
});

// Conducts addition of course to user account
$(document).on("click", ".btn-add", function () {
    "use strict";
    var courseCode, lBtn;
    courseCode = parseInt($(this).parent().parent().attr('id'), 10);
    lBtn = Ladda.create(this);
    lBtn.start();
    lBtn.setProgress('.50');
    Parse.Cloud.run('addCourse', {courseCode: courseCode}).then(function () {
        lBtn.stop();
        storeCourses();
    }, function (error) {
        lBtn.stop();
        console.log(error);
    });
});

// Remove course from user's profile
$(document).on('click', ".btn-remove", function () {
    "use strict";
    var courseCode, lBtn;
    lBtn = Ladda.create(this);
    lBtn.start();
    lBtn.setProgress('.50');
    courseCode = $(this).parent().parent().parent().attr("id").split("-")[1];
    if (courseCode === undefined) {
        courseCode = $(this).parent().parent().parent().attr("id");
    }
    getCourseFromCache(courseCode).remove().then(function (error) {
        console.log(error);
        $(".alert-invalid-courseid").html("Whoops something went wrong.");
        $(".alert-invalid-courseid").show();
    }).then(function () {
        cacheFresh("refresh");
        storeCourses();
        lBtn.stop();
    });
});