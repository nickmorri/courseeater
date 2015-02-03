<?php
include_once('simple_html_dom.php');

$course_code = trim($_POST["course_code"]);

class Course {
    public $courseCode;
    public $type;
    public $sec;
    public $units;
    public $instructor;
    public $time;
    public $place;
    public $final;
    public $max;
    public $enr;
    public $wl;
    public $req;
    public $rstr;
    public $textbooks;
    public $web;
    public $status;
    
    function __construct($courseCode, $type, $sec, $units, $instructor, $time, $place, $final, $max, $enr, $wl, $req, $rstr, $textbooks, $web, $status) {
        this->courseCode = $courseCode;
        this->type = $type;
        this->sec = $sec;
        this->units = $units;
        this->instructor = $instructor;
        this->time = $time;
        this->place = $place;
        this->final = $final;
        this->max = $max;
        this->enr $enr;
        this->wl = $wl;
        this->req = $req;
        this->rstr = $rstr;
        this->textbooks = $textbooks;
        this->web = $web;
        this->status = $status;
    }
    
}

function scraping_websoc($courseCode) {
    // create HTML DOM
    
    $url = 'http://websoc.reg.uci.edu/perl/WebSoc?YearTerm=2015-03&ShowFinals=1&ShowComments=1&CourseCodes=' . $courseCode;

    $html = file_get_html($url);
    
    foreach($html->find('div.course-list') as $courseList) {
        foreach($courseList->find('tr[valign]') as $course) {
            
            
            foreach($course->find('td') as $courseAttribute) {
                
                $course = new Course ();
                
                echo $courseAttribute;
            }
       }
    }

    return $html;   

}

$html = scraping_websoc(36820);





?>