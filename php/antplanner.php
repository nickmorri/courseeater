<?php

$url = 'http://antplanner.appspot.com/schedule/load?username=' + trim($_REQUEST['course_code']);

$ch = curl_init();

curl_setopt($ch, CURLOPT_URL, $url);

curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$server_output = curl_exec ($ch);

echo $server_output;

curl_close ($ch);     

?>