<?php
/**
 * Smarty shared plugin
 * @package Smarty
 * @subpackage plugins
 */


/**
 * Function: smarty_make_timestamp<br>
 * Purpose:  used by other smarty functions to make a timestamp
 *           from a string.
 * @author   Monte Ohrt <monte at ohrt dot com>
 * @param string
 * @return string
 */
function smarty_make_timestamp($string)
{
	// Hacked by dmittner to put strtotime check before is_numeric check, since YYYYMMDD was broke
    if(empty($string)) {
        // use "now":
        $time = time();
    } elseif (preg_match('/^\d{14}$/', $string)) {
        // it is mysql timestamp format of YYYYMMDDHHMMSS?            
        $time = mktime(substr($string, 8, 2),substr($string, 10, 2),substr($string, 12, 2),
                       substr($string, 4, 2),substr($string, 6, 2),substr($string, 0, 4));
	} else {
		$temptime = strtotime($string);
		if ( $temptime != -1 && $temptime !== false ){
			$time = $temptime;
    	} elseif (is_numeric($string)) {
        	// it is a numeric string, we handle it as timestamp
        	$time = (int)$string;
	    } else {
    	    $time = time();
	    }
	}
	return $time;
}

/* vim: set expandtab: */

?>
