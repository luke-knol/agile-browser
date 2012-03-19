<?php
class Node
{
	public $text = null;	
	public $id= null;
	public $leaf = null;
	public $type = null;
	public $checked = null;
	public $draggable = true;

	public function __construct($id, $text, $type, $checked=null){
		$this->text = $text;				
		$this->id = $id;
		$this->text = $text;
		$this->leaf = true;
		if($type == 'directory'){
			$this->leaf = false;
			$this->draggable = false;			
		}
		else if($type == 'dashboard'){
			$this->checked = false;
		}
		$this->type = $type;

	}
}


?>
