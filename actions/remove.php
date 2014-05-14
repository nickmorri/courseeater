<?php
session_start();

var_dump($_POST);

include_once '../config/db.php';

$connection = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

if ($mysqli->connect_error) {
    die('Connect Error (' . $mysqli->connect_errno . ') '
            . $mysqli->connect_error);
}

$sql_data = $connection->prepare("DELETE FROM coursereg WHERE user_name=? AND course_id=?");
$sql_data->bind_param('si', $_SESSION['user_name'], $_POST['course_id']);
$sql_data->execute();

echo $_SESSION['user_name'] . " unregistered for courseID: " . $_POST['course_id'];

$sql_data->close();
$connection->close();
?>