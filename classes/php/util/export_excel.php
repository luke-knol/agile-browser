<?php

require_once 'formatting_helper.php';
require_once 'Spreadsheet/Excel/Writer.php';

Class Excel
{

	public function BuildReport($totals, $path){
		
		$workbook = new Spreadsheet_Excel_Writer($path);



		// Creating a worksheet
		$worksheet =& $workbook->addWorksheet('Storage Report');


		$worksheet->setColumn(0,1,30);
		$worksheet->setColumn(2,2,30);
		$worksheet->setColumn(3,5,20);

		$format_bold =& $workbook->addFormat();
		$format_bold->setBold();
		$format_bold->setSize(14);

		$format_reg =& $workbook->addFormat();		
		$format_reg->setSize(12);
		
		$format_reg_bold =& $workbook->addFormat();
		$format_reg_bold->setBold();		
		$format_reg_bold->setSize(12);
			
		$headers=array("Customer Shortname","Policy Name(s)","Copies","Library Size", "Distributed Size", "File Count");
		foreach($headers as $i => $heading){
			$worksheet->writeString(0, $i, $heading, $format_bold);
		}



		$i = 0;
		foreach($totals as $customer => $total){
			$i++;
			$i++;
			$worksheet->writeString($i, 0, $customer, $format_bold);
			$i++;
			$totalSize = 0;
			$totalDistributed = 0;
			$totalFiles = 0;
			foreach($totals[$customer] as $val){
				$worksheet->writeString($i, 1, $val['policy'], $format_reg);
				$worksheet->writeNumber($i, 2, (string)$val['copyCount'], $format_reg);
				$worksheet->writeString($i, 3, size_format($val['size']), $format_reg);
				$totalSize += $val['size'];
				$worksheet->writeString($i, 4, size_format($val['size'] * $val['copyCount']), $format_reg);
				$totalDistributed += ($val['size'] * $val['copyCount']);
				$worksheet->writeNumber($i, 5, $val['fileCount'], $format_reg);
				$totalFiles += $val['fileCount'];
				$i++;
			}
			$worksheet->writeString($i, 3, size_format($totalSize), $format_reg_bold);
			$worksheet->writeString($i, 4, size_format($totalDistributed), $format_reg_bold);
			$worksheet->writeNumber($i, 5, $totalFiles, $format_reg_bold);
			$i++;
		}
			
			
		$workbook->close();
		return($path);
	}
}

?>
