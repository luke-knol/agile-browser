<?php
require_once('util/getid3/getid3.php');
class FileSystem{

	private $uploadAPI;

	function __construct(){

		$lama_api = new LAMA_API();
		$this->uploadAPI = LAMA_API::$uploadAPI;
	}

	//private methods
	private function decodeDeleteObjectCode($error_code){
		if($error_code == -1){
			return 'Object not found';
		}
		else if($error_code == -6){
			return 'Permission denied';
		}
		else if($error_code == -5){
			return 'Internal error';
		}
		else{
			return 'Error deleting object';
		}
	}


	//public Methods
	public function CreateDirectory($gid, $name, $path){
		try{
			$path = $path . '/' . $name;
			$result = $this->uploadAPI->makeDir($path, $limit, $cookie, 1);
			$attempt = 0;
			$allowedAttempts = 9;
			if ($result == 0) {
				$response = array(
						"success" => true,
						"data" => "Directory created"
				);
				return $response;
			}

			switch($result) {
				case -1:
					throw new Exception('malformed path');
				case -2:
					throw new Exception('directory not empty');
				case -3:
					throw new Exception('parent does not exist');
				case -4:
					throw new Exception('unknown error code');
				case -5:
					throw new Exception('internal error');
				case -6:
					throw new Exception('permission denied');
			}
		}
		catch(Exception $e){
			$response = array(
					"success" => false,
					"data" => "Error creating directory: ".$e->getMessage()
			);
			return $response;
		}
	}


	public function ListDirectories($path, $dirID, $limit=50, $cookie=null){
		try{
			if ($cookie == null) $cookie = 0;
			$result = $this->uploadAPI->listDir($path, $limit, $cookie, 1);

			$directories = $result['list'];

			$moddedDirectories = array();

			$cookie = $result['cookie'];
			$code = $result['code'];

			if ($code != 0)
				return $moddedDirectories;

			foreach($directories as $directory){
				$moddedDirectory = array();
				//$moddedDirectory['name'] = $directory['name'];
				$directoryName = mb_check_encoding($directory['name'], 'UTF-8') ? mb_convert_encoding($directory['name'], 'auto', 'UTF-8') : $directory['name'];
				$moddedDirectory['name'] = $directoryName;
				//$moddedDirectory['text'] = $directory['name'];
				$moddedDirectory['text'] = $directoryName;
				$moddedDirectory['code'] = $directory['code'];

				$stat = $directory['stat'];
				$moddedDirectory['ctime'] = gmdate("M d Y H:i:s", $stat['ctime']);
				$moddedDirectory['mtime'] = gmdate("M d Y H:i:s", $stat['mtime']);
				$moddedDirectory['uid'] = $stat['uid'];
				$moddedDirectory['gid'] = $stat['gid'];
				$moddedDirectory['size'] = $stat['size'];

				$moddedDirectory['leaf'] = false;
				$moddedDirectory['iconCls'] = 'folder-icon';
				$moddedDirectory['draggable'] = 'false';
				$moddedDirectory['object'] = 'directory';
				$moddedDirectory['directoryCookie'] = $cookie;
				array_push($moddedDirectories, $moddedDirectory);
			}
			usort($moddedDirectories, "Sorter");
			return $moddedDirectories;
			//return array('cookie'=>$cookie, 'directories'=>$moddedDirectories);
		}
		catch(Exception $e){
			$errorDirectory = array();
			$errorDirectory['text'] = 'Error listing directories';
			$errorDirectory['leaf'] = true;
			$errorDirectory['errorMessage'] = $e->getMessage();
			$errorDirectory['iconCls'] = 'delete-icon';
			$errorDirectory['object'] = 'error';
			$response = array(
					"cookie" => false,
					"directories" => array($errorDirectory)
			);
			return $response;
		}
	}

	public function DeleteDirectory($path){

		if ($recursive)
			return $this->deleteObject($path, 1);

		try {
			$result = $this->uploadAPI->deleteDir($path);
			$response;
			if ($result == 0) {
				$response = array(
						"success" => true,
						"data" => "Directory deleted"
				);
				return $response;
			}
			else{
				$msg = 'Directory must be empty';
				switch($result) {
					case -1:
						$msg = 'Directory does not exist';
						break;
					case -2:
						$msg = 'Directory must be empty';
						break;
				}
				$response = array(
						"success" => false,
						"data" => "Error deleting directory: ".$msg
				);
				return $response;

			}

		}
		catch(Exception $e){
			$response = array(
					"success" => false,
					"data" => "Error deleting directory: ".$e->getMessage()
			);
			return $response;
		}
	}

