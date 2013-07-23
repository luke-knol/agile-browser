<?php
include_once('lamaApi.php');
include_once('util/formatting_helper.php');
include_once('util/time_helper.php');
include_once('util/array_utils.php');
include_once('controller/filesystem.class.php');
include_once('controller/email.class.php');

$action = null;
$opt - null;
$reqObject = null;
$custID = null;

if(isset($_REQUEST['id'])){
	$custID = $_REQUEST['id'];
}

if(isset($_REQUEST['action'])){
	$action = $_REQUEST['action'];
}

if(isset($_REQUEST['opt'])){
	$opt = $_REQUEST['opt'];
}

if(isset($_REQUEST['object'])){
	$reqObject = $_REQUEST['object'];
}

if (!is_null($action) && !is_null($reqObject)){
	$dash = new ReqHandler($opt);
	$dash->$reqObject($action);
}

class ReqHandler{
	
	private $opt;

	function __construct($opt = null){
		session_check();		
		$this->opt = $opt;
	}



	function filesystem($action){
		renew_timer();
		$allowedActions = array(
			'directory',			
			'createDirectory',			 
		    'deleteDirectory',
			'shareUrls',
		    'mapper',
			'deleteFile',
			'deleteFiles',
			'moveFiles',
			'paste',
			'rename', 
			'file',
			'makeZip',			
			'playlist',						
			'listDirectories',
			'listFiles');		
		if(!in_array($action, $allowedActions)){
			$response = array(
					"success" => false,
					"data" => "Method: ".$action." not supported"
					);
					echo json_encode($response);
					return;
		}
		$fs = new FileSystem();
		switch($action){
			case 'directory':
				$path = $_REQUEST['path'];
				$path = urlencode($path);
				$dir = $fs->GetDirectory($path);
				echo json_encode($dir);
				break;
			case 'createDirectory':
				$name = $_REQUEST['dirName'];
				$path = $_REQUEST['path'];
				$gid = (int)$_REQUEST['gid'];				
				$response = $fs->CreateDirectory($gid, $name, $path);
				echo json_encode($response);
				break;
			case 'deleteDirectory':
				$path =	isset($_REQUEST['path']) ? $_REQUEST['path'] : null;
				$response = $fs->DeleteDirectory($path);
				echo json_encode($response);
				break;
			case 'deleteFile':
				$path =	isset($_REQUEST['path']) ? $_REQUEST['path'] : null;
				$response = $fs->DeleteFile($path);
				echo json_encode($response);
				break;			
			case 'deleteFiles':
				$files =	isset($_REQUEST['files']) ? $_REQUEST['files'] : null;
				$files = stripslashes($files);
				$files = json_decode($files);
				$response = array();
				foreach($files as $file){
					$response = $fs->DeleteFile($file);
					if($response['success'] == false){
						break;
					}
				}
				echo json_encode($response);
				break;
			case 'moveFiles':
				$files =	isset($_REQUEST['files']) ? $_REQUEST['files'] : null;
				$files = stripslashes($files);
				$files = json_decode($files);
				$response = array();
				foreach($files as $file){
					$response = $fs->MoveFile($file);
					if($response['success'] == false){
						break;
					}
				}
				echo json_encode($response);
				break;
			case 'paste':
				$files = isset($_REQUEST['files']) ? $_REQUEST['files'] : null;
				$files = stripslashes($files);
				$files = json_decode($files);				
				$oldPath = $_REQUEST['oldPath'];
				$newPath = $_REQUEST['newPath'];
				$mode = $_REQUEST['mode'];
				$response = array();
				foreach($files as $file){					
					$response = $fs->PasteFile($oldPath, $newPath, $file, $mode);
					if($response['success'] == false){
						break;
					}
				}
				echo json_encode($response);
				break;
			case 'rename':
				$path = $_REQUEST['path'];
				$oldName = $_REQUEST['oldName'];
				$newName = $_REQUEST['newName'];
				$response = $fs->RenameFile($path, $oldName, $newName);
				echo json_encode($response);
				break;
			case 'makeZip':
				$fileName = isset($_REQUEST['fileName']) ? $_REQUEST['fileName'] : null;
				$fileName = str_ireplace('.zip', '', $fileName);
				$path = isset($_REQUEST['path']) ? $_REQUEST['path'] : null;
				$type = isset($_REQUEST['type']) ? $_REQUEST['type'] : 'zip';
				$password = isset($_REQUEST['password']) ? $_REQUEST['password'] : null;
				$response = $fs->MakeZip($path, null, $fileName, $password, $type);
				echo json_encode($response);
				break;
			case 'playlist':
				$files =	isset($_REQUEST['files']) ? $_REQUEST['files'] : null;
				$files = stripslashes($files);
				$files = json_decode($files);
				$path = $_REQUEST['path'];
				$response = $fs->MakePlaylist($path, $files);
				echo json_encode($response);
				break;			
			case 'mapper':
				$path = $_REQUEST['path'];
				$mapper = $fs->GetMapperUrl($path);
				echo json_encde($mapper);
				break;
			case 'shareUrls':
				$path = stripcslashes($_REQUEST['path']);
				$fileName = stripcslashes($_REQUEST['downloadPath']);
				$urls = $fs->GetShareUrls($path, $fileName);
				echo json_encode($urls);
				break;			
			case 'list':
				$limit = 1000;
				$directoryCookieStart = $_REQUEST['dirCookie'];
				$fileCookieStart = $_REQUEST['fileCookie'];
				$fileCookieEnd = null;
				$dirCookieEnd = null;
				$dirID = isset($_REQUEST['dirID']) ? $_REQUEST['dirID'] : null;
				$path = isset($_REQUEST['path']) ? $_REQUEST['path']: '/';
				$path = urlencode($path);
				$dirs = $fs->ListDirectories($path, $dirID, $limit, $directoryCookie);
				$dirCount = count($dirs['directories']);
				$dirCookie = $dirs['directories'][($dirCount - 1)]['did'];
				$fileCookie = null;
				$files = array('cookie'=>null, 'files'=>array());
				if($dirCount < $limit){
					$fileLimit = $limit - $dirCount;
					$files = $fs->ListFiles($path, $dirID, $fileLimit, $fileCookie);
					$fileCount = count($files['files']);
					$fileCookie = $files['files'][($fileCount - 1)]['fid'];
				}
				if(is_array($files['files']) && is_array($dirs['directories'])){
					$list = array_merge($dirs['directories'], $files['files']);
				}
				else{
					$list = array('success' => false, "data" => "Error retrieving list");
				}
				//echo json_encode(array('directoryCookie' => $dirs['cookie'], 'fileCookie'=>$files['cookie'], 'list'=>$list));
				$count = count($list);
				if($count == $limit){
					$count = $count + $total + 1;
				}
				//echo json_encode(array('nodes'=>$list, 'fileCookieStart'=>$fileCookieStart, 'fileCookieEnd'=>$fileCookieEnd, 'dirCookie'=>$dirCookie, 'total'=>$count));
				echo json_encode($list);
				break;
			case 'listDirectories':
				$limit = 1000;
				$directoryCookieStart = $_REQUEST['dirCookie'];
				$dirCookieEnd = null;
				$path = isset($_REQUEST['path']) ? $_REQUEST['path']: '/';
				//$path = urlencode($path);
				$dirs = $fs->ListDirectories($path, $dirID, $limit, $directoryCookie);
				$dirCount = count($dirs['directories']);
				echo json_encode($dirs);
				break;
			case 'listFiles':
				$limit = 1000;
				$path = isset($_REQUEST['path']) ? $_REQUEST['path']: '/';
				$files = $fs->ListFiles($path, $limit);
				echo json_encode($files);
				break;
		}
	}

