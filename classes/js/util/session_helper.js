function session_check(sessionChecker, uploadRunning){
    Ext.Ajax.request({
        url: 'classes/php/lamaApi.php',
        method: 'POST',
        params: {
            clientRequest: true,
			uploadRunning: uploadRunning
        },
        success: function(response, a){
            var o = {};
            try {
                o = Ext.decode(response.responseText);
            } 
            catch (e) {
				//Ext.Msg.alert('Error', response.responseText);                
                //return;
            }
            if (!o.success) {                
                //currentUser = o.currentUser;
                Ext.TaskMgr.stop(sessionChecker);                            
                var loginForm = new Ext.form.FormPanel({
                    url: 'classes/php/util/ldapLogin.php',
                    frame: true,                   
                    defaultType: 'textfield',
                    width: 380,
                    height: 120,
                    padding: 10,
                    monitorValid: true,
                    items: [{
                        fieldLabel: 'Username',
                        name: 'handle',
						id: 'reloginUsernameTxt',
						width: 200,                        
                        value: currentUser,
                        allowBlank: false
                    }, {
                        fieldLabel: 'Password',
                        name: 'password',
						width: 200,
                        inputType: 'password',
                        allowBlank: false,
                        listeners: {
                            specialkey: function(f, e){
                                if (e.getKey() == e.ENTER) {
                                    loginForm.getForm().submit({
                                        success: function(f, a){											
											currentUser = Ext.getCmp('reloginUsernameTxt').getValue();
											var currentUserPanel = Ext.getCmp('currentUserLabelPanelTxt');
											currentUserPanel.update('<label style="color: #ccc;">Welcome:&nbsp</label><label style="color: #d0eb17;">' + currentUser + '</label>');
                                            Ext.TaskMgr.start(sessionChecker);                                            
                                            loginWindow.close();
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
                        text: 'Logout',
                        listeners: {
                            click: function(){
                                session_logout();
                            }
                        }
                    }, {
                        text: 'Resume',
                        listeners: {
                            click: function(){
                                loginForm.getForm().submit({
                                    params: {
                                        user: 'lamauiuser'
                                    },
                                    success: function(f, a){
                                        Ext.TaskMgr.start(sessionChecker);
                                        loginWindow.close();
                                    },
                                    failure: function(f, a){
                                        Ext.Msg.alert('Warning', a.result.data);
                                    }
                                });
                                
                            }
                        }
                    }]
                });
                var loginWindow = new Ext.Window({
                    title: 'Session Expired - please login',
                    modal: true,
                    autoHeight: true,
                    closable: false,
                    autoWidth: true,                    
                    items: [loginForm]
                }).show();
            }
            else {
            }
        },
        failure: function(response, a){
        
        }
    });
}

function session_logout(){
    Ext.Ajax.request({
        url: 'classes/php/lamaApi.php',
        method: 'POST',
        params: {
            logout: true
        },
        success: function(response, a){
            var o = {};
            try {
                o = Ext.decode(response.responseText);
            } 
            catch (e) {
				//var loc = window.location;
				//loc = loc.replace("#", "");
                window.location.reload();
                return;
            }
            if (true == o.success) {
												
                window.location.reload();
            }
        },
        failure: function(response, a){
        
        }
    });
}

