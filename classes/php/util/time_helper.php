<?php
function dt_diff($start, $end, $shorthand = false, $includeSuffix=false){
	$sdate = $start;
	$edate = $end;

	$time = $edate - $sdate;
	if($time <= 0){
		if($shorthand){
			$timeshift = '0s ';
		}else{
			$timeshift = '0 sec ';
		}
	}
	else if($time>=0 && $time<=59) {
		// Seconds
		if($shorthand){
			$timeshift = $time.'s ';
		}else{
			$timeshift = $time.' sec ';
		}


	} elseif($time>=60 && $time<=3599) {
		// Minutes + Seconds
		$pmin = ($edate - $sdate) / 60;
		$premin = explode('.', $pmin);

		$presec = $pmin-$premin[0];
		$sec = $presec*60;
		if($shorthand){
			$timeshift = $premin[0].'m '.round($sec,0).'s ';
		}else{
			$timeshift = $premin[0].' min '.round($sec,0).' sec ';
		}

	} elseif($time>=3600 && $time<=86399) {
		// Hours + Minutes
		$phour = ($edate - $sdate) / 3600;
		$prehour = explode('.',$phour);

		$premin = $phour-$prehour[0];
		$min = explode('.',$premin*60);

		$presec = '0.'.$min[1];
		$sec = $presec*60;

		if($shorthand){
			$timeshift = $prehour[0].'h '.$min[0].'m '.round($sec,0).'s ';
		}else{
			$timeshift = $prehour[0].' hrs '.$min[0].' min '.round($sec,0).' sec ';
		}

	} elseif($time>=86400) {
		// Days + Hours + Minutes
		$pday = ($edate - $sdate) / 86400;
		$preday = explode('.',$pday);

		$phour = $pday-$preday[0];
		$prehour = explode('.',$phour*24);

		$premin = ($phour*24)-$prehour[0];
		$min = explode('.',$premin*60);

		$presec = '0.'.$min[1];
		$sec = $presec*60;

		if($shorthand){
			$timeshift = $preday[0].'d '.$prehour[0].'h '.$min[0].'m '.round($sec,0).'s ';
		}else{
			$timeshift = $preday[0].' days '.$prehour[0].' hrs '.$min[0].' min '.round($sec,0).' sec ';
		}

	}
	if($includeSuffix){
		$timeshift = $timeshift.'ago';
	}
	return $timeshift;
}
?>