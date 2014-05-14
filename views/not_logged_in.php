<?php
// show potential errors / feedback (from login object)
if (isset($login)) {
    if ($login->errors) {
        foreach ($login->errors as $error) {
            echo "<div class='alert alert-danger'>"
					 . $error . "</div>";
        }
    }
    if ($login->messages) {
        foreach ($login->messages as $message) {
        	echo "<div class='alert alert-info alert-dismissable'>
					<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;</button>"
					 . $message . "</div>";
        }
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>WebSOC Checker - Login</title>
    <link rel="stylesheet" href="https://netdna.bootstrapcdn.com/bootstrap/3.1.1/css/bootstrap.min.css">
    <link rel="stylesheet" href="main.css">
</head>
<body>

  <header class="navbar navbar-static-top" role="banner">
      <nav class="navbar navbar-default navbar-static-top" role="navigation">
        <div class="container">
          <div class="navbar-header">
            <a class="navbar-brand" href="#">WebSOC Checker</a>
          </div>
        </div>
      </nav>
  </header>
  
  <div class="container form-user-management">
    <div class="jumbotron">
      
      <form method="post" action="index.php" role="form" name="loginform">
        <h3>Login</h3>
        <input id="login_input_username" class="form-control login_input" type="text" name="user_name" placeholder="Enter username" required autofocus />
        <input id="login_input_password" class="form-control login_input" type="password" name="user_password" placeholder="Enter password" autocomplete="off" required/>
        <button id="loginButton" type="submit" name="login" class="btn btn-lg btn-primary btn-block" >Login</button>
      </form>

    </div>
  </div>
  
  <div class="container form-user-management">
  	<div class="jumbotron">
  		<h3>Create new account</h3>
  		<a href="actions/register.php"><button class="btn btn-lg btn-primary btn-block">Register</button>
  	</div>
  </div>

  <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js"></script>
  <script src="http://netdna.bootstrapcdn.com/bootstrap/3.1.1/js/bootstrap.min.js"></script>
</body>
</html>