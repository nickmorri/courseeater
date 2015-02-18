<?php
/*
ini_set('display_errors',1);
ini_set('display_startup_errors',1);
error_reporting(-1);
*/

include_once('simple_html_dom.php');

function process_course_data($course) {
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
    
    return $courseAttributes;
};

function process_courses($course) {
    while ($course != null) {
        
        if ($course->bgcolor == '#fff0ff') {
            break;
        }
        
        if ($course->valign == 'top') {
            $course_data[] = process_course_data($course);    
        }
        
        $course = $course->next_sibling();
        
    }
    return $course_data;
};

function process_html($html) {
    
    foreach($html->find('tr[bgcolor=#fff0ff]') as $class) {
        $item['identifier'] = str_replace("&nbsp;", " ", trim(trim($class->find('td.CourseTitle text', 0)->plaintext, " &nbsp;"), " "));
        $item['name'] = $class->find('td.CourseTitle font', 0)->plaintext;
        if ($class->find('a', 0) != null) {
            $item['prerequisites'] = $class->find('a', 0)->href;    
        }
        $firstCourse = $class->next_sibling('tr')->next_sibling('tr[valign="top"]');
        
        $item['course_data'] = process_courses($firstCourse);
        
        $classes[] = $item;
    }
    
    return json_encode($classes);

};

function get_dept_html($dept) {
    $url = 'http://websoc.reg.uci.edu/perl/WebSoc?YearTerm=2015-14&ShowFinals=1&ShowComments=1&Dept=' . urlencode($dept);

    return file_get_html($url);
};

function get_ge_html($category) {
    $url = 'http://websoc.reg.uci.edu/perl/WebSoc?YearTerm=2015-14&ShowFinals=1&ShowComments=1&Breadth=' . urlencode($category);

    return file_get_html($url);
};

if ($_REQUEST['dept']) {
    $html = get_dept_html(trim($_REQUEST['dept']));    
}
else if ($_REQUEST['category']) {
    $html = get_ge_html(trim($_REQUEST['category']));
}

echo process_html($html);

?>