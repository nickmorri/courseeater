<?php
ini_set('display_errors',1);
ini_set('display_startup_errors',1);
error_reporting(-1);

include_once('simple_html_dom.php');

function process_days($days) {
    $processed_days = [];
    
    if (strpos($days, "M")) {
        array_push($processed_days, "Mon");
    }
    if (strpos($days, "Tu")) {
        array_push($processed_days, "Tue");
    }
    if (strpos($days, "W")) {
        array_push($processed_days, "Wed");
    }
    if (strpos($days, "Th")) {
        array_push($processed_days, "Thu");
    }
    if (strpos($days, "F")) {
        array_push($processed_days, "Fri");
    }
    
    return $processed_days;
};

function process_time($time) {
    $clean_time = [];
    
    foreach ($time as $item) {
        $item = str_replace("-", "", $item);
        $split_time = explode(":", $item);
        if (sizeof($split_time) < 2) continue;
        else {
            array_push($clean_time, str_replace("am", "AM", $split_time[0]) . ":" . str_replace("p", "PM", $split_time[1]));
        }
    }
    
    return $clean_time;
};

function process_datetime($time) {
    
    $split_datetime = preg_split('/\s+/', $time);
    
    $days = process_days($split_datetime[0]);
    $time = process_time(array_slice($split_datetime, 1));    
    
    return $time;
};

function process_course_data($course) {
    $courseCode = $course->find('td', 0)->plaintext;
    $type = strtoupper($course->find('td', 1)->plaintext);
    $sec = $course->find('td', 2)->plaintext;
    $units = $course->find('td', 3)->plaintext;
    $instructor = $course->find('td', 4)->plaintext;
    $time = process_datetime($course->find('td', 5)->plaintext);
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
        
        if (!isset($class->valign)) {
            continue;
        }
        
        $item['identifier'] = str_replace("&nbsp;", " ", trim(trim($class->find('td.CourseTitle text', 0)->plaintext, " &nbsp;"), " "));
        $item['name'] = $class->find('td.CourseTitle font', 0)->plaintext;
        if ($class->find('a', 0) != null) {
            if ($class->find('a', 0)->plaintext == "Co-courses") {
                $item['cocourses'] = $class->find('a', 0)->href;
            }
            else if ($class->find('a', 0)->plaintext == "Prerequisites") {
                $item['prerequisites'] = $class->find('a', 0)->href;    
            }
        }
        $firstCourse = $class->next_sibling('tr')->next_sibling('tr[valign="top"]');
        
        $item['course_data'] = process_courses($firstCourse);
        
        $classes[] = $item;
    }
    
    return json_encode($classes);

};

function request_html($url) {
    $curl = curl_init();
    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, FALSE);
    curl_setopt($curl, CURLOPT_HEADER, false);
    curl_setopt($curl, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($curl, CURLOPT_URL, $url);
    curl_setopt($curl, CURLOPT_REFERER, $url);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, TRUE);
    $str = curl_exec($curl);
    curl_close($curl);
    
    $html_base = new simple_html_dom();
    // Load HTML from a string
    return $html_base->load($str);
};

function get_course_html($course_code) {
    $url = 'http://websoc.reg.uci.edu/perl/WebSoc?YearTerm=2015-14&ShowFinals=1&ShowComments=1&CourseCodes=' . urlencode($course_code);
    return request_html($url);
};

function get_co_course_html($course_code) {
    $url = 'http://websoc.reg.uci.edu/perl/WebSoc?YearTerm=2015-14&ShowFinals=1&ShowComments=1&CoCourse=' . urlencode($course_code);
    return request_html($url);
};

function get_dept_html($department) {
    $url = 'http://websoc.reg.uci.edu/perl/WebSoc?YearTerm=2015-14&ShowFinals=1&ShowComments=1&Dept=' . urlencode($department);
    return request_html($url);
};

function get_ge_html($category) {
    $url = 'http://websoc.reg.uci.edu/perl/WebSoc?YearTerm=2015-14&ShowFinals=1&ShowComments=1&Breadth=' . urlencode($category);
    return request_html($url);
};

function get_available_departments() {
    $html = request_html('http://websoc.reg.uci.edu/perl/WebSoc');
    
    $dropdown = $html->find('select[name="Dept"]', 0);
    
    foreach($dropdown->find('option') as $department) {
        $departments[] = $department->value;    
    }
    
    return json_encode($departments);
};

function get_available_ge_categories() {
    $html = request_html('http://websoc.reg.uci.edu/perl/WebSoc');
    
    $dropdown = $html->find('select[name="Breadth"]', 0);
    
    foreach($dropdown->find('option') as $category) {
        
        if ($category->value != "ANY") {
            $item['name'] = $category->plaintext;
            $item['value'] = $category->value;        
            $categories[] = $item;
        }
    }
    
    return json_encode($categories);
};

if ($_REQUEST['course_code']) {
    $html = get_course_html(trim($_REQUEST['course_code']));
    echo process_html($html);
}
else if ($_REQUEST['course_code_cocourses']) {
    $html = get_co_course_html(trim($_REQUEST['course_code_cocourses']));
    echo process_html($html);
} 
else if ($_REQUEST['department']) {
    $html = get_dept_html(trim($_REQUEST['department']));
    echo process_html($html);
}
else if ($_REQUEST['category']) {
    $html = get_ge_html(trim($_REQUEST['category']));
    echo process_html($html);
}
else if ($_REQUEST['available_departments']) {
    echo get_available_departments();
}
else if ($_REQUEST['available_ge_categories']) {
    echo get_available_ge_categories();
}

?>