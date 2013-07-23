<?php
require('Smarty.class.php');

class Smarty_Ext extends Smarty {

function Smarty_Ext()
   {
        // Class Constructor.
        // These automatically get set with each new instance.

        $this->Smarty();

        $this->template_dir = dirname(__FILE__).'/templates/';
        $this->compile_dir  = dirname(__FILE__).'/templates_c/';
        $this->config_dir   = dirname(__FILE__).'/configs/';
        $this->cache_dir    = dirname(__FILE__).'/cache/';

        $this->assign('app_name', 'Dashboard');
   }

}
?>
