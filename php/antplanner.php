<?php

$url = 'http://antplanner.appspot.com/schedule/load?username=test1';


$ch = curl_init();

curl_setopt($ch, CURLOPT_URL, $url);


// in real life you should use something like:
// curl_setopt($ch, CURLOPT_POSTFIELDS, 
//          http_build_query(array('postvar1' => 'value1')));

// receive server response ...
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$server_output = curl_exec ($ch);

echo $server_output;

curl_close ($ch);     

?>