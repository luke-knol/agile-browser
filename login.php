<?php
if ($_SERVER["SERVER_PORT"] == "80") {
	header( 'Location: https://'.$_SERVER["SERVER_NAME"].$_REQUEST['path']);
}
require('smarty/smarty_ext_template.php');
$smarty = new Smarty_Ext();
$smarty->display('ext_header.tpl');
$ref = 'https://'.$_SERVER["SERVER_NAME"].$_REQUEST['path'].'/';
$user = $_REQUEST['user'];
echo '<script>var ref="'.$ref.'"; var user="'.$user.'";</script>';
?>

<script type="text/javascript">
	Ext.onReady(function(){ 	
	Ext.QuickTips.init();	
	
		var loadingMask = Ext.get('loading-mask');
	     var loading = Ext.get('loading');
	     //  Hide loading message
	     loading.fadeOut({ duration: 0.2, remove: true });
	     //  Hide loading mask
	     loadingMask.setOpacity(0);
	
	 
	var loginWindow = new Ext.Window({
		modal: true,
		closable: false,
		width: 410,
		title: 'Welcome To Agile Object Browser',
		items:[loginForm = new Ext.FormPanel({ 					
					url: 'classes/php/util/ldapLogin.php', 
					frame: true,					
					title:'Please Login', 
					defaultType: 'textfield',
					width: 400,							
					monitorValid: true,					
					items: [{
						fieldLabel: 'Username', 
						name: 'handle',						
					    allowBlank: false 
					    }, {
						fieldLabel: 'Password', 
						name: 'password', 
						inputType: 'password',
						allowBlank: false,
						listeners: {
							specialkey: function(f,e){								
					   			if (e.getKey() == e.ENTER) {
									loginForm.getForm().submit({
					                    params: {
					                        user: user                        
					                    },		                    
					                    success: function(f, a){
											loginWindow.close();																											
											window.location=ref;																					
					                    },
					                    failure: function(f, a){
					                        Ext.Msg.alert('Warning', a.result.data);		                        
					                    }
					                });
					   			}
							}
						} 
						}],
					buttons: [{
						text: 'Login',
						listeners:{
							click: function(){
							loginForm.getForm().submit({
		                    params: {
		                        user: user		                        
		                    },		                    
		                    success: function(f, a){
								loginWindow.close();																
								 window.location=ref;																					
		                    },
		                    failure: function(f, a){
		                        Ext.Msg.alert('Warning', a.result.data);		                        
		                    }
		                });		
								
							}
						}
					}] 
				})]}).show();	
		}); 
	</script>

