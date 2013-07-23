<?php
class FileUploaderConfig
{
	const UPLOADPATH = '/tmp/uploads/'; //full resolved path
	const MAXFILESIZEINBYTES = 2147483648; //2gb is the max php.ini config is set to
	const ALLOWEDTYPES = '*'; //comma delimted
	
	function getUploadPath() {
       return  self::UPLOADPATH;
   	}
	
	function getMaxFileSize() {
       return  self::MAXFILESIZEINBYTES;
   	}
   	
	function getAllowTypes() {
       return  self::ALLOWEDTYPES;
   	}
}
?>