	public function DeleteObject($path) {
		try {

			$result = $this->uploadAPI->deleteObject($path);

			if ($result == 0) {
				$response = array(
						"success" => true,
						"data" => "Object deleted"
				);
				return $response;
			}

			switch($result) {
				case -1:
					throw new Exception('path not found');
				case -2:
					throw new Exception('path not empty (and recursion not specified)');
			}
		}
		catch(Exception $e){
			$response = array(
					"success" => false,
					"data" => "Error deleting object: ".$e->getMessage()
			);
			return $response;
		}
	}


	public function GetMapperUrl($path){
		$path = $_SESSION['pathprefix'].$path;
		$path = str_replace("%2F", "/", rawurlencode($path));
		$path = 'http://global.mt.lldns.net'.$path;
		$response = array(
				"success" => true,
				"data" => array("mapperUrl" => $path)
		);
		return $response;
	}

	public function GetShareUrls($path, $fileName){
		$path = $_SESSION['pathprefix'].$path;
		$path = str_replace("%2F", "/", rawurlencode($path));
		$mapperUrl = 'http://global.mt.lldns.net'.$path;
		$shareUrls = array();
		$shareUrls['mapperUrl'] = $mapperUrl;
		try{
			$shareUrls['tinyUrl'] = $this->get_tiny_url($mapperUrl);
			$response = array(
					"success" => true,
					"data" => $shareUrls
			);
			return $response;
		}
		catch(Exception $e){
			$response = array(
					"success" => false,
					"data" => $e->getMessage()
			);
			return $response;
		}

	}


	private function get_tiny_url($url)  {
		$ch = curl_init();
		$timeout = 5;
		curl_setopt($ch,CURLOPT_URL,'http://tinyurl.com/api-create.php?url='.$url);
		curl_setopt($ch,CURLOPT_RETURNTRANSFER,1);
		curl_setopt($ch,CURLOPT_CONNECTTIMEOUT,$timeout);
		$data = curl_exec($ch);
		curl_close($ch);
		return $data;
	}

	public function MakePlaylist($path, $files){

		$ext = array('mp3', 'ogg');


		/**
		 * Read the filelist and build urls

		 foreach(new DirectoryIterator($dir) as $item) {
		 if($item->isFile() && in_array(strtolower(substr($item, -3)), $ext)) {
		 $files[] = "$url/$item";
		 }
		 }
		 */

		$mime_type = 'audio/x-mpequrl';
		$encodedFiles = array();
		foreach($files as $file){
			if(in_array(strtolower(substr($file, -3)), $ext)){
				array_push($encodedFiles, $file);
			}
		}

		$encodedFiles = array_reverse($encodedFiles);

		$m3u = "#EXTM3U\n";
		$savePath = $_SESSION['envPrefix'].'uploads/'.$_SESSION['lamafsuser'].$path.'/';
		$handle = fopen($savePath."playlist.m3u", 'w');
		$playlist = join("\n", $encodedFiles);
		fwrite($handle, $playlist);
		$u_path = $path."/playlist.m3u";
		$u_uri = dirname(__FILE__) .'/../../../uploads/'.$_SESSION['lamafsuser'].$path."/playlist.m3u";

		$result = $this->uploadAPI->postFile($u_uri, 'playlist.m3u', $path);

		$response = array(
				"success" => false,
				"data" => -1
		);
		if($result == 0){
			unlink($u_uri);
			$response = array(
					"success" => true,
					"data" => 0
			);
		}
		return $response;
	}

