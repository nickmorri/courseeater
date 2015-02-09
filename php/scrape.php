<?php
include_once('simple_html_dom.php');

function scraping_websoc($courseCode) {
    
    $url = 'http://websoc.reg.uci.edu/perl/WebSoc?YearTerm=2015-14&ShowFinals=1&ShowComments=1&CourseCodes=' . $courseCode;

    $html = file_get_html($url);
    
    $course = $html->find('tr[bgcolor=#FFFFCC]', 0);
    
    $courseCode = $course->find('td', 0)->plaintext;
    $type = $course->find('td', 1)->plaintext;
    $sec = $course->find('td', 2)->plaintext;
    $units = $course->find('td', 3)->plaintext;
    $instructor = $course->find('td', 4)->plaintext;
    $time = $course->find('td', 5)->plaintext;
    $place = $course->find('td', 6)->plaintext;
    $final = $course->find('td', 7)->plaintext;
    $max = $course->find('td', 8)->plaintext;
    $enr = $course->find('td', 9)->plaintext;
    $wl = $course->find('td', 10)->plaintext;
    $req = $course->find('td', 11)->plaintext;
    $rstr = $course->find('td', 12)->plaintext;
    $textbooks = $course->find('td', 13)->plaintext;
    $web = $course->find('td', 14)->plaintext;
    $status = $course->find('td', 15)->plaintext;
    
    $courseAttributes = array('courseCode' => $courseCode, 'type' => $type, 'sec' => $sec, 'units' => $units, 'instructor' => $instructor, 'time' => $time, 'place' => $place, 'final' => $final, 'max' => $max, 'enr' => $enr, 'wl' => $wl, 'req' => $req, 'rstr' => $rstr, 'textbooks' => $textbooks, 'web' => $web, 'status' => $status);
    
    return json_encode($courseAttributes);

}

echo scraping_websoc(trim($_REQUEST['course_code']))

?>