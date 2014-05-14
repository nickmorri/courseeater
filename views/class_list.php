<?php
session_start();

$url = "http://salty-coast-5895.herokuapp.com/api/getcourse/";

include_once '../config/db.php';

$connection = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

if (mysqli_connect_errno()) {
   echo "Failed to connect to MySQL: " . mysqli_connect_error();
}
else {
	$sql_data = $connection->prepare("SELECT * FROM coursereg WHERE user_name=?");
	$sql_data->bind_param('s', $_SESSION['user_name']);
	$sql_data->bind_result($result_name, $result_course_id);
	$sql_data->execute();
	$course_data = array();
	while ($sql_data->fetch()) {
		$course_data[] = $result_course_id;
	}
	if (empty($course_data)) {
		return;
	}
}
?>
<html>
<body>

<div id="enrolled_courses">
	<div class="jumbotron">
		<h3>Registered Courses</h3>
		<table id="course_table" class="table table-bordered table-hover">
			<tr>
				<th>ID</th>
				<th>Space <span id="space_info" class="glyphicon glyphicon-question-sign"/></th>
				<th>Status</th>
				<th>Track</th>
				</tr>
				
				<div id="help_modal" class="modal fade bs-example-modal-sm" tabindex="-1" role="dialog" aria-labelledby="mySmallModalLabel" aria hidden="true">
					<div class="modal-dialog modal-sm">
						<div class="modal-content">
							<div class="modal-header">						
								<button type="button" class="btn btn-default pull-right" data-dismiss="modal">Close</button>
								<h4 class="modal-title">Space info</h4>
							</div>
						<div class="modal-body">
							<ul class="list-group">
								<li class="list-group-item list-group-item-success">For open courses this shows the remaining spots</li>
								<li class="list-group-item list-group-item-warning">For waitlisted courses shows number of those on the waitlist</li>
							</ul>
						</div>
					</div>
				</div>
					
			<?php
				foreach ($course_data as $course_id) {
					$info = json_decode(file_get_contents($url . $course_id));
					if ($info->wl > 0) {
						$course_row_class = "info";
						$course_status = "Wait";
						$spots = $info->wl;
					}
					elseif ($info->enr < $info->max) {
						$course_row_class = "success";
						$course_status = "Open";
						$spots = $info->max - $info->enr;
					}
					elseif ($info->status == "FULL") {
						$course_row_class = "danger";
						$course_status = "Full";
						$spots = 0;
					}
					else {
						$course_row_class = "warning";
						$course_status = "Error";
						$spots = 0;
					}
					echo "<tr class=" . $course_row_class . " id=c" . $course_id . ">" . "<td>" . $course_id . "</td>"; 
					echo "<td>" . $spots . "</td>";
					echo "<td>" . $course_status . "</td>";
					echo "<td><button type='button' class='btn btn-primary btn-xs remove-btn'><span class='glyphicon glyphicon-minus'></span> Remove</button></td>";
					echo "</tr>";
					}
				$sql_data->close();
				$connection->close();
			?>
		</table>
	</div>
</div>

</body>
</html>