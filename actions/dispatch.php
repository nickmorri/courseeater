<?php

include_once '../classes/Scrape.class.php';
include_once '../classes/Alert.class.php';
include_once '../config/db.php';

$connection = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

if ($mysqli->connect_error) {
    die('Connect Error (' . $mysqli->connect_errno . ') '
            . $mysqli->connect_error);
}

$sql_data = $connection->prepare("SELECT * FROM coursereg");
$sql_data->bind_result($result_email, $result_course_id);
$sql_data->execute();

$count = 0;

while ($sql_data->fetch()) {
      $currentScrape = new Scrape($result_email, $result_course_id);
      $currentAlert = $currentScrape->check();
      $currentAlert->send();
      $count += 1;
}

echo $count . " alerts dispatched.";

$sql_data->close();
$connection->close();

?>