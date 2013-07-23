<?php
function polling_return($arg){
	echo json_encode(array(
    		'type'=>'event',
    		'name'=>'message',
    		'data'=>$arg));
}

function buffered_return($arg, $totalCount){
	echo json_encode(array(
    		'totalCount'=>$totalCount,
    		'version'=> 1,
    		'data'=>$arg));
}
?>