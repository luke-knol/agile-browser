<?php

function size_format($bytes, $hideUnits=false, $currentUnits=null)
{
	$precision = 2;
	$kilobyte = 1024;
	$megabyte = $kilobyte * 1024;
	$gigabyte = $megabyte * 1024;
	$terabyte = $gigabyte * 1024;

	if($currentUnits){
		if($currentUnits == 'MB'){
			$$bytes = $bytes * 1048576;
		}
	}

	if (($bytes >= 0) && ($bytes < $kilobyte)) {
		if ($hideUnits == true){
			return $bytes;
		}
		else{
			return $bytes . ' B';
		}

	} elseif (($bytes >= $kilobyte) && ($bytes < $megabyte)) {
		if ($hideUnits == true){
			return round($bytes / $kilobyte, $precision);
		}
		else{
			return round($bytes / $kilobyte, $precision) . ' KB';
		}

	} elseif (($bytes >= $megabyte) && ($bytes < $gigabyte)) {
		if ($hideUnits == true){
			return round($bytes / $megabyte, $precision);
		}
		else{
			return round($bytes / $megabyte, $precision) . ' MB';
		}

	} elseif (($bytes >= $gigabyte) && ($bytes < $terabyte)) {
		if ($hideUnits == true){
			return round($bytes / $gigabyte, $precision);
		}
		else{
			return round($bytes / $gigabyte, $precision) . ' GB';
		}

	} elseif ($bytes >= $terabyte) {
		if ($hideUnits == true){
			return round($bytes / $terabyte, $precision);
		}
		else{
			return round($bytes / $terabyte, $precision) . ' TB';
		}
	} else {
		if ($hideUnits == true){
			return $bytes;
		}
		else{
			return $bytes . ' B';
		}
	}
}


function castCheckBox($val){
	if($val == 'on'){
		return 1;
	}
	return 0;
}
?>