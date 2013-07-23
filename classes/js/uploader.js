function Uploader(){
    var self = this;
    this.uploadRunning = false;
    this.uploadMode = 'auto'; //possible modes: auto, zip, protect
    this.currentPath = '/';
    this.zipFolder = '/temp1Zip2Folder/';
    this.selectedPass = '';
    this.seletedType = '';
    this.selectedFilename = '';
    this.currentFiles = [];
    startUploadScript = function(){
        $(function(){
            'use strict';
            // Initialize the jQuery File Upload widget:
            $('#fileupload').fileupload({
                dropZone: $('#fileupload'),                
                formData: {
                    filePath: '/'
                }
            });
            
            
            $('.start').button('disable');
            
            var rbAuto = Ext.getCmp('rbUploadMethodAuto');
            var rbZip = Ext.getCmp('rbUploadMethodZip');
            
            
            $('#fileupload').bind('fileuploadstart', function(e, data){
                self.uploadRunning = true;
                rbZip.disable();
                rbAuto.disable();
                if (self.uploadMode == 'zip') {
                    $('.start').button('disable');
                    $('.fileinput-button').button('disable');
                }
            });
            
            
            $('#fileupload').bind('fileuploadstop', function(e, data){
                if (self.uploadMode == 'zip') {
                    var win;
                    new Ext.Window({
                        title: 'Success',
                        padding: 10,
                        closeble: false,
                        shadow: false,
                        html: "<div style='font-size: 12px'>Your transfer is being processed.",
                        listeners: {
                            afterrender: function(thisWindow){
                                win = thisWindow.getEl();
                            }
                        }
                    }).show();
                    var afterZipped = function(){
                        win.pause(3).puff('t', {
                            easing: 'easeOut',
                            duration: 0.3,
                            remove: true
                        });
                        self.uploadRunning = false;
                        rbZip.enable();
                        rbAuto.enable();
                        rbAuto.setValue(true);
                        $('.fileinput-button').button('enable');
                        fileSystem.ProgressStore.each(function(record){
                            if (record.get('name') == self.selectedFilename + '.' + self.selectedType) {
                                fileSystem.ProgressStore.remove(record);
                            }
                        });
                        fileSystem.store.reload();
                    };
                    var params = {
                        fileName: self.selectedFilename,
                        path: self.zipFolder,
                        password: self.selectedPass,
                        type: self.selectedType
                    };
                    performAjax('filesystem', 'makeZip', params, null, null, afterZipped);
                }
                else {
                    self.uploadRunning = false;
                    rbZip.enable();
                    rbAuto.enable();
                    $('.fileinput-button').button('enable');
                }
                //fileSystem.store.reload();
                self.currentFiles = [];
            });
            
            $('#fileupload').bind('fileuploadalways', function(e, data){
                $.each(data.files, function(index, file){
                    fileSystem.ProgressStore.each(function(record){
                        if (record.get('name') === file.name) {
                            fileSystem.ProgressStore.remove(record);
                            if (self.currentPath == record.get('path')) {
                                var recIndex = fileSystem.store.findExact('name', record.get('name'));
                                if (recIndex >= 0) {
                                    if (data.textStatus == 'success') {
                                        var rec = fileSystem.store.getAt(recIndex);
                                        if (rec) {                                            
                                            var currentPath = self.currentPath;
                                            if (currentPath == '/' || currentPath == '//') {
                                                currentPath = '';
                                            }
                                            var mapperUrl = 'http://global.mt.lldns.net/' + pathPrefix + '/' + record.get('name');
                                            var currentTime = new Date();
                                            rec.set('mtime', currentTime.format("UTC:mmm dd yyyy HH:MM:ss"));
                                            rec.set('mapperUrl', mapperUrl);
                                            rec.commit();
                                            //fileSystem.fileGrid.getView().refresh();
                                            fileSystem.store.reload();
                                        }
                                    }
                                    else {
                                        fileSystem.PendingOverwrite.each(function(pRec){
                                            if (pRec.get('path') == self.currentPath && pRec.get('name') == record.get('name')) {
                                                fileSystem.store.add(pRec);
                                            }
                                        });
                                        fileSystem.store.removeAt(recIndex);
                                    }
                                }
                            }
                        }
                    });
                });
            });
            
            
            $('#fileupload').bind('fileuploaddrop', function(e, data){
				var returnFalse = false;			
                $.each(data.files, function(index, file){
                    if (file.size > 104857600) {
                        new Ext.Window({
                            title: 'Notice',
                            padding: 10,
                            closeble: false,
                            shadow: false,
                            html: "<div style='font-size: 12px;'>Drag and drop support is limited to files less than 100MB in size. Please select '+ Add Files...' <div>",
                            listeners: {
                                afterrender: function(thisWindow){
                                    var win = thisWindow.getEl();
                                    win.pause(6).puff('t', {
                                        easing: 'easeOut',
                                        duration: 0.5,
                                        remove: true
                                    });
                                }
                            }
                        }).show();
                        returnFalse = true;						
						return false;
                    }
				});
				if (returnFalse){
					return false;
				}
                if (self.uploadMode == 'zip') {
                    if (self.uploadRunning == true) {
                        new Ext.Window({
                            title: 'Notice',
                            padding: 10,
                            closeble: false,
                            shadow: false,
                            html: "<div style='font-size: 12px;'>Please wait for current queue to complete before adding additional files.<div>",
                            listeners: {
                                afterrender: function(thisWindow){
                                    var win = thisWindow.getEl();
                                    win.pause(2).puff('t', {
                                        easing: 'easeOut',
                                        duration: 0.5,
                                        remove: true
                                    });
                                }
                            }
                        }).show();
                        return false;
                    }
                }
            });
            
            $('#fileupload').bind('fileuploadadd', function(e, data){            	
                if (self.uploadMode == 'zip') {
                    var size = 0;
                    $.each(data.files, function(index, file){
                        size = size + file.size;
                    });
                    var upRec = new Ext.data.Record({});
                    upRec.set('size', size);
                    upRec.set('name', self.selectedFilename + '.' + self.selectedType);
                    upRec.set('path', self.currentPath);
                    upRec.set('ctime', '-');
                    upRec.set('mtime', '-');
                    var existingIndex = fileSystem.store.find('name', self.selectedFilename);
                    if (existingIndex >= 0) {
                        var existingRec = fileSystem.store.getAt(existingIndex);
                        fileSystem.store.removeAt(existingIndex);
                        existingRec.set('path', self.currentPath);
                        fileSystem.PendingOverwrite.add(existingRec);
                    }
                    fileSystem.ProgressStore.add(upRec);
                    fileSystem.store.insert(0, upRec);
                }
                else {
                    $.each(data.files, function(index, file){                    	
                        var upRec = new Ext.data.Record({});
                        upRec.set('size', file.size);
                        upRec.set('name', file.name);
                        upRec.set('path', self.currentPath);
                        upRec.set('ctime', '-');
                        upRec.set('mtime', '-');
                        var existingIndex = fileSystem.store.find('name', file.name);
                        if (existingIndex >= 0) {
                            var existingRec = fileSystem.store.getAt(existingIndex);
                            fileSystem.store.removeAt(existingIndex);
                            existingRec.set('path', self.currentPath);
                            fileSystem.PendingOverwrite.add(existingRec);
                        }
                        fileSystem.ProgressStore.add(upRec);
                        fileSystem.store.insert(0, upRec);
                    });
                }                
            });            
            
            // Open download dialogs via iframes,
            // to prevent aborting current uploads:
            $('#fileupload .files a:not([target^=_blank])').live('click', function(e){
                e.preventDefault();
                $('<iframe style="display:none;"></iframe>').prop('src', this.href).appendTo('body');
            });
        });
    };
    
    this.updatePath = function(path){
    
    
        if (self.uploadMode == 'zip' && self.uploadRunning == false) {
            var zipPath = self.zipFolder + self.selectedFilename.replace('.zip', '');
            var formData = {};
            formData['destPath'] = path;
            formData['filePath'] = zipPath;
            formData['uploadMode'] = 'zip';
            $(function(){
                $('#fileupload').fileupload({
                    formData: formData
                });
            });
        }
        else {
            $('#fileupload').fileupload({
                formData: {
                    filePath: path
                }
            });
        }
    };
    
    
    this.Dropbox = new Ext.Panel({
        layout: 'fit',
        flex: 1,
        height: 200,
        title: 'Upload Queue',
        id: 'fileUploadPanel',
        items: [{
            xtype: 'panel',
            flex: 1,
            layout: 'fit',
            
            bbar: new Ext.Toolbar({
                items: [{
                    xtype: 'spacer',
                    width: 5
                }, {
                    xtype: 'radio',
                    name: 'uploadMethod',
                    boxLabel: 'Auto-Start',
                    id: 'rbUploadMethodAuto',
                    checked: true,
                    listeners: {
                        check: function(thisRb, checked){
                            if (checked) {
                                self.uploadMode = 'auto';
                                self.selectedPass = '';
                                $(function(){
                                    'use strict';
                                    $('#fileupload').fileupload({
                                        autoUpload: true,
                                        formData: {
                                            filePath: self.currentPath
                                        }
                                    });
                                    $('.start').click();
                                    $('.start').button('disable');
                                });
                            }
                        }
                    }
                }, {
                    xtype: 'spacer',
                    width: 10
                }, {
                    xtype: 'radio',
                    name: 'uploadMethod',
                    boxLabel: 'Zip',
                    id: 'rbUploadMethodZip',
                    listeners: {
                        check: function(thisRb, checked){
                            if (checked) {
                                self.uploadMode = 'zip';
                                var zipSettingsForm = new Ext.form.FormPanel({
                                    padding: 10,
                                    border: true,
                                    id: 'zipSettingsForm',
                                    frame: true,
                                    width: 460,
                                    labelWidth: 120,
                                    items: [{
                                        xtype: 'compositefield',
                                        width: 280,
                                        fieldLabel: 'Filename:',
                                        labelSeparator: '',
                                        items: [{
                                            width: 220,
                                            name: 'zipFilename',
                                            id: 'txtZipFilename',
                                            validator: checkFilename,
                                            allowBlank: false,
                                            xtype: 'textfield'
                                        }, {
                                            xtype: 'combo',
                                            width: 50,
                                            id: 'zipTypeCombo',
                                            mode: 'local',
                                            listWidth: 200,
                                            value: 'zip',
                                            triggerAction: 'all',
                                            displayField: 'name',
                                            tpl: new Ext.XTemplate('<tpl for="."><div class="search-item">', '<h3>{name}</h3>', '{value}', '</div></tpl>'),
                                            itemSelector: 'div.search-item',
                                            store: new Ext.data.ArrayStore({
                                                fields: ['name', 'value'],
                                                data: [['zip', 'more compatible, less secure'], ['7z', 'less compatible, more secure']]
                                            }),
                                            listeners: {
                                                select: function(cmb, rec){
                                                    var passtxt = Ext.getCmp('txtZipPassword');
                                                    if (rec.get('name') == 'zip') {
                                                        passtxt.emptyText = 'optional';
                                                        passtxt.allowBlank = true;
                                                        passtxt.setValue('');
                                                    }
                                                    else {
                                                        passtxt.emptyText = 'required';
                                                        passtxt.allowBlank = false;
                                                        passtxt.setValue('');
                                                    }
                                                }
                                            }
                                        }]
                                    }, {
                                        fieldLabel: 'Password Protect',
                                        width: 280,
                                        enableKeyEvents: true,
                                        id: 'txtZipPassword',
                                        validator: checkPassword,
                                        emptyText: 'optional',
                                        name: 'zipPassword',
                                        xtype: 'textfield',
                                        listeners: {
                                            keyup: function(thisTxt){
                                                if (thisTxt.getValue().length > 0) {
                                                    thisTxt.getEl().dom.type = "password";
                                                }
                                                else {
                                                    thisTxt.getEl().dom.type = "text";
                                                }
                                            }
                                        }
                                    }],
                                    buttons: [{
                                        text: 'Cancel',
                                        handler: function(){
                                            zipSettingsWindow.close();
                                            Ext.getCmp('rbUploadMethodAuto').setValue(true);
                                        }
                                    }, {
                                        text: 'Save',
                                        handler: function(){
                                            if (zipSettingsForm.getForm().isValid()) {
                                                self.selectedFilename = Ext.getCmp('txtZipFilename').getValue();
                                                var passField = Ext.getCmp('txtZipPassword');
                                                if (passField.getEl().dom.type == 'password') {
                                                    self.selectedPass = passField.getValue();
                                                }
                                                else {
                                                    self.selectedPass = '';
                                                }
                                                var zipPath = self.zipFolder + self.selectedFilename.replace('.zip', '');
                                                var formData = {};
                                                formData['destPath'] = self.currentPath;
                                                formData['filePath'] = zipPath;
                                                formData['uploadMode'] = 'zip';
                                                self.selectedType = Ext.getCmp('zipTypeCombo').getValue();
                                                zipSettingsWindow.close();
                                                $(function(){
                                                    $('#fileupload').fileupload({
                                                        formData: formData
                                                    });
                                                });
                                            }
                                        }
                                    }]
                                });
                                
                                var zipSettingsWindow = new Ext.Window({
                                    title: 'Zip Options',
                                    modal: true,
                                    items: [zipSettingsForm]
                                }).show();
                                $(function(){
                                    'use strict';
                                    $('.start').button('enable');
                                    $('#fileupload').fileupload({
                                        autoUpload: false
                                    });
                                });
                            }
                        }
                    }
                }]
            }),
            listeners: {
                afterrender: function(thisPanel){
                    thisPanel.load({
                        url: 'dropbox.html',
                        callback: startUploadScript,
                        //scope: yourObject, // optional scope for the callback
                        //discardUrl: false,
                        nocache: true,
                        text: 'Loading...'
                        //timeout: 30,
                        //scripts: true
                    });
                    
                    
                    var dragZone = new Ext.dd.DragZone(thisPanel.getEl(), {
                    
                        //      On receipt of a mousedown event, see if it is within a DataView node.
                        //      Return a drag data object if so.
                        getDragData: function(e){
                        
                            //          Use the DataView's own itemSelector (a mandatory property) to
                            //          test if the mousedown is within one of the DataView's nodes.
                            var sourceEl = e.getTarget(thisPanel.itemSelector, 10);
                            
                            
                            if (sourceEl) {
                                d = sourceEl.cloneNode(true);
                                d.id = Ext.id();
                            }
                        },
                        onDragEnter: function(){
                            alert();
                        },
                        //      Provide coordinates for the proxy to slide back to on failed drag.
                        //      This is the original XY coordinates of the draggable element captured
                        //      in the getDragData method.
                        getRepairXY: function(){
                            return this.dragData.repairXY;
                        }
                        
                    });
                }
            }
        }]
    });
    
    
}








