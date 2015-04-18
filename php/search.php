<?php
/*
ini_set('display_errors',1);
ini_set('display_startup_errors',1);
error_reporting(-1);
*/

include_once('simple_html_dom.php');
include_once('cache.php');

$GLOBALS['term'] = '2015-14';

function process_days($days) {
    $processed_days = [];
    
    if (strstr($days, "M")) {
        array_push($processed_days, "Mon");
    }
    if (strstr($days, "Tu")) {
        array_push($processed_days, "Tue");
    }
    if (strstr($days, "W")) {
        array_push($processed_days, "Wed");
    }
    if (strstr($days, "Th")) {
        array_push($processed_days, "Thu");
    }
    if (strstr($days, "F")) {
        array_push($processed_days, "Fri");
    }
    
    return $processed_days;
};

function process_time($time) {
    
    $time = explode("-", htmlspecialchars_decode($time));
    
    $clean_time = [];
    
    foreach($time as $dirty_time_part) {
        
        $dirty_time_part = trim($dirty_time_part);
        
        if (strpos($dirty_time_part, "TBA") !== false) {
            return null;
        }
        
        if (strpos($dirty_time_part, ":") === false) {
            continue;
        }
        
        $clean_time_part = str_replace(["a", "p", "-", "&nbs;"], "", $dirty_time_part);

        $clean_time[] = $clean_time_part;
        
    }
    
    $first_hour = explode(":", $clean_time[0])[0];
    $second_hour = explode(":", $clean_time[1])[0];
    
    if ($first_hour > $second_hour) {
        if ($first_hour == 12) {
            $clean_time[] = "PM";
        }
        else {
            $clean_time[] = "AM-PM";
        }
    }
    else if ($first_hour < 8) {
        $clean_time[] = "PM";
    }
    else if ($first_hour == 12 && $second_hour == 12) {
        $clean_time[] = "PM";
    }
    else {
        if ($second_hour == 12) {
            $clean_time[] = "AM-PM";
        } else {
            $clean_time[] = "AM";    
        }
    }
    
    return array('start' => $clean_time[0], 'end' => $clean_time[1], 'am_pm' => $clean_time[2]);
};

function process_datetime($time) {
    $split_datetime = preg_split('/\s+/', $time);
    
    $days = process_days($split_datetime[0]);
    $time = process_time(implode(array_slice($split_datetime, 1)));
    
    return array("days" => $days, "clock" => $time);
};

