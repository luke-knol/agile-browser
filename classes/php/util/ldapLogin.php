<?php
include "../lamaApi.php";
ini_set('session.gc_maxlifetime', 900);
session_start();


$pass = isset($_REQUEST['password']) ? $_REQUEST['password'] : null;
$pass = stripcslashes($pass);
$username = isset($_REQUEST['handle']) ? $_REQUEST['handle'] : null;
$username = strtolower($username);
$lama_api = new LAMA_API();
$r = $lama_api->Login($username, $pass);
if ($r == 0) {
	echo "{success: true, data: 'Credentials Accepted'}";
} else{
	echo "{success: false, data: 'Credentials Incorrect!'}";
}

?>