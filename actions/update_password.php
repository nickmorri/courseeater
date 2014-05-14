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

if ($_POST['inputNewPassword'] == $_POST['inputVerifyPassword']) {
	$current_password = $_POST["inputCurrentPassword"];
}
else {
	echo "MISMATCH";
}

if (password_verify($current_password, $previous_password_hash)) {
	$new_password_hash = password_hash($_POST['inputNewPassword'], PASSWORD_DEFAULT);
	$sql_data = $connection->prepare("UPDATE users SET user_password_hash=? WHERE user_name=?");
	$sql_data->bind_param("ss", $new_password_hash, $_SESSION['user_name']);
	$sql_data->execute();
	echo "SUCCESS";
}
else {
	echo "INVALID";
}

$sql_data->close();
$connection->close();

?>