	public function ListFiles($path, $dirID, $limit=1000, $cookie=null){
		try{
			if ($cookie == null) $cookie = 0;
			$result = $this->uploadAPI->listFile($path, $limit, $cookie, 1);
			$files = $result['list'];

			$moddedFiles = array();


			$cookie = $result['cookie'];
			$code = $result['code'];

			if ($code != 0) return $moddedFiles;

			foreach($files as $file){
				$moddedFile = array();
				$moddedFile['name'] = mb_check_encoding($file['name'], 'UTF-8') ? mb_convert_encoding($file['name'], 'auto', 'UTF-8') : $file['name'];
				$filePath = '';
				if($path == '/'){
					$path = '';
				}

				$filePath = $_SESSION['pathprefix'].$path.'/'.$file['name'];
				$filePath = mb_check_encoding($filePath, 'UTF-8') ? mb_convert_encoding($filePath, 'auto', 'UTF-8') : $filePath;
				$filePath = str_replace("%2F", "/", rawurlencode($filePath));
				$moddedFile['mapperUrl'] = 'http://global.mt.lldns.net'.$filePath;
				$moddedFile['text'] = $file['name'];
				//$moddedFile['code'] = $file['code'];

				$stat = $file['stat'];
				$moddedFile['ctime'] = gmdate("M d Y H:i:s", $stat['ctime']);
				$moddedFile['mtime'] = gmdate("M d Y H:i:s", $stat['mtime']);
				$moddedFile['uid'] = $stat['uid'];
				$moddedFile['gid'] = $stat['gid'];
				$moddedFile['size'] = $stat['size'];

				$moddedFile['leaf'] = true;
				$moddedFile['iconCls'] = 'file-icon';
				$moddedFile['object'] = 'file';
				$moddedFile['fileCookie'] = $cookie;
				array_push($moddedFiles, $moddedFile);
			}

			usort($moddedFiles, 'Sorter');
			return $moddedFiles;
			//			return array('cookie'=>$cookie, 'files'=>$moddedFiles);
		}
		catch(Exception $e){
			$errorFile = array();
			$errorFile['text'] = 'Error listing files';
			$errorFile['leaf'] = true;
			$errorFile['errorMessage'] = $e->getMessage();
			$errorFile['iconCls'] = 'delete-icon';
			$errorFile['object'] = 'error';
			$response = array(
					"cookie" => false,
					"files" => array($errorFile)
			);
			return $response;
		}
	}

	public function DeleteFile($path){
		try {

			$result = $this->uploadAPI->deleteFile($path);

			if ($result == 0) {
				$response = array(
						"success" => true,
						"data" => "File deleted"
				);
				return $response;
			}

			switch($result) {
				case -1:
					throw new Exception('no such file');
			}
		}
		catch(Exception $e){
			$response = array(
					"success" => false,
					"data" => "Error deleting file: ".$e->getMessage()
			);
			return $response;
		}
	}

	public function MoveFile($path){
		try {
			$result = $this->uploadAPI->rename($path[0], $path[1]);

			if ($result == 0) {
				$response = array(
						"success" => true,
						"data" => "File moved"
				);
				return $response;
			}

			switch($result) {
				case -1:
					throw new Exception('no such file');
			}
			$response = array(
					"success" => false,
					"data" => "Error moving file: ".$result
			);
			return $response;

		}
		catch(Exception $e){
			$response = array(
					"success" => false,
					"data" => "Error moving file: ".$e->getMessage()
			);
			return $response;
		}
	}

	public function PasteFile($oldPath, $newPath, $fileName, $mode){
		try {
			if($oldPath == '/'){
				$oldPath = '';
			}
			if($newPath == '/'){
				$newPath = '';
			}
			$oldPath = $oldPath.'/'.$fileName;
			$newPath = $newPath.'/'.$fileName;
			if($mode == 'cut'){
				$result = $this->uploadAPI->rename($oldPath, $newPath);
			}
			else{
				$result = $this->uploadAPI->copyFile($oldPath, $newPath);
			}


			if ($result == 0) {
				$response = array(
						"success" => true,
						"data" => "File ".$mode
				);
				return $response;
			}

			switch($result) {
				case -1:
					throw new Exception('no such file');
			}

			$response = array(
					"success" => false,
					"data" => "Error code: ".$result
			);
			return $response;
		}
		catch(Exception $e){
			$response = array(
					"success" => false,
					"data" => "Error: ".$e->getMessage()
			);
			return $response;
		}
	}

	public function RenameFile($path, $oldName, $newName){
		try {
			if($path == '/'){
				$path = '';
			}

			$oldPath = $path.'/'.$oldName;
			$newPath = $path.'/'.$newName;

			$result = $this->uploadAPI->rename($oldPath, $newPath);



			if ($result == 0) {
				$response = array(
						"success" => true,
						"data" => "File renamed"
				);
				return $response;
			}

			switch($result) {
				case -1:
					throw new Exception('no such file');
			}

			$response = array(
					"success" => false,
					"data" => "Error code: ".$result
			);
			return $response;
		}
		catch(Exception $e){
			$response = array(
					"success" => false,
					"data" => "Error renaming file: ".$e->getMessage()
			);
			return $response;
		}
	}

