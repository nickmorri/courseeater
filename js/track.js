$(document).ready(function() {	
	getCourses();
});
		
// Determines cache's freshness
function cacheFresh(reason) {
	var expiration = 1;
	var currentTime = new Date();
	var freshness = true;
  	if (reason == "refresh") {
	  	freshness = false;
  	}
  	else if (typeof(sessionStorage['cacheAge']) == 'undefined') {
  		freshness = false;
  	}
  	else {
  		var cacheTime = new Date(sessionStorage['cacheAge']);
	  	if(currentTime.getMinutes() - cacheTime.getMinutes() > expiration || Parse.User.current().updatedAt > cacheTime) {
	  		freshness = false;
	  	}
  	}
  	if (freshness == false) {
	  	sessionStorage.clear();
	  	sessionStorage['cacheAge'] = currentTime;
	  	console.log("Cache freshened.");
  	}
};

// Retrieves course information from Parse
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

// Display Course objects
function displayCourses() {
	$("#courseDisplay").empty();
	var courses = JSON.parse(sessionStorage['courses']);
	if (courses.length < 1) {
		$("#courseDisplay").html("<div class='jumbotron'><h1><small>You're not tracking any courses.</small></h1><h3><small>Go checkout Earth Systems Science 1: <b>42000</b></h3><small></div>");
	}
	else {
		for (var i = 0; i < courses.length; i++) {
			var courseView = new CourseView(courses[i]);
			$("#courseDisplay").append(courseView.buildHTML());
		}
		$(".top").tooltip({
			placement: "top"
		});
	}
};

// Allows enter to submit course by calling #addCourse button click
$(document).on("keypress", "#courseID", function(event) {
	if (event.which == 13) { $(".button-add").click(); }
});

// Selects courseCode on click of courseCode div
$(document).on("click", ".course-view-courseID", function() {
	var range, selection;

    if (window.getSelection && document.createRange) {
        selection = window.getSelection();
        range = document.createRange();
        range.selectNodeContents($(this)[0]);
        selection.removeAllRanges();
        selection.addRange(range);
    } else if (document.selection && document.body.createTextRange) {
        range = document.body.createTextRange();
        range.moveToElementText($(this)[0]);
        range.select();
    }
});

// Adds to user profile
$(document).on("click", ".button-add", function() {
	$(".alert-invalid-courseid").hide();
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
				course.save().then(function() {
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
					cacheFresh("refresh")
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
$(document).on("click", ".refresh-data", function() {
	var btn = Ladda.create(this);
	btn.start();
	$("#courseDisplay").empty();
	cacheFresh("refresh");
	Parse.Cloud.run("refreshCourses").then(function() {
		getCourses();
		$(".alert").hide();
		btn.stop();
	});
});