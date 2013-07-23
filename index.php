<?php
if ($_SERVER["SERVER_PORT"] == "80") {
	$url= $pageURL = 'https';
	$pageURL .= "://";
	$pageURL .= $_SERVER["SERVER_NAME"].$_SERVER["REQUEST_URI"];
	$fd = parse_url($pageURL);
	$path_parts = pathinfo($fd['path']);
	$dirs = explode("/", $path_parts['filename']);		//
	$path = '';
	for($i = 0; $i < count($dirs); $i++){
		if (strlen($dirs[$i]) > 0){
			$path = $path."/".$dirs[$i];
		}
	}
	header( 'Location: https://'.$_SERVER["SERVER_NAME"].$path);

}
require('classes/php/lamaApi.php');
session_check();
if (isset($_SESSION['lamafsuser'])){
	require('smarty/smarty_ext_template.php');
	$smarty = new Smarty_Ext();
	//define user required scripts here
	$smarty->assign('title', 'Agile Object Browser');
	$styles = array('libs/ext/ux/css/PagingTreeLoader.css');
	$scripts = array( 'libs/ext/ux/RowExpander.js',
	'libs/ext/ux/filterTree/FilterTreeX.js', 
	'libs/ext/ux/filterTree/RemoteTree.js',
	'libs/jquery/jquery-1.6.4.min.js',
	'libs/jquery/jquery-ui.min.js',
	'libs/jquery/iframe-transport.js',
	'libs/jquery/ux/jquery.iframe-transport.js',
	'libs/jquery/ux/jquery.fileupload.js',
	'libs/jquery/ux/jquery.fileupload-ui.js',	
	'libs/ext/ux/PagingTreeLoader.js',
	'libs/ext/ux/GroupSummary.js',
	'libs/ext/ux/FileUploadField.js',	
	'libs/ext/ux/RowEditor.js',
	'libs/ext/ux/livegrid/livegrid-all-debug.js', 
	'classes/js/util/util.js',
	'classes/js/util/ajax_helper.js',
	'classes/js/util/array_helper.js',
	'classes/js/util/time_helper.js', 
	'classes/js/util/storeUtils.js',
	'classes/js/util/ext/treeHelper.js',
	'classes/js/util/ext/window_helper.js',
	'classes/js/main.js',
	'classes/js/filesystem.js', 	
	'classes/js/uploader.js',	
	'classes/js/directory.js',
	'classes/js/util/session_helper.js');
	$smarty->assign('script_list', $scripts);
	$smarty->assign('styles_list', $styles);
	$smarty->display('ext_header.tpl');
	if(isset($_SESSION['lamafsuser'])){
		echo '<script>var currentUser="'.$_SESSION['lamafsuser'].'"; var pathPrefix = "'.$_SESSION['pathprefix'].'"</script>';
	}
	?>

		<script type="text/javascript">
	        Ext.onReady(function(){			
				onReady();
        	});
         
        </script>
	<?
	$smarty->display('footer.tpl');
}
else {

	$url= $pageURL = 'https';
	$pageURL .= "://";
	if ($_SERVER["SERVER_PORT"] != "80") {
		$pageURL .= $_SERVER["SERVER_NAME"].":".$_SERVER["SERVER_PORT"].$_SERVER["REQUEST_URI"];
	} else {
		$pageURL .= $_SERVER["SERVER_NAME"].$_SERVER["REQUEST_URI"];
	}
	$fd = parse_url($pageURL);
	$path_parts = pathinfo($fd['path']);
	$dirs = explode("/", $path_parts['filename']);		//
	$path = '';
	for($i = 0; $i < count($dirs); $i++){
		if (strlen($dirs[$i]) > 0){
			$path = $path."/".$dirs[$i];
		}
	}
	header( 'Location: https://'.$_SERVER["SERVER_NAME"].$path.'/login.php?user=lamafsuser&path='.$path );
}


?>
