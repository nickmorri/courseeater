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
    <title>WebSOC Checker - Account Settings</title>
    <link rel="stylesheet" href="bootstrap/css/bootstrap.min.css">
    <link rel="stylesheet" href="../main.css">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js"></script>
    <script>
    $(document).ready(function() {
    	$("#updateEmail").submit(function() {
    		event.preventDefault();
			$.ajax({
				type: "post",
				url: "../actions/update_email.php",
				data: $("#new_email"),
				success: function(html) {
					$("#account_alert").show();
					$("#account_alert span").text("Email updated successfully");
					$("#updateEmail").trigger("reset");
				},
				fail: function(html) {
					console.log(html);
				}
			});	
		});
		$("#updatePassword").submit(function() {
			event.preventDefault();
			$.ajax({
				type: "post",
				url: "../actions/update_password.php",
				data: $("#updatePassword").serialize(),
				success: function(html) {
					$("#updatePassword").trigger("reset");
					$("#account_alert").show();
					if (html == "MISMATCH") {
						var message = "Password does not match verification password. Please try again.";
					}
					else if (html == "INVALID") {
						var message = "Incorrect password entered. Please try again.";
					}
					else if (html == "SUCCESS") {
						var message = "Password successfully updated.";
					}
					else {
						var message = "An unknown error has occured contact the system administrator.";
					}
					$("#account_alert span").text(message);
				},
				fail: function(html) {
					console.log(html);
				}
			});
		});
		$("#deleteAccount").submit(function() {
			event.preventDefault();
			$.ajax({
				type: "post",
				url: "../actions/delete_account.php",
				data: $("#password_delete_account"),
				success: function(html) {					
					if (html == "TRUE") {
						window.location.replace("http://nickmorri.com/projects/websoc/");
					}
					else {
						alert(html);
					}
				},
				fail: function(html) {
					console.log(html);
				}
			});
		});		
	});
    </script>
</head>
<body>

	<div id="account_alert" class='alert alert-success alert-dismissable' style="display:none">
		<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;</button>
		<span></span>
	</div>

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
						<li><a href="enroll.php"><span class="glyphicon glyphicon-book"></span> Enroll</a></li>
					</ul>
					<ul class="nav navbar-nav navbar-right">
						<li class="dropdown active">
							<a href="#" class="dropdown-toggle" data-toggle="dropdown"><span class="glyphicon glyphicon-user"></span> <?php echo $_SESSION['user_name']; ?></a>
							<ul class="dropdown-menu">
								<li><a href="../index.php?logout"><span class="glyphicon glyphicon-log-out"></span> Sign out</a></li>
								<li><a href="#"><span class="glyphicon glyphicon-cog"></span> Account Settings</a></li>
							</ul>
						</li>
					</ul>
				</div>
			</div>
		</nav>
	</header>
  
	<div class="container form-user-management">
  		<div class="jumbotron">
  			<h3>Account<br><small>Change your basic account settings</small></h3>
  			<div class="panel panel-default">
  				<div class="panel-heading">
	  				<h3 class="panel-title">Change email preferences</h3>
	  			</div>  			
	  			<div class="panel-body">
  					<form id="updateEmail" role="form">
	  					<label for="new_email">Email</label>
	  					<input type="email" class="form-control" id="new_email" name="new_email" placeholder="Email" />
	  					<input type="submit" class="btn btn-lg btn-primary btn-block button-spaced" value="Update Email" />
	  				</form>
	  			</div>
	  		</div>
  		
	  		<div class="panel panel-default">
  				<div class="panel-heading">
	  				<h3 class="panel-title">Change password preferences</h3>
	  			</div>
	  			<div class="panel-body">
  					<form id="updatePassword" role="form">
	  					<label for="inputCurrentPassword">Current password</label>
	  					<input type="password" class="form-control" name="inputCurrentPassword" placeholder="Current password" />
	  					<label for="inputNewPassword">New password</label>
	  					<input type="password" class="form-control" name="inputNewPassword" placeholder="New password" />
	  					<label for="inputVerifyPassword">Verify password</label>
	  					<input type="password" class="form-control" name="inputVerifyPassword" placeholder="Verify password" />
	  					<input type="submit" class="btn btn-lg btn-primary btn-block button-spaced" value="Update Password" />
	  				</form>
	  			</div>
	  		</div>
  		
	  		<div class="panel panel-default">
  				<div class="panel-heading">
		  			<h3 class="panel-title">Delete account permanently</h3>
		  			</div>
		  		<div class="panel-body"> 
	  				<form id="deleteAccount" role="form">
	  					<label for="password_delete_account">Current password</label>
	  					<input type="password" class="form-control" id="password_delete_account" name="password_delete_account" placeholder="Current password" />
	  					<input type="submit" class="btn btn-lg btn-primary btn-block button-spaced" value="Delete account" />
	  				</form>
	  			</div>
	  		</div>
	  		
  		</div>
	</div>
  
	<script src="bootstrap/js/bootstrap.min.js"></script>
</body>
</html>