	public function MakeZip($path=null, $fileList=null, $fileName, $password=null, $type='zip'){
		try {
			if(!is_null($path)){
				$escape = "'".'"'."'".'"'."'";
				$password = str_replace("'", $escape, $password);
				$zipDir = $_SESSION['envPrefix'].'uploads/' . $_SESSION['lamafsuser'] . $path . $fileName;
				$zippedFileDir = $_SESSION['envPrefix'].'uploads/' . $_SESSION['lamafsuser'] . $path;
				$zipName;				
				if($type == '7z'){
					$zipName = $zipDir.'.7z';
					$command = escapeshellcmd('7z a -mx0 -mhe -y -p'.$password.' '.$zipName.' '.$zipDir);
					if(file_exists($zipName)){
						unlink($zipName);
					}
				}
				elseif($type == 'zip'){
					if(!is_null($password) && $password != ''){
						$command = escapeshellcmd('zip -j -q -P '.$password.' '.$zipDir.' '.$zipDir);
					}
					else{
						$command = escapeshellcmd('zip -j -q -0 '.$zipDir.' '.$zipDir);
					}

				}
				if($type == 'zip'){
					$resp = system($command.'/*');
				}
				else{
					$resp = exec($command.'/*');
				}
				$this->rrmdir($zipDir);
				$destPath = $_SESSION['filePath'];
				if($destPath == '/'){
					$destPath = '';
				}
				if($type == '7z'){
					$fileName = $fileName.'.7z';
				}
				else{
					$fileName = $fileName.'.zip';
				}
				$u_path = $destPath.'/'.$fileName;
				$u_uri = $zippedFileDir.$fileName;				
				
				$response = $this->uploadAPI->postFile($u_uri, $fileName, $destPath, 'application/zip');

				$_SESSION['filePath'] = '';
				if($response == 0){
					$response = array(
							"success" => true,
							"data" => $u_path
					);
				}
				else{
					$response = array(
							"success" => false,
							"data" => $u_path
					);
				}

				return $response;
			}

		}
		catch(Exception $e){
			$response = array(
					"success" => false,
					"data" => "Error moving file: ".$e->getMessage()
			);
			return $response;
		}
	}


	private function rrmdir($dir){
		if (is_dir($dir)) {
			$objects = scandir($dir);
			foreach ($objects as $object) {
				if ($object != "." && $object != "..") {
					if (filetype($dir."/".$object) == "dir") $this->rrmdir($dir."/".$object); else unlink($dir."/".$object);
				}
			}
			reset($objects);
			rmdir($dir);
		}
	}



	public function Rename($oldpath, $newpath) {
		try {

			$result = $this->uploadAPI->rename($oldpath, $newpath);

			if ($result == 0) {
				$response = array(
						"success" => true,
						"data" => "Sucessfully renamed"
				);
				return $response;
			}

			switch($result) {
				case -1:
					throw new Exception('old path not found');
				case -2:
					throw new Exception('new path already exists');
				case -3:
					throw new Exception('new path parent directory does not exist');
				case -4:
					throw new Exception('permission denied');
				case -5:
					throw new Exception('operation not supported');
			}
		}
		catch(Exception $e){
			$response = array(
					"success" => false,
					"data" => "Error renaming: ".$e->getMessage()
			);
			return $response;
		}
	}

	public function CopyFile($path, $newpath) {
		try {

			$result = $this->uploadAPI->copyFile($path, $newpath);

			if ($result == 0) {
				$response = array(
						"success" => true,
						"data" => "File copied"
				);
				return $response;
			}

			switch($result) {
				case -1:
					throw new Exception('source does not exist or is not a file');
				case -2:
					throw new Exception('destination directory does not exist');
				case -3:
					throw new Exception('invalid operation');
				case -4:
					throw new Exception('object lookup failure (No such mapper');
				case -5:
					throw new Exception('fetch file failure');
			}
		}
		catch(Exception $e){
			$response = array(
					"success" => false,
					"data" => "Error renaming: ".$e->getMessage()
			);
			return $response;
		}
	}
}

function Sorter($a, $b) {
	return strtolower($a['name']) > strtolower($b['name']);
}

?>
