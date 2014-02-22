<?php
include "includes/jsonRPC/jsonRPCClient.php";
include "includes/uploadAPI/uploadAPI.php";


class Auth
{
        private $uploadAPI;
        private $pathPrefix;
        private $uploadURI;

        public function Login($user, $pass){
                $obj = simplexml_load_file('/etc/agile/browser_config.xml');
                $uploadUriNodes = $obj->xpath('/agile/service/uploadAPI');
                $envPrefixNode = $obj->xpath('/agile/service/envPrefix');                
                $this->uploadURI = (string)$uploadUriNodes[0][0];                
                $_SESSION['envPrefix'] = (string)$envPrefixNode[0][0];                
                $this->uploadAPI = new UploadAPI($this->uploadURI);
                $r = $this->uploadAPI->login($user, $pass);                
                return $r;
        }

        public function GetUploadAPI(){
                return $this->uploadAPI;
        }

        public function GetPathPrefix(){
                return $this->pathPrefix;
        }

        public function GetUploadURI(){
                return $this->uploadURI;
        }
}

?>