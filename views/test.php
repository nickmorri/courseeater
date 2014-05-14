<?php
$info = json_decode(file_get_contents('http://salty-coast-5895.herokuapp.com/api/getcourse/37030'));

$courseName = $info->courseName;

$pos = strpos($courseName, "(");
if ($pos != FALSE) {
	$courseName = substr($courseName, 0, $pos);
}
$courseName = preg_replace('/[^\w&]/', ' ', $courseName);

$pos = strpos($courseName, "101");

$shortName = substr($courseName, 0, $pos + 1);
$longName = substr($courseName, $pos + 1);

/* echo $shortName; */
echo $longName;

?>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
</head>
</html>