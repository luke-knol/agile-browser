<?php /* Smarty version 2.6.18, created on 2011-10-28 00:24:23
         compiled from ext_header.tpl */ ?>
<?php require_once(SMARTY_CORE_DIR . 'core.load_plugins.php');
smarty_core_load_plugins(array('plugins' => array(array('modifier', 'default', 'ext_header.tpl', 5, false),)), $this); ?>
<!DOCTYPE HTML>
<html lang="en" class="no-js">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title id='title'><?php echo ((is_array($_tmp=@$this->_tpl_vars['title'])) ? $this->_run_mod_handler('default', true, $_tmp, 'Limelight Networks Dashboard') : smarty_modifier_default($_tmp, 'Limelight Networks Dashboard')); ?>
</title>

<!-- ** CSS ** -->
<!-- base library -->
<link rel="stylesheet" type="text/css"
	href="libs/ext/resources/css/ext-all.css" />

<!-- overrides to base library -->
<link rel="stylesheet" type="text/css"
	href="libs/ext/resources/css/xtheme-gray.css" />
 
<link rel="stylesheet" type="text/css" href="css/styles.css" /> 
<link rel="stylesheet" href="https://ajax.googleapis.com/ajax/libs/jqueryui/1.8.16/themes/base/jquery-ui.css" id="theme">
<link rel="stylesheet" href="libs/jquery/ux/css/jquery.fileupload-ui.css">

 
<?php $_from = $this->_tpl_vars['styles_list']; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array'); }if (count($_from)):
    foreach ($_from as $this->_tpl_vars['url']):
?>
<link rel="stylesheet" type="text/css" href="<?php echo $this->_tpl_vars['url']; ?>
" />
<?php endforeach; endif; unset($_from); ?>
</head>
<body>
<div id="header">
</div>
<div id="loading-mask"></div>
<div id="loading"><span id="loading-message">Loading. Please wait...</span>
</div>
<!-- ** Javascript ** -->
<script type="text/javascript">
     document.getElementById('loading-message').innerHTML = 'Loading Libraries';
</script>
<!-- ExtJS library: base/adapter -->
<script type="text/javascript" src="libs/ext/adapter/ext/ext-base.js"></script>
<!-- ExtJS library: all widgets -->
<script>
     document.getElementById('loading-message').innerHTML = 'Loading Agile Object Browser';
</script>
<script type="text/javascript" src="libs/ext/ext-all.js"></script>
<script type="text/javascript">
        // Path to the blank image should point to a valid location on your server
        Ext.BLANK_IMAGE_URL = 'libs/ext/resources/images/default/s.gif'; 
         </script>
<!--Page Specfic Javascript Libraries Added Here -->
<?php $_from = $this->_tpl_vars['script_list']; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array'); }if (count($_from)):
    foreach ($_from as $this->_tpl_vars['url']):
?>
<script type="text/javascript" src="<?php echo $this->_tpl_vars['url']; ?>
"></script>
<?php endforeach; endif; unset($_from); ?>
