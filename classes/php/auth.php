<?php
include "includes/jsonRPC/jsonRPCClient.php";
include "includes/uploadAPI/uploadAPI.php";


class Auth
{
	private $uploadAPI;
	private $pathPrefix;
	private $uploadURI;

	public function Login($user, $pass){
		$obj = simplexml_load_file('/etc/agile/browser_config.xml');
		$uploadUriNodes = $obj->xpath('/agile/service/uploadAPI');
		$pathPrefixNode = $obj->xpath('/agile/service/pathPrefix');
		$envPrefixNode = $obj->xpath('/agile/service/envPrefix');
		$this->uploadURI = (string)$uploadUriNodes[0][0];
		$this->pathPrefix = (string)$pathPrefixNode[0][0];
		$_SESSION['envPrefix'] = (string)$envPrefixNode[0][0];
		if(strpos($this->pathPrefix,'%username') >= 0){
			$this->pathPrefix = str_replace('%username', $user, $this->pathPrefix);
		}
		if(substr($this->pathPrefix, -1) == '/'){
			$this->pathPrefix = rtrim($this->pathPrefix, '/');
		}
		$this->uploadAPI = new UploadAPI($this->uploadURI);
		$r = $this->uploadAPI->login($user, $pass);
		return $r;
	}

	public function GetUploadAPI(){
		return $this->uploadAPI;
	}

	public function GetPathPrefix(){
		return $this->pathPrefix;
	}

	public function GetUploadURI(){
		return $this->uploadURI;
	}
}

?>
