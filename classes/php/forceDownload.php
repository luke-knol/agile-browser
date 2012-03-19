<?php
$fileName = $_REQUEST['fileName'];
$path = $_REQUEST['path'];
$path = stripcslashes($path);
$path = urldecode($path);
$path = rawurlencode($path);
$path = str_replace("%2F", "/", $path);
$path = str_replace("%3A", ":", $path);
$fileName = stripcslashes($fileName);
$fileName = urldecode($fileName);
$headers = get_headers($path, 1);
$size = $headers['Content-Length'];
Header("Content-disposition: attachment; filename=\"".$fileName."\"");
Header("Connection: close");
Header('Content-Type: application/octet-stream');
Header('Content-Length: ' . $size);
ob_clean();
flush();
readfile($path);
exit;
?>