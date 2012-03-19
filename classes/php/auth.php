<?php
include "includes/jsonRPC/jsonRPCClient.php";
include "includes/uploadAPI/uploadAPI.php";

function session_check($clientCheck = false, $renewTimer = false){
	session_start();
	if($clientCheck){
		$uploadAPI = $_SESSION['uploadAPI'];
		if ((isset($_SESSION['uploadAPI'])) && (time() > $_SESSION['uploadExpiration'])) {
			if($newTimer){
				$auth = new Auth();
				$r = $auth->Login($_SESSION['username'], $_SESSION['agileuserpass']);
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
	//$_SESSION['creationtime'] = time();
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

class Auth
{
	private $uploadAPI;
	private $uploadURI;

	public function Login($username, $password){
		$obj = simplexml_load_file('/etc/agile/browser_config.xml');
		$uploadUriNodes = $obj->xpath('/agile/service/uploadAPI');
		$this->uploadURI = (string)$uploadUriNodes[0][0];
		$this->uploadAPI = new UploadAPI($this->uploadURI);
		$r = $this->uploadAPI->login($username, $password);
		return $r;
	}


	public function GetUploadAPI() {
		return $this->uploadAPI;
	}

	public function GetUploadURI(){
		return $this->uploadURI;
	}
}

?>
