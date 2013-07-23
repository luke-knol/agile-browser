<!DOCTYPE HTML>
<html lang="en" class="no-js">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title id='title'>{$title|default:"Limelight Networks Dashboard"}</title>

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

 
{foreach from=$styles_list item=url}
<link rel="stylesheet" type="text/css" href="{$url}" />
{/foreach}
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
{foreach from=$script_list item=url}
<script type="text/javascript" src="{$url}"></script>
{/foreach}

