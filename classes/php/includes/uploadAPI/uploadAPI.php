<?php
session_start();
define('INVALIDLOGIN', 'Invalid login');

class UploadAPI {

	var $token;
	var $user;
	var $uri;
	var $userid;
	var $passwd;
	var $expiration;

	function UploadAPI($uri) {
		$this->uri = $uri;
		$this->client = new jsonRPCClient($uri . "/jsonrpc");
	}

	function login($userid, $passwd) {
		$this->userid = $userid;
		$this->passwd = $passwd;
		return $this->plogin();
	}

	function plogin() {

		if(isset($_SESSION['uploadToken']) && ((time() + 600) < $_SESSION['uploadExpiration'])){
			$this->token = $_SESSION['uploadToken'];
			return 0;
		}

		$r = $this->client->login($this->userid, $this->passwd);
		$this->token = $r[0];
		$_SESSION['uploadToken'] = $r[0];
		$this->user = $r[1];

		if (empty($this->user))
		return -1;
			
		$this->expiration = time() + 3600;
		$_SESSION['uploadExpiration'] = time() + 3600;
		return 0;
	}

	function logout() {
		$response = $this->client->logout($this->token);
		unset($_SESSION['uploadToken']);
		unset($_SESSION['uploadAPI']);
		return $response;

	}

	function noop($operation="pong") {
		return $this->client->noop($this->token, operation);
	}

	function listDir($path, $pageSize=100, $cookie=0, $stat=0) {

		if ($this->plogin() != 0)
		throw new Exception(INVALIDLOGIN);

		$r = $this->client->listDir($this->token, $path, $pageSize, $cookie, $stat);

		//$this->logout();
		return $r;
	}

	function listFile($path, $pageSize=100, $cookie=0, $stat=0) {

		if ($this->plogin() != 0)
		throw new Exception(INVALIDLOGIN);

		$r = $this->client->listFile($this->token, $path, $pageSize, $cookie, $stat);

		//$this->logout();
		return $r;
	}

	function stat($path) {

		if ($this->plogin() != 0)
		throw new Exception(INVALIDLOGIN);

		$r = $this->client->stat($this->token, $path);

		//$this->logout();
		return $r;
	}

	function makeDir($path) {

		if ($this->plogin() != 0)
		throw new Exception(INVALIDLOGIN);

		$r = $this->client->makeDir($this->token, $path);

		//$this->logout();
		return $r;
	}

	function makeDir2($path) {

		if ($this->plogin() != 0)
		throw new Exception(INVALIDLOGIN);

		$r = $this->client->makeDir2($this->token, $path);

		//$this->logout();
		return $r;
	}

	function deleteFile($path) {

		if ($this->plogin() != 0)
		throw new Exception(INVALIDLOGIN);

		$r = $this->client->deleteFile($this->token, $path);

		//$this->logout();
		return $r;
	}

	function deleteDir($path) {

		if ($this->plogin() != 0)
		throw new Exception(INVALIDLOGIN);

		$r = $this->client->deleteDir($this->token, $path);

		//$this->logout();
		return $r;
	}

	function deleteObject($path) {
		return $this->client->deleteObject($this->token, $path);
	}

	function rename($old, $new) {
		if ($this->plogin() != 0)
		throw new Exception(INVALIDLOGIN);

		$r = $this->client->rename($this->token, $old, $new);

		//$this->logout();
		return $r;

	}

	function copyFile($old, $new) {
			
		if ($this->plogin() != 0)
		throw new Exception(INVALIDLOGIN);

		$r = $this->client->copyFile($this->token, $old, $new);

		//$this->logout();
		return $r;

	}

	function fetchFileHTTP($path, $uri, $username=null, $password=null, $auth=null,
	$callbackid=0, $priority=0, $flags=0, $expose_egress="POLICY") {

		if ($this->plogin() != 0)
		throw new Exception(INVALIDLOGIN);

		$r = $this->client->fetchFileHTTP($this->token, $path, $uri, $username, $password, $auth,
		$callbackid, $priority, $flags, $expose_egress);

		//$this->logout();
		return $r;
	}

	function fetchFileFTP($path, $hostname, $filename, $username=null, $password=null, $port=21,
	$passive=1, $callbackid=0, $priority=0, $flags=0, $expose_egress="POLICY") {

		return $this->client->fetchFileHTTP($this->token, $path, $hostmame, $filename, $username,
		$password, $port, $passive, $callbackid, $priority, $flags, $expose_egress);
	}

	function registerCallback($uri, $flags=0, $threshold=0) {
		return $this->client->registerCallback($this->token, $uri, $flags, $threshold);
	}

	function listCallback() {
		return $this->client->listCallback($this->token);
	}

	var $responseCode;
	
	function readHeader($ch, $header){		
		if(strstr($header, 'X-Llnw-Status:')){			
			$headersplit = explode(":", $header);
			$this->responseCode = trim($headersplit[1]);
			error_log('** UPLOAD POST RESPONSE: '. trim($header).' **');
		}
		return(strlen($header));
	}

	function postFile($filepath, $filename, $directory, $mimetype) {

		if ($directory == '/'){
			$directory = '';
		}

		if ($this->plogin() != 0)
		throw new Exception(INVALIDLOGIN);
		
		$postUri = $this->uri.':8080/post/file';
		$headers = array("X-Agile-Authorization: ".(string)$this->token, "X-Content-Type: ".$mimetype);
		$fields = array(
						"uploadFile" => "@".$filepath,
						"directory" => $directory . '/',
						"basename" => $filename,
						"mtime" => (string)time()
		);
		
		error_log('** POSTING FILE: '. $filename.' **');
		
		$postUri = str_replace("https://", "http://", $postUri);
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_POST, 1);
		curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
		curl_setopt($ch, CURLOPT_HEADERFUNCTION, array(&$this,'readHeader'));
		curl_setopt($ch, CURLOPT_FORBID_REUSE, 1);
		curl_setopt($ch, CURLINFO_HEADER_OUT, 1);
		curl_setopt($ch, CURLOPT_POSTFIELDS, $fields);
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 1);
		curl_setopt($ch, CURLOPT_URL, $postUri);
		$result = curl_exec($ch);
		curl_close($ch);
				

		if($this->responseCode == 0){			
			unlink($filepath);		
		}						
		return $this->responseCode;
	}
}

/*
 $uri = "https://api.lama.lldns.net";
 $userid = "jboelens";
 $passwd = "";

 $api = new UploadAPI($uri);
 if (!$api->login($userid, $passwd)) {
 echo "Invalid Login";
 exit(0);
 }

 echo "Login Success\n";
 print $api->token . "\n";

 print_r($api->postFile("foo2.txt", "/", "foo2.txt"));

 print_r($api->listDir("/"));
 print_r($api->listFile("/"));
 */
?>
