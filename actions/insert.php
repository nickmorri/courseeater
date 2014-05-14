<?php
session_start();

include_once '../config/db.php';

$connection = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

if ($mysqli->connect_error) {
    die('Connect Error (' . $mysqli->connect_errno . ') '
            . $mysqli->connect_error);
}

$sql_data = $connection->prepare("INSERT INTO coursereg (user_name, course_id) VALUES (?, ?)");
$sql_data->bind_param('si', $_SESSION['user_name'], $_POST['course_id']);
$sql_data->execute();

echo $_SESSION['user_name'] . " registered for courseID: " . $_POST['course_id'];
	
$sql_data->close();
$connection->close();
?>