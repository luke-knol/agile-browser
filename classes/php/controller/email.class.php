<?php
class SendMail
{
	function Send($to, $from, $filename, $msgBody, $mapperUrl, $tinyUrl, $linkPick){
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




		//$to = $to;


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
?>