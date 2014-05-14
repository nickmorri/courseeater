<?php

include_once 'Course.class.php';
include_once 'Alert.class.php';

class Scrape {
      private $email;
      private $courseID;

      public function __construct($email, $courseID) {
      	     $this->email = $email;
	     $this->courseID = $courseID;
}
     public function check() {
     	    $templateprefix="Submit=Display+Text+Results&YearTerm=2014-14&ShowComments=&ShowFinals=&Breadth=ANY&Dept=&CourseNum=&Division=ANY&CourseCodes=";
	    $templatesuffix="&InstrName=&CourseTitle=&ClassType=&Units=&Days=&StartTime=&EndTime=&MaxCap=&FullCourses=ANY&FontSize=100&CancelledCourses=Exclude&Bldg=&Room=";
	    $opts=$templateprefix . $this->courseID . $templatesuffix;
	    $baseurl="http://websoc.reg.uci.edu/perl/WebSoc/perl/WebSoc";
	    $url = $baseurl . $opts;

	    $ch = curl_init();

	    curl_setopt($ch, CURLOPT_URL, $baseurl);
	    curl_setopt($ch, CURLOPT_POST, 22);
	    curl_setopt($ch, CURLOPT_POSTFIELDS, $opts);
	    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

	    $result = curl_exec($ch);

	    $target = _________________________________________________________________;
	    $startpos = strpos($result, $target);
	    $startpos = strpos($result, $target, $startpos + strlen($startpos));

	    $waitpos = strpos($result, "Waitl");
	    $openpos = strpos($result, "OPEN");
	    $fullpos = strpos($result, "FULL");

	    if ($waitpos !== false) {
   	       $endpos = $waitpos;
   	       $status = "WAIT";
	    }

	   elseif ($fullpos !== false) {
   	       $endpos = $fullpos;
   	       $status = "FULL";
	   }

	   elseif ($openpos !== false) {
   	       $endpos = $openpos;
   	       $status = "OPEN";
	   }

	   else {
   	       $status = "ERRO";
	   }
	   $result = substr($result, $startpos + strlen($target), $endpos - ($startpos + strlen($target)));
	   $data = trim($result);
	   $coursename = explode("CCode", $data)[0];
	   $coursename = trim($coursename);

	   if ($status == "WAIT") {
	         $arr_data = explode(" ", $data);
		 $positions = $arr_data[count($arr_data) - 7];
	   }
	   else {
	      $position = "N/A";
	   }

	   $defaultCourse = new Course($coursename, $this->courseID, $status, $positions);
	   $defaultAlert = new Alert($this->email, $defaultCourse);
	   curl_close($ch);
	   return $defaultAlert;
}

}

?>      