// Detects if cache is expired
function cacheFresh() {
	var expiration = 1;
	var currentTime = new Date();
  	if (typeof(sessionStorage['cacheAge']) == 'undefined') {
  		console.log("Initializing cache");
  		sessionStorage.clear();
	  	sessionStorage['cacheAge'] = currentTime;
  	}
  	else {
  		var cacheTime = new Date(sessionStorage['cacheAge']);
  		
	  	if(currentTime.getMinutes() - cacheTime.getMinutes() > expiration) {
	  		console.log("Stale caching. Clearing session data.");
	  		sessionStorage.clear();
	  		sessionStorage['cacheAge'] = currentTime;
	  	}
	  	else if (Parse.User.current().updatedAt > cacheTime) {
		  	console.log("Updated data found. Clearing session data.");
	  		sessionStorage.clear();
	  		sessionStorage['cacheAge'] = currentTime;
	  	}
  	}
};

// Retrieves courses from Parse
function getCourses() {
	cacheFresh();
	if (typeof(sessionStorage['courses']) == 'undefined') {
		var courses = Parse.User.current().relation("courses");	
		courses.query().find({				
			success: function(remoteCourses) {
				sessionStorage['courses'] = JSON.stringify(remoteCourses);
				displayCourses();
			},
			error: function(courses, error) {
				console.log(error);
			}
		});
	}
	else {
		displayCourses();
	}
};

function courseInfo(objectId, additionalClasses, courseIdentifier, courseName, courseCode) {
	var infoString = "";
	infoString += '<div class="panel-heading"><h3 class="panel-title">' + additionalClasses + courseIdentifier.toUpperCase() + '<span class="badge pull-right">' + courseCode + '</span></h3></div>';
	return infoString;
};

function courseName(name) {
	var courseName = '<li class="list-group-item"><span class="glyphicon glyphicon-pencil list-detail-glyphicon"></span> ' + name + '</li>';
	return courseName;
}

function courseReqs(prerequisites, cocourses) {
	var additionalClasses = '';
	if (prerequisites) {
		additionalClasses += '<span class="label label-warning top" title="Prerequisites needed" data-original-title="Tooltip on right">P</span> ';
	}
	if (cocourses) {
		additionalClasses += '<span class="label label-warning top" title="Cocourses needed" data-original-title="Tooltip on right">C</span> ';
	}
	return additionalClasses;
};

function courseDays(heldDaysRaw) {
	var dayString = "";
	var days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
	var heldDays = heldDaysRaw.split(",");
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
}

function courseLocation(location) {
	var building = location.substr(0, location.indexOf((" ")));
	var locationString = '<li class="list-group-item"><span class="glyphicon glyphicon-flag list-detail-glyphicon"></span> <a href="https://eee.uci.edu/toolbox/roomfinder/room.php?building_abbr=';
	locationString += building + '" target="_blank">' + location + '</a></li>';
	return locationString;
};

function courseProgress(enrolled, maximum) {
	var coursePercentRemaining = 100 - (enrolled / maximum * 100);
	var remaining = maximum - enrolled;
	var progressString = "";
	if (coursePercentRemaining > 25) {
		progressString = '<li class="list-group-item"><span class="glyphicon glyphicon-stats list-detail-glyphicon pull-left"></span><div class="progress progress-striped active"><div class="progress-bar progress-bar-success" role="progressbar" aria-valuenow="' + coursePercentRemaining + '" aria-valuemin="0" aria-valuemax="100" style="width:' + coursePercentRemaining + '%;">' + remaining + ' spots left</div></div></li>';
	return progressString;
	}
};

function courseTime(time) {
	var timeString = '<li class="list-group-item"><span class="glyphicon glyphicon-time list-detail-glyphicon"></span> ' + time + '</li>';
	return timeString;
}

function courseInstructor(instructor) {
	var instructorString = '<li class="list-group-item"><span class="glyphicon glyphicon-user list-detail-glyphicon"></span> ' + instructor + '</li>';
	return instructorString;
}
// Displays course object
function displayCourse(course) {
	var name = courseName(course.courseName);
	var additionalClasses = courseReqs(course.prerequisites, course.cocourses);
	var info = courseInfo(course.objectId, additionalClasses, course.courseIdentifier, course.courseName, course.courseCode);
	var days = courseDays(course.days);
	var time = courseTime(course.time);
	var location = courseLocation(course.place);
	var progress = courseProgress(course.enr, course.max);
	var instructor = courseInstructor(course.instructor);
	
	$("#courseDisplay").append("<div id='" + course.objectId + "' class='panel panel-primary course-list-item'>");
	$("#" + course.objectId).append(info);
	$("#" + course.objectId).append('<ul class="list-group">');
	$("#" + course.objectId).append(name);
	$("#" + course.objectId).append(instructor);
	$("#" + course.objectId).append(days);
	$("#" + course.objectId).append(time);
	$("#" + course.objectId).append(location);
	$("#" + course.objectId).append(progress);
	$("#" + course.objectId).append('</ul>');
	$("#" + course.objectId).append('<button type="button" class="btn btn-danger btn-block btn-remove ladda-button" data-loading-text="Removing...">Remove</button>');
	$("#" + course.objectId).append("</div>");	
};

