<?php
require('auth.php');

class LAMA_API
{
	public static $uploadAPI;

	function __construct(){
		self::$uploadAPI = $_SESSION['uploadAPI'];
	}

	function login($username, $password){
		$auth = new Auth();
		$r = $auth->Login($username, $password);
		self::$uploadAPI = $auth->GetUploadAPI();
		$_SESSION['uploadUri'] = $auth->GetUploadURI();
		$_SESSION['uploadAPI'] = self::$uploadAPI;
		$_SESSION['username'] = $username;
		$_SESSION['agileuserpass'] = $password;
		return $r;
	}
}
?>
