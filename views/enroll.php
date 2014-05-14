<?php
session_start();
if (!isset($_SESSION['user_login_status']) && $_SESSION['user_login_status'] == 1) {
   header( 'Location: http://nickmorri.com/websoc/' ) ;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>WebSOC Checker - Enroll</title>
    <link rel="stylesheet" href="bootstrap/css/bootstrap.min.css">
    <link rel="stylesheet" href="../main.css">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js"></script>
    <script>
    $(document).ajaxComplete(function() {
	   $("#loading").hide();
    });
    $(document).on("click", "#space_info", function() {
	    $("#help_modal").modal('show');
    });
    $(document).ready(function() {
    	$('#enrolled_courses').load('class_list.php #enrolled_courses');
		$("#insertForm").submit(function() {
			event.preventDefault();
			$.ajax({
				type: "post",
				url: "../actions/insert.php",
				data: $("#course_id"),
				success: function() {
					$("#loading").show();
					$("#insertForm").trigger("reset");
					$('#enrolled_courses').load('class_list.php #enrolled_courses');					
				}
			});
		});
		$(document).on("click", "#course_table .remove-btn", function (){
			var to_delete_course_id = this.parentNode.parentNode.id;
			$.ajax({
				type: "post",
				url: "../actions/remove.php",
				data: {course_id: to_delete_course_id.substr(1, 5)},
				success: function() {
					/* Poor code find some way to fix */
					$("#" + to_delete_course_id).remove();
					$('#enrolled_courses').load('class_list.php #enrolled_courses');
				}
			});
		});
	});
	</script>
</head>
<body>

  <header class="navbar navbar-static-top" role="banner">
      <nav class="navbar navbar-default navbar-static-top" role="navigation">
        <div class="container">
          <div class="navbar-header">
            <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
              <span class="sr-only">Toggle navigation</span>
              <span class="icon-bar"></span>
              <span class="icon-bar"></span>
              <span class="icon-bar"></span>
            </button>
            <a class="navbar-brand" href="../">WebSOC Checker</a>
          </div>
          <div class="collapse navbar-collapse">
            <ul class="nav navbar-nav">
              <li class="active"><a href="enroll.php"><span class="glyphicon glyphicon-book"></span> Enroll</a></li>
            </ul>
            <ul class="nav navbar-nav navbar-right">
				<li class="dropdown">
					<a href="#" class="dropdown-toggle" data-toggle="dropdown"><span class="glyphicon glyphicon-user"></span> <?php echo $_SESSION['user_name'];?></a>
					<ul class="dropdown-menu">
						<li><a href="../index.php?logout"><span class="glyphicon glyphicon-log-out"></span> Sign out</a></li>
						<li><a href="account_settings.php"><span class="glyphicon glyphicon-cog"></span> Account Settings</a></li>
					</ul>
				</li>
			</ul>
          </div>
        </div>
      </nav>
  </header>
  
  <div class="container form-user-management">
    <div class="jumbotron">
      
      <form id="insertForm" role="form">
        <h3>Add course interest</h3>
        <input id="course_id" type="tel" maxlength="5" class="form-control" name="course_id" placeholder="Enter CourseID" required autofocus />
        <input type="submit" class="btn btn-lg btn-primary btn-block button-spaced" value="Add" />
      </form>
      
    </div>
  </div>
  
  <div id="course_container" class="container form-user-management">
  	<div id="loading" style="position:relative;">
  		<img style="position:absolute; margin: auto; top:0;left:0;right:0;bottom:0;" src="resources/loading.gif" />
  	</div>
  	<div id="enrolled_courses"></div>
  </div>  

	<script src="bootstrap/js/bootstrap.min.js"></script>
</body>
</html>