// Display Course objects
function displayCourses() {
	$("#courseDisplay").empty();
	var courses = JSON.parse(sessionStorage['courses']);
	if (courses.length < 1) {
		$("#courseDisplay").hide();
	}
	else {
		$("#courseDisplay").show();
		for (var i = 0; i < courses.length; i++) {
			displayCourse(courses[i]);
		}
		$(".top").tooltip({
			placement: "top"
		});
	}
};


// Allows enter to submit course by calling #addCourse button click
$(document).on("keypress", "#courseID", function(event) {
	if (event.which == 13) {
		$("#addCourse").click();
	}
});

// Adds to user profile
$(document).on("click", "#addCourse", function() {
	$(".alert-invalid-courseid").hide();
	event.preventDefault();
	var courseCode = parseInt($("#courseID").val());
	if ($("#courseID").val() == "") {
		$(".alert-invalid-courseid").html("<strong>No courseID entered.</strong>");
		$(".alert-invalid-courseid").show();
		$("#courseID").val('');
		return false;
	}
	if ($("#courseID").val() != courseCode || courseCode < 10000) {
		$(".alert-invalid-courseid").html("<strong>" + $("#courseID").val() + "</strong> is an invalid Course ID. Valid courseIDs must be 5 exactly 5 nubmers.");
		$(".alert-invalid-courseid").show();
		$("#courseID").val('');
		return false;
	}
	var courses = JSON.parse(sessionStorage.getItem('courses'));
	if (courses) {
		for (var i = 0; i < courses.length; i++) {
			if (courses[i].courseCode == courseCode) {
				$(".alert-invalid-courseid").html("<strong>" + $("#courseID").val() + "</strong> is already being tracked.");
				$(".alert-invalid-courseid").show();
				$("#courseID").val('');
				return false;
			}
		}	
	}
	var lBtn = Ladda.create(this);
	var bBtn = $(this);
	lBtn.start();
	bBtn.button("loading");
	lBtn.setProgress(0);
	var Course = Parse.Object.extend("Course");
	var courseQuery = new Parse.Query(Course);
	courseQuery.equalTo("courseCode", courseCode);
	courseQuery.first({
		success: function(course) {
			lBtn.setProgress(.25);
			if (!course) {
				var course = new Course();
				course.set("courseCode", courseCode);
				course.save(null, {
					success:function(course) {
						lBtn.setProgress(.5);
						Parse.User.current().relation("courses").add(course);
						Parse.User.current().save(null, {
							success: function() {
								lBtn.setProgress(1);
								sessionStorage.clear();
								getCourses();
								$("#courseID").val('');
								lBtn.stop();
								bBtn.button("reset");
							}
						});
						
					},
					error: function(course, error) {
						$(".alert-invalid-courseid").html("Course <strong>" + courseCode + "</strong> does not exist.");
						$(".alert-invalid-courseid").show();
						$("#courseID").val('');
						lBtn.stop();
						bBtn.button("reset");
					}
				});
			}
			else {
				Parse.User.current().relation("courses").add(course);
				Parse.User.current().save(null, {
					success: function() {
						lBtn.setProgress(1);
						sessionStorage.clear();
						getCourses();
						$("#courseID").val('');
						lBtn.stop();
						bBtn.button("reset");
					}
				});
				
			}
			
		},
		error: function(course, error) {
			console.log(error);
			lBtn.stop();
			bBtn.button("reset");
		}
	});	
});
	
// Remove course from user's profile
$(document).on('click', ".btn-remove", function() {
	var btn = Ladda.create(this);
	$(this).button("loading");
	btn.start();
	btn.setProgress(.25);
	var Course = Parse.Object.extend("Course");
	var courseQuery = new Parse.Query(Course);
	var courseID = $(this).parent().attr('id');
	courseQuery.get(courseID, {
		success: function(course) {
			btn.setProgress(.5);
			Parse.User.current().relation("courses").remove(course);
			Parse.User.current().save(null, {
				success: function() {
					btn.setProgress(1);
					sessionStorage.clear();
					getCourses();
				}
			});
			
		},
		error: function(course, error) {
			console.log(error);
		}
	});
});

// Clears any sessionStorage data and reloads data from Parse
$(document).on("click", "#clear-data", function() {
	event.preventDefault();
	var btn = Ladda.create(this);
	btn.start();
	$("#courseDisplay").empty();
	sessionStorage.clear();
	console.log("Cache cleared.");
	getCourses();
	$(".alert").hide();
	btn.stop();
});