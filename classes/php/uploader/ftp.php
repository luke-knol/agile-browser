<?php

$file = $_REQUEST['file'];
$path = $_REQUEST['path'];
$resource = ftp_connect('swarm-proto-2.phx2.llnw.net');
$loggedin = ftp_login($resource, 'lp-llnw', '4TqNPgQ2Qdc8wi');
if($loggedin){
	print_r($path);	
	$success = ftp_put ($resource, $path.$file, '/tmp/uploads/'.$file, FTP_BINARY);
	$response = null;
	if($success){
		$response = array(
		"success" => true,
		"data" => "File uploaded"
		);
	}
	else{
		$response = array(
		"success" => false,
		"data" => "Error uploading directory"
		);
	}
	echo json_encode($response);
	ftp_close($resource);

}

?>