	function email($action){
		renew_timer();
		$allowedActions = array(			
			'send');		
		if(!in_array($action, $allowedActions)){
			$response = array(
					"success" => false,
					"data" => "Method: ".$action." not supported"
					);
					echo json_encode($response);
					return;
		}
		switch($action){
			case 'send':
				$to = $_REQUEST['emailAddr'];
				$msg = isset($_REQUEST['msgBody']) ? stripcslashes($_REQUEST['msgBody']) : '';
				$mapperUrl = stripcslashes($_REQUEST['mapperUrl']);
				$tinyUrl = $_REQUEST['tinyUrl'];
				$fileName = stripcslashes($_REQUEST['fileName']);
				$linkPick = $_REQUEST['rbShare'];
				$mail = new SendMail();
				$resp = $mail->Send($to, $fileName, $msg, $mapperUrl, $tinyUrl, $linkPick);
				echo json_encode($resp);
				break;
		}
	}

	function jsonLiveReturn($obj, $count, $version = 1){
		$response = array(
			"totalCount"	=> $count,
			"version"		=> $version,
			"data"			=> $obj
		);
		return json_encode($response);
	}

	function getLiveVariables(){
		$vars = array();
		if(isset($_REQUEST['limit'])){
			$vars['limit'] = $_REQUEST['limit'];
		}
		if(isset($_REQUEST['start'])){
			$vars['start'] = $_REQUEST['start'];
		}
		if(isset($_REQUEST['filter'])){
			$vars['filter'] = $_REQUEST['filter'];
		}
		return $vars;
	}

	function castAsBool($val){
		if ($val == strtolower('true') || $val == strtolower('on') || $val === true || $val === 1){
			return true;
		}
		elseif ($val == strtolower('false') || $val == strtolower('off') || $val === false || $val === 0){
			return false;
		}
		else{
			return null;
		}
	}
}

?>