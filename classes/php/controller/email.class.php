<?php
class SendMail
{
	function Send($to, $filename, $msgBody, $mapperUrl, $tinyUrl, $linkPick){
		$eol="\n";
		$msg = '';
		if($msgBody != ''){
			$msg = $msg.$msgBody.$eol;
			$msg = $msg.$eol.$eol;
		}
		$msg = $msg."-------------------------------------".$eol;
		if($linkPick == 3){
			$msg = $msg."Direct Link: ".$mapperUrl.$eol;
			$msg = $msg."TinyURL Link: ".$tinyUrl.$eol;
		}
		elseif($linkPick == 1){
			$msg = $msg.'Direct Link: '.$mapperUrl.$eol;
		}
		else{
			$msg = $msg.'TinyURL Link: '.$tinyUrl.$eol;	
		}
		$msg = $msg."-------------------------------------".$eol.$eol;

		$msg = $msg."Sent to you by Limelight Agile Cloud Storage".$eol;
		$msg = $msg."www.limelightnetworks.com".$eol;
		



		$to = $to;
		$from = $_SESSION['lamafsuser'];

		$subject = "Cloud Services Shared Link: ".$filename;
		$message = $msg;
		$headers  = "From: ".$from.$eol;
		$headers .= "Bcc: ".$from.$eol;
		$headers .= 'Reply-To: '.$from.$eol;
		$headers .= 'Return-Path: '.$from.$eol;
		$headers .= "X-Mailer: PHP v".phpversion().$eol;


		ini_set(sendmail_from,$from);  // the INI lines are to force the From Address to be used !
		mail($to,$subject,$message,$headers);
		ini_restore(sendmail_from);
		return array("success" => true, "data" => 'mail sent');
	}
}

class LDAP_ED
{
	private $ds;
	private $r;
	private $sr;

	function __construct(){
		$this->ds=ldap_connect("ldap://ldap.llnw.com/", 389);
		ldap_set_option($this->ds, LDAP_OPT_PROTOCOL_VERSION, 3);
		ldap_set_option($this->ds, LDAP_OPT_REFERRALS, 0);
		$this->r=ldap_bind($this->ds);
	}

	function __destruct(){
		ldap_close($this->ds);
	}

	function GetAllEmails(){
		$this->sr=ldap_search($this->ds, "ou=People,dc=llnw,dc=com", "(&(objectclass=llnwContingentWorker)(llnwstatus=Active)(llnwou3=Oracle Consulting))");
		$people_list = ldap_get_entries($this->ds, $this->sr);
		echo count($people_list);
		$filters = array('uid', "llnwou3", "cn",);
		foreach($filters as $key => $value){
			$filterkeys[$value] = '';
		}
		for($i = 0; $i < count($people_list); $i++){
			$temp = array_intersect_key((array)$people_list[$i], $filterkeys);
			if(count($temp) > 0){
				$new_list[] = $temp;
			}
		}
		$records = array();
		foreach($new_list as $row){
			$values = array();
			foreach($filters as $key => $value){
				for ($i = 0; $i < $row[$value]["count"]; $i++){
					$values[$value] = $row[$value][$i];
				}
			}
			array_push($records, $values);
		}

		return $records;
	}

	function SearchForEmail($filter, $searchAllUsers){
		if ($searchAllUsers){
			$this->sr=ldap_search($this->ds, "ou=People,dc=llnw,dc=com", "(&(llnwstatus=Active)(|(uid=*".$filter."*)(givenName=*".$filter."*)(cn=*".$filter."*)(sn=*".$filter."*)))");
		}
		else {
			$this->sr=ldap_search($this->ds, "ou=People,dc=llnw,dc=com", "(&(objectclass=llnwEmployee)(llnwstatus=Active)(|(uid=*".$filter."*)(givenName=*".$filter."*)(cn=*".$filter."*)(sn=*".$filter."*)))");
		}
		$people_list = ldap_get_entries($this->ds, $this->sr);
		$filters = array('uid', "cn");
		foreach($filters as $key => $value){
			$filterkeys[$value] = '';
		}
		for($i = 0; $i < count($people_list); $i++){
			$temp = array_intersect_key((array)$people_list[$i], $filterkeys);
			if(count($temp) > 0){
				$new_list[] = $temp;
			}
		}
		$records = array();
		foreach($new_list as $row){
			$values = array();
			foreach($filters as $key => $value){
				for ($i = 0; $i < $row[$value]["count"]; $i++){
					$values[$value] = $row[$value][$i];
				}
			}
			array_push($records, $values);
		}

		return $records;
	}

}
?>