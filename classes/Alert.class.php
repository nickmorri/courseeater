<?php

include_once "Course.class.php";

class Alert {
      public $subject;
      public $to;
      public $courses;
      public $message;
      public $headers;

      public function __construct($to, $courses) {
      	     $this->subject = "Class(es) available";
	     $this->to = $to;
	     $this->courses = $courses;
	     $this->headers  = 'MIME-Version: 1.0' . "\r\n";
	     $this->headers .= 'Content-type: text/html; charset=utf-8' . "\r\n";
	     $this->buildMessage();
}
     public function buildMessage() {
     	    $message = '
	    <html>
	    <head>
  	    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  	    <title>$subject</title>
	    </head>
	    <body>
  	    <p>The following classes are now available!</p>
  	    <table>
    	    <tr>
      	    <th>Course</th><th>ID</th><th>Status</th><th>Positions</th>
    	    </tr>
    	    COURSES
  	    </table>
	    <br>
	    <p>Registration link provided below:</p>
	    <a href="http://www.reg.uci.edu/registrar/soc/webreg.html">WebREG</a>
	    </body>
	    </html>
	    ';
	    $coursestring = $this->courses->tableEntry();

	    $placeholder = "COURSES";
	    $this->message = str_replace($placeholder, $coursestring, $message);
}
      public function send() {
      	     return mail($this->to, $this->subject, $this->message, $this->headers);
}
}

?>