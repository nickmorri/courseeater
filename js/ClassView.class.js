/*global navigator*/

var buildCollapsible, buildClass;

// CourseView class
function ClassView() {
    "use strict";
    this.courses = [];
    this.mainCourseCode;
};

ClassView.prototype.addCourse = function (course) {
	if (this.mainCourseCode === undefined) {
		this.mainCourseCode = course.courseCode;
	}
	this.courses.push(course);
};

ClassView.prototype.buildCollapsible = function () {
	var collapsible
	collapsible = '<div class="col-lg-4 col-md-6">';
	collapsible += '<div class="panel-group course-list-item" id="accordion-' + this.mainCourseCode + '">';
	for (var i = 0; i < this.courses.length; i++) {
		courseView = new CourseView(this.courses[i]);
		collapsible += courseView.buildSubPanel(i, this.mainCourseCode);
	}
	collapsible += '</div>';
	collapsible += '</div>';
	return collapsible;
};

ClassView.prototype.buildClass = function () {
	return this.buildCollapsible();
};