<?php
    require_once('FileUploader.php');
 
    $path = realpath(dirname(__FILE__));
 
    $fu = new FileUploader();    
    $response = $fu->upload('lamaFile', $path);
    echo json_encode($response);
    
?>


