<?php
/*
ini_set('display_errors',1);
ini_set('display_startup_errors',1);
error_reporting(-1);
*/

include_once('simple_html_dom.php');
include_once('cache.php');

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
    $time = process_datetime($course->find('td', 5)->plaintext);
    $place = $course->find('td', 6)->plaintext;
    $placeURL = $course->find('td', 6)->find('a', 0)->href;
    $max = intval($course->find('td', 8)->plaintext);
    $req = $course->find('td', 11)->plaintext;
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

    $enr = $course->find('td', 9)->plaintext;    
    if (strpos($enr, "/")) {
        $totalEnr = intval(explode(" / ", $enr)[0]);
        $localEnr = intval(explode(" / ", $enr)[1]);    
    } else {
        $localEnr = $enr;
        $totalEnr = $enr;
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

function process_html($html) {
    
    foreach($html->find('tr[bgcolor=#fff0ff]') as $class) {
        
        // If valign attribute is not present this is not a class
        if (!isset($class->valign)) {
            continue;
        }
        
        // Process course identifier and course name
        $item['identifier'] = preg_replace('!\s+!', ' ', str_replace('&nbsp;', ' ', trim(trim($class->find('td.CourseTitle text', 0)->plaintext, " &nbsp;"), " ")));
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
        
        // Process course rows
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

function build_course_url($course_code) {
    return 'http://websoc.reg.uci.edu/perl/WebSoc?YearTerm=2015-14&ShowFinals=1&ShowComments=1&CourseCodes=' . urlencode($course_code);
};

function build_co_course_url($course_code) {
    return 'http://websoc.reg.uci.edu/perl/WebSoc?YearTerm=2015-14&ShowFinals=1&ShowComments=1&CoCourse=' . urlencode($course_code);
};

function build_department_url($department) {
    return 'http://websoc.reg.uci.edu/perl/WebSoc?YearTerm=2015-14&ShowFinals=1&ShowComments=1&Dept=' . urlencode($department);
};

function build_ge_url($category) {
    return 'http://websoc.reg.uci.edu/perl/WebSoc?YearTerm=2015-14&ShowFinals=1&ShowComments=1&Breadth=' . urlencode($category);
};

function get_course_html($course_code) {
    return request_html(build_course_url($course_code));
};

function get_co_course_html($course_code) {
    return request_html(build_co_course_url($course_code));
};

function get_deptartment_html($department) {
    return request_html(build_department_url($department));
};

function get_ge_html($category) {
    return request_html(build_ge_url($category));
};

function fetch_available_departments() {
    $url = 'http://websoc.reg.uci.edu/perl/WebSoc';
    
    $cached_data = get_data($url);
    
    if ($cached_data) {
        return $cached_data;
    } else {
        $html = request_html($url);
    
        $dropdown = $html->find('select[name="Dept"]', 0);
        
        foreach($dropdown->find('option') as $department) {
            $departments[] = $department->value;    
        }
        
        set_data($url, json_encode($departments));
        
        return json_encode($departments);
        
    }
    
    
};

function fetch_available_ge_categories() {
    $url = 'http://websoc.reg.uci.edu/perl/WebSoc';
    
    $cached_data = get_data($url);
    
    if ($cached_data) {
        return $cached_data;
    } else {
        $html = request_html($url);
    
        $dropdown = $html->find('select[name="Breadth"]', 0);
        
        foreach($dropdown->find('option') as $category) {
            
            if ($category->value != "ANY") {
                $item['name'] = $category->plaintext;
                $item['value'] = $category->value;        
                $categories[] = $item;
            }
        }
        
        set_data($url, json_encode($categories));
        
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

function fetch_course ($course_code) {
    return fetch_data(build_course_url($course_code));
};

function fetch_co_course($course_code) {
    return fetch_data(build_co_course_url($course_code));
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
    echo fetch_co_course(trim($_REQUEST['course_code_cocourses']));
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

?>