<?php
require ('config.php');
include_once('../util/time_helper.php');
class FileUploader
{
	const SESSION_KEY = '__upload_status';
	const ID_KEY      = 'APC_UPLOAD_PROGRESS';
	private $config;

	public function __construct()
	{
		$this->config = new FileUploaderConfig();
		session_start();
		if (!array_key_exists(self::SESSION_KEY, $_SESSION)) {
			$_SESSION[self::SESSION_KEY] = array();
		}
	}

	public static function CanGetUploadStatus()
	{
		if (!extension_loaded('apc'))
		return false;

		if (!function_exists('apc_fetch'))
		return false;

		return ini_get('apc.enabled') && ini_get('apc.rfc1867');
	}

	public function getUploadStatus($id)
	{

		// sanitize the ID value
		$id = preg_replace('/[^a-z0-9]/i', '', $id);
		if (strlen($id) == 0)
		return;

		// ensure the uploaded status data exists in the session
		if (!array_key_exists($id, $_SESSION[self::SESSION_KEY])) {
			$_SESSION[self::SESSION_KEY][$id] = array(
                    'id'       => $id,
                    'finished' => false,
                    'percent'  => 0,
                    'total'    => 0,
                    'complete' => 0,
					'rate' => 0,
					'time' => 0
			);
			$_SESSION[self::SESSION_KEY]['time'][$id] = time();
		}

		// retrieve the data from the session so it can be updated and returned
		$ret = $_SESSION[self::SESSION_KEY][$id];

		// if we can't retrieve the status or the upload has finished just return
		if (!self::CanGetUploadStatus() || $ret['finished'])
		return $ret;

		// retrieve the upload data from APC
		$status = apc_fetch('upload_' . $id);

		// false is returned if the data isn't found
		if ($status) {
			$ret['finished'] = (bool) $status['done'];
			$ret['total']    = $status['total'];
			$ret['complete'] = $status['current'];
			$ret['rate'] = $status['rate'];

			// calculate the completed percentage
			if ($ret['total'] > 0){
				$ret['percent'] = $ret['complete'] / $ret['total'] * 100;
			}

			// calculate the average rate
			$elapsed = time() - $_SESSION[self::SESSION_KEY]['time'][$id];
			$rate = $ret['complete']  / $elapsed;
			$rate = $rate * 0.0009765625;
			$rate = round($rate, 2);
			$ret['rate'] = $rate;
			$ret['time'] = find_date_diff($_SESSION[self::SESSION_KEY]['time'][$id], time());

			// write the changed data back to the session
			$_SESSION[self::SESSION_KEY][$id] = $ret;
		}

		return $ret;
	}

	public function upload($key, $path)
	{
		// ensure the given file has been uploaded
		if (!isset($_FILES[$key]) || !is_array($_FILES[$key]))
		return false;

		$file = $_FILES[$key];
		$id   = $_POST[self::ID_KEY];

		// only proceed if no errors have occurred
		if ($file['error'] != UPLOAD_ERR_OK){
			$response = array(
					"success"	=> false,
					"data"		=> 'An error occured during uploading.. please try again.'
					);
					return $response;
		}


		// write the uploaded file to the filesystem
		//$fullpath = sprintf('%s/%s', $path.$this->config->UPLOADPATH, basename($file['name']));
		$fullpath = sprintf('%s/%s', $this->config->getUploadPath(), basename($file['name']));
		$file_size = filesize($file['tmp_name']);
		if (!$file_size || $file_size > $this->config->getMaxFileSize()) {
			$response = array(
					"success"	=> false,
					"data"		=> 'file size too large!'
					);
					return $response;
		}
		if (!move_uploaded_file($file['tmp_name'], $fullpath)){
			$response = array(
					"success"	=> false,
					"data"		=> 'Unable to move file!'
					);
					return $response;
		}


		// update the session data to indicate the upload has completed
		$size = filesize($fullpath);

		$response = array(
					"success"	=> true,
					"data"		=> 'file uploaded!'
					);
					return $response;
	}

}
?>