var Directory = function(){

    var dir = this;
    
    this.Form = function(callback, path){
    
        var directoryFormMask;
        
        if (path == '/') {
            path = "";
        }
        
        var directoryFormWindow = new Ext.Window({
            title: 'Create Directory',
            layout: 'fit',
            id: 'directoryFormWindow',
            autoWidth: true,
            listeners: {
                afterrender: function(){
                    directoryFormMask = new Ext.LoadMask('directoryFormWindow', {
                        msg: "Please wait..."
                    });
                }
            }
        });
        
        var form = new Ext.form.FormPanel({
            url: 'classes/php/custReqHandler.php?object=filesystem&action=createDirectory',
            padding: 10,
            border: true,
            frame: true,
            width: 375,
            height: 100,
            labelWidth: 80,
            autoHeight: true,
            defaultType: 'textfield',
            defaults: {
                width: 250
            },
            buttons: [{
                text: 'Save',
                handler: function(){
                    directoryFormMask.show();
                    var params = {
                        path: path,
                        gid: 1000003
                    };
                    var nameField = form.find('name', 'name');
                    form.getForm().submit({
                        submitEmptyText: false,
                        params: params,
                        success: function(f, a){
                            directoryFormMask.hide();
                            directoryFormWindow.close();
                            if (callback) {
                                callback(path);
                            }
                        },
                        failure: function(f, a){
                            Ext.Msg.alert('Warning', a.result.data);
                            directoryFormMask.hide();
                            directoryFormWindow.close();
                        }
                    });
                }
            }, {
                text: 'Cancel',
                handler: function(){
                    directoryFormWindow.close();
                }
            }],
            items: [{
                name: 'dirName',
                fieldLabel: 'Folder Name',
                validator: checkFoldername,
                listeners: {
                    specialkey: function(f, e){
                        if (e.getKey() == e.ENTER) {
                            directoryFormMask.show();
                            var params = {
                                path: path,
                                gid: 1000003
                            };
                            var nameField = form.find('name', 'name');
                            form.getForm().submit({
                                submitEmptyText: false,
                                params: params,
                                success: function(f, a){
                                    directoryFormMask.hide();
                                    directoryFormWindow.close();
                                    if (callback) {
                                        callback(path);
                                    }
                                },
                                failure: function(f, a){
                                    Ext.Msg.alert('Warning', a.result.data);
                                    directoryFormMask.hide();
                                    directoryFormWindow.close();
                                }
                            });
                        }
                    }
                }
            }]
        });
        
        
        directoryFormWindow.add(form);
        directoryFormWindow.show();
    };
 
    return this;
};

