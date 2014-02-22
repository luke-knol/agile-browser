<?php
require('auth.php');
function session_check($clientCheck = false, $renewTimer = false){
	
	if (!isset ($_SESSION)) session_start();
	if($clientCheck){
		$uploadAPI = $_SESSION['uploadAPI'];
		if ((isset($_SESSION['uploadAPI'])) && (time() > $_SESSION['uploadExpiration'])) {
			if($renewTimer){
				$auth = new Auth();
				$r = $auth->Login($_SESSION['lamafsuser'], $_SESSION['agileuserpass']);
				if ($r == 0) {
					echo "{success: true, data: 'session ok'}";
				}
				else{
					echo "{success: false, data: 'session timed out'}";	
				}
			}
			else{
				echo "{success: false, data: 'session timed out'}";
			}
				
		}
		elseif (!isset($_SESSION['uploadAPI'])) {
			echo "{success: false, data: 'session timed out'}";
		} else {
			echo "{success: true, data: 'session ok'}";
		}
	}
}

function renew_timer(){
	$_SESSION['creationtime'] = time();
}

function logout(){
	session_start();
	session_destroy();
	echo "{success: true, data: 'logged out'}";
}

if(isset($_REQUEST['clientRequest'])){
	session_check(true);
}

if(isset($_REQUEST['logout'])){
	logout();
}

class LAMA_API
{
	//undefined
	public static $token;

	//public static $lama;
	public static $lamaUser;
	public static $uploadAPI;

	function __construct(){
		//DO NOT REMOVE THIS - this makes sure the user is legit!
		if (!isset ($_SESSION)) session_start();
		if (isset($_SESSION['lamafsuser'])){
			$lamaUser = $_SESSION['lamafsuser'];
			if(!isset($_SESSION['uploadAPI'])){
				$this->login($_SESSION['lamafsuser'], $_SESSION['agileuserpass']);
			}
			else{
				self::$lamaUser = $_SESSION['lamafsuser'];
				self::$uploadAPI = $_SESSION['uploadAPI'];
			}
		}
	}

	function login($user, $pass){
		$auth = new Auth();
		$r = $auth->Login($user, $pass);
		if ($r == 0){
			$_SESSION['lamafsuser'] = $user;
			$_SESSION['uploadAPI'] = $auth->GetUploadAPI();
			$_SESSION['uploadUri'] = $auth->GetUploadURI();			
			$_SESSION['username'] = $username;			
			$_SESSION['agileuserpass'] = $password;			
			self::$lamaUser = $_SESSION['lamafsuser'];
			self::$uploadAPI = $_SESSION['uploadAPI'];						
		}
		return $r;
	}
}
?>
