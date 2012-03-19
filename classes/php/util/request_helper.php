<?php
function isempty($request){
	if(isset($request)){
		return true;
	}
	else{
		if($request == ''){
			return false;
		}
		else{
			return true;
		}
	}
}

?>