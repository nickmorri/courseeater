<?php
// show potential errors / feedback (from registration object)
if (isset($registration)) {
    if ($registration->errors) {
        foreach ($registration->errors as $error) {
            echo "<div class='alert alert-danger'>"
					 . $error . "</div>";
        }
    }
    if ($registration->messages) {
        foreach ($registration->messages as $message) {
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
    <title>WebSOC Checker - Register</title>
    <link rel="stylesheet" href="https://netdna.bootstrapcdn.com/bootstrap/3.1.1/css/bootstrap.min.css">
    <link rel="stylesheet" href="../main.css">
</head>
<body>

  <header class="navbar navbar-static-top" role="banner">
      <nav class="navbar navbar-default navbar-static-top" role="navigation">
        <div class="container">
          <div class="navbar-header">
            <a class="navbar-brand" href="../">WebSOC Checker</a>
          </div>
        </div>
      </nav>
  </header>
  
  <div class="container form-user-management">
	<div class="jumbotron">

		<form method="post" action="../actions/register.php" role="form">
			<h3>Register new account</h3>
			<input id="register_input_username" class="form-control" type="text" pattern="[a-zA-Z0-9]{2,64}" name="user_name" placeholder="Username (letters and numbers)" autofocus required />
			<input id="register_input_email" class="form-control" type="email" name="user_email" placeholder="Email" required />
			<input id="register_input_password_new" class="form-control" type="password" name="user_password_new" pattern=".{6,}" placeholder="Password (min. 6 characters)" required autocomplete="off" />
			<input id="register_input_password_repeat" class="form-control" type="password" name="user_password_repeat" pattern=".{6,}" placeholder="Repeat password" required autocomplete="off" />
			<button type="submit"  name="register" class="btn btn-lg btn-primary btn-block" >Register</button>
		</form>
		
	</div>
  </div>

  <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js"></script>
  <script src="http://netdna.bootstrapcdn.com/bootstrap/3.1.1/js/bootstrap.min.js"></script>
</body>
</html>