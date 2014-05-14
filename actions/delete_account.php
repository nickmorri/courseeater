<?php

session_start();

include_once('../libraries/password_compatibility_library.php');
include_once '../config/db.php';

$connection = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

if ($mysqli->connect_error) {
    die('Connect Error (' . $mysqli->connect_errno . ') '
            . $mysqli->connect_error);
}

$sql_data = $connection->prepare("SELECT user_password_hash FROM users WHERE user_name=?");
$sql_data->bind_param("s", $_SESSION['user_name']);
$sql_data->bind_result($previous_password_hash);
$sql_data->execute();
$sql_data->fetch();
$sql_data->close();

if (password_verify($_POST['password_delete_account'], $previous_password_hash)) {
	$sql_data = $connection->prepare("DELETE FROM coursereg WHERE user_name = ?");
	$sql_data->bind_param('s', $_SESSION['user_name']);
	$sql_data->execute();

	$sql_data = $connection->prepare("DELETE FROM users WHERE user_name = ?");
	$sql_data->bind_param('s', $_SESSION['user_name']);
	$sql_data->execute();
	
	echo "TRUE";
	$sql_data->close();
	session_destroy();
}
else {
	echo "Incorrect password entered please try again.";
}

$connection->close();



?>