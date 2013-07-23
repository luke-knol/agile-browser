<?php

include "uploadAPI.php";
include "../jsonRPC/jsonRPCClient.php";

$uri = "https://api.lama.lldns.net";
$userid = "jboelens";
$passwd = "";

$api = new UploadAPI($uri);
if (!$api->login($userid, $passwd)) {
    echo "Invalid Login";
    exit(0);
}

echo "<pre>";
echo "Login Success\n";
print $api->token . "\n";

print_r($api->postFile("test1.txt", "/", "test1.txt"));

print_r($api->listFile("/"));
?>
