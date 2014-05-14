<?php 

class Course {
      private $name;
      private $ID;
      private $status;
      private $positions;

      public function __construct($name, $ID, $status, $positions) {
      	     $this->name = $name;
	     $this->ID = $ID;
	     $this->status = $status;
	     $this->positions = $positions;
}

      public function toJSON() {
      	     $arr = array(
	     	    "name" => $this->name,
		    "ID" => $this->ID,
		    "status" => $this->status,
		    "positions" => $this->positions);
	     return json_encode($arr);
		    
}
      public function tableEntry() {
             $template = '<tr><td>NAME</td><td>ID</td><td>STATUS</td><td>POSITIONS</td></tr>';
             $templatePlaceholders = array("NAME", "ID", "STATUS", "POSITIONS");
             $courseItems = array($this->name, $this->ID, $this->status, $this->positions);
             return str_replace($templatePlaceholders, $courseItems, $template);
}
}


?>