function process_course_data($course) {
    $courseCode = $course->find('td', 0)->plaintext;
    $type = strtoupper($course->find('td', 1)->plaintext);
    $sec = $course->find('td', 2)->plaintext;
    $time = process_datetime($course->find('td', 5)->plaintext);
    $place = $course->find('td', 6)->plaintext;
    $placeURL = $course->find('td', 6)->find('a', 0)->href;
    $max = intval($course->find('td', 8)->plaintext);
    $req = intval($course->find('td', 11)->plaintext);
    $nor = $course->find('td', 12)->plaintext;
    $rstr = $course->find('td', 13)->plaintext;
    $textbookURL = $course->find('td', 14)->find('a', 0)->href;
    $web = $course->find('td', 15)->plaintext;
    $status = $course->find('td', 16)->plaintext;

    $instructor = $course->find('td', 4)->plaintext;
    if (strstr($instructor, "\n")) {
        $instructor_split = explode("\n", $instructor);
        $instructor = [];
        foreach ($instructor_split as $item) {
            $instructor[] = $item;
        }
    } else {
        $instructor = [$course->find('td', 4)->plaintext];
    }

    $final = $course->find('td', 7)->plaintext;
    if (strpos($final, "&nbsp;")) {
        $final = null;
    }
    if (strlen($final) <= 6) {
        $final = null;
    }

    $enr = $course->find('td', 9)->plaintext;    
    if (strpos($enr, "/")) {
        $totalEnr = intval(explode(" / ", $enr)[0]);
        $localEnr = intval(explode(" / ", $enr)[1]);    
    } else {
        $localEnr = intval($enr);
        $totalEnr = intval($enr);
    }
    
    $wl = $course->find('td', 10)->plaintext;
    if (strpos($wl, "n/a")) {
        $wl = intval($wl);
    } else {
        $wl = null;
    }
    
    $units = $course->find('td', 3)->plaintext;
    if (strpos($units, "-")) {
        $split_units = explode("-", $units);
        $units = [intval($split_units[0]), intval($split_units[1])];
    } else {
        $units = [intval($units), intval($units)];
    }
    
    $courseAttributes = array(
        'courseCode' => $courseCode,
        'type' => $type,
        'sec' => $sec,
        'units' => $units,
        'instructor' => $instructor,
        'time' => $time,
        'place' => $place,
        'placeURL' => $placeURL,
        'final' => $final,
        'max' => $max,
        'localEnr' => $localEnr,
        'totalEnr' => $totalEnr,
        'wl' => $wl,
        'req' => $req,
        'rstr' => $rstr,
        'nor' => $nor,
        'textbookURL' => $textbookURL,
        'web' => $web,
        'status' => $status
    );
    
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

function process_class($class) {
    // If valign attribute is not present this is not a class
    if (!isset($class->valign)) return null;
    
    // Process course identifier and course name
    $item['identifier'] = htmlspecialchars_decode(preg_replace('!\s+!', ' ', str_replace('&nbsp;', ' ', trim(trim($class->find('td.CourseTitle text', 0)->plaintext, " &nbsp;"), " "))));
    $item['name'] = htmlspecialchars_decode($class->find('td.CourseTitle font', 0)->plaintext);
    
    // Find Co-Courses and Prerequisites links
    $item['cocourses'] = null;
    $item['prerequisites'] = null;
    foreach($class->find('a') as $link) {
        if ($link->plaintext == "Co-courses") {
            $item['cocourses'] = $link->href;
        }
        else if ($link->plaintext == "Prerequisites") {
            $item['prerequisites'] = $link->href;
        }
    }
    
    if ($class->next_sibling('tr')->bgcolor == "#fff0ff") {
        $item['comments'] = trim(preg_replace('/\t+/', '', htmlspecialchars_decode($class->next_sibling('tr')->plaintext)));
    } else {
        $item['comments'] = null;
    }
    
    // Process course rows
    $firstCourse = $class->next_sibling('tr')->next_sibling('tr[valign="top"]');
    $item['course_data'] = process_courses($firstCourse);
    return $item;
};

function process_html($html) {
    
    foreach($html->find('tr[bgcolor=#fff0ff]') as $class) {
        $class_data = process_class($class);
        if ($class_data != null) $classes[] = $class_data;
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

function build_course_url($course_code) {
    return 'http://websoc.reg.uci.edu/perl/WebSoc?YearTerm=' . $GLOBALS['term'] . '&ShowFinals=1&ShowComments=1&CourseCodes=' . urlencode($course_code);
};

function build_co_course_url($course_code, $type) {
    return 'http://websoc.reg.uci.edu/perl/WebSoc?YearTerm=' . $GLOBALS['term'] . '&ShowFinals=1&ShowComments=1&CoCourse=' . urlencode($course_code) . '&ClassType=' . urlencode($type);
};

function build_replacement_course_url($department, $course_num, $class_type) {
    return 'http://websoc.reg.uci.edu/perl/WebSoc?YearTerm=' . $GLOBALS['term'] . '&ShowFinals=1&ShowComments=1&Dept=' . urlencode($department) . '&CourseNum=' . urlencode($course_num) . '&ClassType=' . urlencode($class_type);
};

function build_department_url($department) {
    return 'http://websoc.reg.uci.edu/perl/WebSoc?YearTerm=' . $GLOBALS['term'] . '&ShowFinals=1&ShowComments=1&Dept=' . urlencode($department);
};

function build_ge_url($category) {
    return 'http://websoc.reg.uci.edu/perl/WebSoc?YearTerm=' . $GLOBALS['term'] . '&ShowFinals=1&ShowComments=1&Breadth=' . urlencode($category);
};

function get_course_html($course_code) {
    return request_html(build_course_url($course_code));
};

function get_co_course_html($course_code) {
    return request_html(build_co_course_url($course_code));
};

function get_department_html($department) {
    return request_html(build_department_url($department));
};

function get_ge_html($category) {
    return request_html(build_ge_url($category));
};

function fetch_available_departments() {
    $cached_data = get_data('available_departments');
    
    if ($cached_data) {
        return $cached_data;
    } else {
        $html = request_html('http://websoc.reg.uci.edu/perl/WebSoc');
    
        $dropdown = $html->find('select[name="Dept"]', 0);
        
        foreach($dropdown->find('option') as $department) {
            $departments[] = htmlspecialchars_decode($department->value);
        }
        
        set_data('available_departments', json_encode($departments));
        
        return json_encode($departments);
        
    }
    
    
};

function fetch_available_ge_categories() {
    $cached_data = get_data('available_categories');
    
    if ($cached_data) {
        return $cached_data;
    } else {
        $html = request_html('http://websoc.reg.uci.edu/perl/WebSoc');
    
        $dropdown = $html->find('select[name="Breadth"]', 0);
        
        foreach($dropdown->find('option') as $category) {
            
            if ($category->value != "ANY") {
                $item['name'] = $category->plaintext;
                $item['value'] = $category->value;        
                $categories[] = $item;
            }
        }
        
        set_data('available_categories', json_encode($categories));
        
        return json_encode($categories);
    }
    
    
};

function fetch_data($url) {
    $data = get_data($url);
    if (!$data) {
        $html = request_html($url);
        $data = process_html($html);
        set_data($url, $data);
    }
    return $data;
};

function fetch_course($course_code) {
    return fetch_data(build_course_url($course_code));
};

function fetch_co_courses($url) {
    return fetch_data($url);
};

function fetch_replacement_course($department, $course_num, $class_type) {
    return fetch_data(build_replacement_course_url($department, $course_num, $class_type));
};

function fetch_department($department) {
    return fetch_data(build_department_url($department));
};
    
function fetch_ge_category($category) {
    return fetch_data(build_ge_url($category));
};
    
if ($_REQUEST['course_code']) {
    echo fetch_course(trim($_REQUEST['course_code']));
}
else if ($_REQUEST['course_code_cocourses']) {
    echo fetch_co_courses(trim($_REQUEST['course_code_cocourses']), trim($_REQUEST['type']));
} 
else if ($_REQUEST['replacement_course_num']) {
    echo fetch_replacement_course($_REQUEST['department'], $_REQUEST['replacement_course_num'], $_REQUEST['type']);
} 
else if ($_REQUEST['department']) {
    echo fetch_department(trim($_REQUEST['department']));
}
else if ($_REQUEST['category']) {
    echo fetch_ge_category(trim($_REQUEST['category']));
}
else if ($_REQUEST['available_departments']) {
    echo fetch_available_departments();
}
else if ($_REQUEST['available_ge_categories']) {
    echo fetch_available_ge_categories();
}
else if ($_REQUEST['flush_cached_data']) {
    flush_cache();
}

?>