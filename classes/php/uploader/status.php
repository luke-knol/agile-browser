<?php
require_once('FileUploader.php');

$path = realpath(dirname(__FILE__));

$id = isset($_POST['id']) ? $_POST['id'] : 0;
$fu = new FileUploader();

$status = $fu->getUploadStatus($id);

//header('Content-type: application/json');
echo json_encode($status);
?>