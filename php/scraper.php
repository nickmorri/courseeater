<?php

function getBlock($block) {
	$url = 'http://websoc.reg.uci.edu/perl/WebSoc?YearTerm=2014-92&ShowFinals=1&ShowComments=1&CourseCodes=' . $block;
	$blockData = file_get_contents($url);
	$pieces = explode('<tr bgcolor="#fff0ff" valign="top"><td class="CourseTitle" colspan="17" nowrap="nowrap">', $blockData);
	return $pieces;
}

function processBlock($data) {
	for ($i = 1; $i < count($data); $i++) {
		echo $data[$i];
	}
	return $data;
}

$rawData = getBlock('0-6500');
echo $rawData[10];
/* $processedData = processBlock($rawData); */

?>