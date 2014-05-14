<?php

session_start();

include_once '../config/db.php';

$connection = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

if ($mysqli->connect_error) {
    die('Connect Error (' . $mysqli->connect_errno . ') '
            . $mysqli->connect_error);
}

$sql_data = $connection->prepare("UPDATE users SET user_email=? WHERE user_email=?");
$sql_data->bind_param('ss', $_POST['new_email'], $_SESSION['user_email']);
$sql_data->execute();

$_SESSION['user_email'] = $_POST['new_email'];

echo $_SESSION['user_name'] . "'s email has been updated to " . $_POST['new_email'];

$sql_data->close();
$connection->close();

?>