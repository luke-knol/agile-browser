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
                $pathPrefixNode = $obj->xpath('/agile/userPrefix/'.$user);
                $this->uploadURI = (string)$uploadUriNodes[0][0];^M
                if(count($pathPrefixNode) == 1){
                        $this->pathPrefix = (string)$pathPrefixNode[0][0];
                }
                else{
                        $pathPrefixNode = $obj->xpath('/agile/service/pathPrefix');
                        $this->pathPrefix = (string)$pathPrefixNode[0][0];
                        if(strpos($this->pathPrefix,'%username') >= 0){^M
                                $this->pathPrefix = str_replace('%username', $user, $this->pathPrefix);^M
                        }
                }
                $_SESSION['envPrefix'] = (string)$envPrefixNode[0][0];^M
                if(substr($this->pathPrefix, -1) == '/'){^M
                        $this->pathPrefix = rtrim($this->pathPrefix, '/');^M
                }
                $this->uploadAPI = new UploadAPI($this->uploadURI);^M
                $r = $this->uploadAPI->login($user, $pass);^M
                return $r;
        }

        public function GetUploadAPI(){
                return $this->uploadAPI;
        }

        public function GetPathPrefix(){^M
                return $this->pathPrefix;^M
        }

        public function GetUploadURI(){
                return $this->uploadURI;
        }
}

?>