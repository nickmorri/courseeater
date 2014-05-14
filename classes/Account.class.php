<?php

/**
 * Account management
 * handles the user account management
 */
 
class Account
{
    /**
     * @var object $db_connection The database connection
     */
    private $db_connection = null;
    /**
     * @var array $errors Collection of error messages
     */
    public $errors = array();
    /**
     * @var array $messages Collection of success / neutral messages
     */
    public $messages = array();

    /**
     * the function "__construct()" automatically starts whenever an object of this class is created,
     * you know, when you do "$registration = new Registration();"
     */
    public function __construct()
    {
    	session_start();
    	include_once '../config/db.php';
        if (isset($_POST["update_email"])) {
            $this->updateEmail();
        }
        elseif (isset($_POST["update_password"])) {
	        $this->updatePassowrd();
        }
        elseif (isset($_POST["delete_account"])) {
	        $this->deleteAccount();
        }
        else {
	        $this->errors[] = "Invalid command.";
        }
    }
    
    private function updateEmail()
    {
	    $connection = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

		if ($mysqli->connect_error) {
			die('Connect Error (' . $mysqli->connect_errno . ') '. $mysqli->connect_error);
		}
		
		$sql_data = $connection->prepare("UPDATE users SET user_email=? WHERE user_email=?");
		$sql_data->bind_param('ss', $_POST['new_email'], $_SESSION['user_email']);
		$sql_data->execute();
		$_SESSION['user_email'] = $_POST['new_email'];
		$sql_data->close();
		$connection->close();
		$this->messages[] = "Email updated successfully."
    }
    
    private function updatePassword()
    {
	   $connection = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

		if ($mysqli->connect_error) {
			die('Connect Error (' . $mysqli->connect_errno . ') '. $mysqli->connect_error);
		}
		$sql_data = $connection->prepare("SELECT user_password_hash FROM users WHERE user_name=?");
		$sql_data->bind_param("s", $_SESSION['user_name']);
		$sql_data->bind_result($previous_password_hash);
		$sql_data->execute();
		$sql_data->fetch();
		$sql_data->close();

		if ($_POST['inputNewPassword'] == $_POST['inputVerifyPassword']) {
			$current_password = $_POST["inputCurrentPassword"];
		}
		else {
			$this->errors[] = "New password does not match verification password.";
		}

		if (password_verify($current_password, $previous_password_hash)) {
			$new_password_hash = password_hash($_POST['inputNewPassword'], PASSWORD_DEFAULT);
			$sql_data = $connection->prepare("UPDATE users SET user_password_hash=? WHERE user_name=?");
			$sql_data->bind_param("ss", $new_password_hash, $_SESSION['user_name']);
			$sql_data->execute();
			$this->messages[] = "Password updated successfully.";
		}
		else {
			$this->errors[] = "Incorrect password entered. Please try again.";
		}

		$sql_data->close();
		$connection->close();
 
    }
    
    