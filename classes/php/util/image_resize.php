<?php
Class Image_Resize{
	
	public static function resizeImage($blobImage,$toWidth,$toHeight){
	    
	    // Get the original geometry and calculate scales
	    $im = imagecreatefromstring($blobImage);
	    header("Content-type: image/jpeg");

	    
	    
	    //print $im;
//	    list($width, $height) = getimagesize($originalImage);
//	    $xscale=$width/$toWidth;
//	    $yscale=$height/$toHeight;
//	    
//	    // Recalculate new size with default ratio
//	    if ($yscale>$xscale){
//	        $new_width = round($width * (1/$yscale));
//	        $new_height = round($height * (1/$yscale));
//	    }
//	    else {
//	        $new_width = round($width * (1/$xscale));
//	        $new_height = round($height * (1/$xscale));
//	    }
//	
	    // Resize the original image
	    $x = imagesx($im);
		$y = imagesy($im);
	    $imageResized = imagecreatetruecolor($toWidth, $toHeight);
	    //$imageTmp     = imagecreatefromjpeg ($originalImage);
	    imagecopyresampled($imageResized, $im, 0, 0, 0, 0, $toWidth, $toHeight, $x, $y);
		imagedestroy($im);
	    return $imageResized;
	}
}
?> 