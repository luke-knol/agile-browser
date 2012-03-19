<?php

function array_remove($arr, $val){
	foreach ($arr as $key => $value){
		if ($arr[$key] == $val){
			unset($arr[$key]);
		}
	}
	return $arr = array_values($arr);
}

function castIntArray($array){
	$intArray = array();
	foreach($array as $value){
		array_push($intArray, (int)$value);
	}
	return $intArray;
}

function subval_sort($a,$subkey) {
	foreach($a as $k=>$v) {
		$b[$k] = strtolower($v[$subkey]);
	}
	asort($b);
	foreach($b as $key=>$val) {
		$c[] = $a[$key];
	}
	return $c;
}

class Array_Utils {

	public static function array2object($array) {

		if (is_array($array)) {
			$obj = new StdClass();

			foreach ($array as $key => $val){
				$obj->$key = $val;
			}
		}
		else { $obj = $array; }

		return $obj;
	}

	public static function object2array($object) {
		if (is_object($object)) {
			foreach ($object as $key => $value) {
				$array[$key] = $value;
			}
		}
		else {
			$array = $object;
		}
		return $array;
	}

}



?>
