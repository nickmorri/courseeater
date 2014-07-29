/*global CourseView*/

var buildCollapsible, buildClass;

// CourseView class
function ClassView() {
    "use strict";
    this.courses = [];
    this.mainCourseCode = undefined;
}

ClassView.prototype.addCourse = function (course) {
    "use strict";
    if (this.mainCourseCode === undefined) {
        this.mainCourseCode = course.courseCode;
    }
    this.courses.push(course);
};

ClassView.prototype.buildCollapsible = function () {
    "use strict";
    var collapsible, courseView, i;
    collapsible = '<div class="col-lg-4 col-md-6">';
    collapsible += '<div class="panel-group course-list-item" id="accordion-' + this.mainCourseCode + '">';
    for (i = 0; i < this.courses.length; i++) {
        courseView = new CourseView(this.courses[i]);
        collapsible += courseView.buildSubPanel(i, this.mainCourseCode);
    }
    collapsible += '</div>';
    collapsible += '</div>';
    return collapsible;
};

ClassView.prototype.buildClass = function () {
    "use strict";
    return this.buildCollapsible();
};