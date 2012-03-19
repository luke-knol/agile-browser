var FileSystem = function(){

    fs = this;

	//temporary stores files in the clipboard  
    this.ClipboardFiles = new Ext.data.Store({
        mode: undefined,
        path: undefined,
        sourceStore: undefined,
        fields: [{
            name: 'name'
        }, {
            name: 'size'
        }, {
            name: 'ctime'
        }, {
            name: 'mtime'
        }, {
            name: 'mapperUrl'
        }]
    });
	
	//preloads pasted files so they immediately show in the grid
	//this could likely be removed by reworking the timing of events tied to the ClipboardFiles store
	this.ToBePasted = new Ext.data.Store({        
        fields: [{
            name: 'name'
        }, {
            name: 'size'
        }, {
            name: 'ctime'
        }, {
            name: 'mtime'
        }, {
            name: 'mapperUrl'
        }]
    });
    	
    this.userStore = new Ext.data.Store({
        proxy: new Ext.data.HttpProxy({
            url: 'classes/php/custReqHandler.php?object=email&action=find'
        }),
        reader: new Ext.data.JsonReader({
            root: 'data',
            totalProperty: 'totalCount'
        }, [{
            name: 'cn',
            mapping: 'cn'
        }, {
            name: 'uid',
            mapping: 'uid'
        }])
    });
    
	//tracks the current path.. would like to remove this and replace with a function call or something
    this.CurrentPath = '/';
    
    this.Tree = function(){
    
        var treeLoader = new fileSystemTreeLoader({
            dataUrl: 'classes/php/custReqHandler.php',
            preloadChildren: false,
            requestMethod: "POST",
            pageSize: 100,
            pagingModel: 'local',
            listeners: {
                beforeload: function(treeLoader, node, callback){
                    treeLoader.baseParams.object = 'filesystem';
                    treeLoader.baseParams.action = 'listDirectories';
                    treeLoader.baseParams.dirID = node.attributes.did;
                    var path = node.getPath('name');
                    var start = path.indexOf('/', 2);
                    path = path.substr(start);
                    treeLoader.baseParams.path = path;
                }
                /* needs attention!! currently the API uses a cookie for paging rather than typical start / offset variables
                 * need to extend store to support this type of paging
                 ,
                 load: function(treeLoader, node, obj){
                 var serverResponse = Ext.decode(obj.responseText);
                 treeLoader.baseParams.dirCookie = serverResponse.dirCookie;
                 treeLoader.baseParams.fileCookie = serverResponse.fileCookie;
                 }
                 */
            }
        });
        
		//click timer is intended to help mitigate extra store loads for double clicks on folders
        var clickTimer = 0;
        var fileTree = new fileSystemTree({
            plugins: [new Ext.ux.tree.TreeNodeMouseoverPlugin()],
            loader: treeLoader,
            rootVisible: true,
            root: {
                nodeType: 'async',
                text: '/',
                name: '/',
                cookieStart: null,
                expanded: true,
                object: 'directory',
                format: 'node',
                iconCls: 'folder-icon',
                action: 'list',
                did: 'source',
                draggable: false,
                id: 'source'
            },
            listeners: {
                contextmenu: function(node, e){
                    nodeContextMenu(node, e);
                },
                click: function(node, e){
                    var time = new Date().getTime();
                    if ((time - clickTimer) < 200) {
                        clickTimer = 0;
                    }
                    else {
                        fs.DirectoryClick(node);
                        clickTimer = new Date().getTime();
                    }
                },
                beforenodedrop: {
                    fn: function(e){
                        myMask.show();
                        // e.data.selections is the array of selected records
                        if (Ext.isArray(e.data.selections)) {
                            var oldPath = fs.CurrentPath;
                            if (oldPath == '/') {
                                oldPath = '';
                            }
                            // reset cancel flag
                            e.cancel = false;
                            var files = [];
                            // setup dropNode (it can be array of nodes)                            
                            var newPath = e.target.getPath('name');
                            var start = newPath.indexOf('/', 2);
                            newPath = newPath.substr(start);
                            if (newPath == '/') {
                                newPath = '';
                            }
                            var r;
                            for (var i = 0; i < e.data.selections.length; i++) {
                                // get record from selectons
                                r = e.data.selections[i];
                                // create node from record data
                                var oPath = oldPath + '/' + r.get('name');
                                var nPath = newPath + '/' + r.get('name');
                                files.push([oPath, nPath]);
                            }
                            
                            var params = {
                                files: Ext.encode(files)
                            };
                            var removeFiles = function(success){
                                myMask.hide();
                                if (success) {
                                    var store = Ext.getCmp('filesGrid').store;
                                    if (store) {
                                        store.remove(e.data.selections);
                                    }
                                }
                            };
                            performAjax('filesystem', 'moveFiles', params, null, null, removeFiles);
                            
                            // 
                            return false;
                        }
                        
                        // if we get here the drop is automatically cancelled by Ext
                    }
                }
            }
        });
        
        return fileTree;
    };
    
    this.ProgressStore = new Ext.data.Store({
        fields: [{
            name: 'name'
        }, {
            name: 'size'
        }, {
            name: 'path'
        }, {
            name: 'ctime'
        }, {
            name: 'mtime'
        }, {
            name: 'mapperUrl'
        }]
    });
    
    this.PendingOverwrite = new Ext.data.Store({
        fields: [{
            name: 'name'
        }, {
            name: 'size'
        }, {
            name: 'path'
        }, {
            name: 'ctime'
        }, {
            name: 'mtime'
        }, {
            name: 'mapperUrl'
        }]
    });
    
    var renderTooltips = function(thisStore){
        thisStore.each(function(rec){
            new Ext.ToolTip({
                target: 'previewIcon_' + rec.id,
                html: 'Preview file - <i>if file type is not supported file will download</i>'
            
            });
            new Ext.ToolTip({
                target: 'downloadIcon_' + rec.id,
                html: 'Download file'
            });
        });
    };
    
    this.FilesGrid = function(path){
    
        fs.store = new Ext.data.JsonStore({
            fields: [{
                name: 'name'
            }, {
                name: 'ctime'
            }, {
                name: 'mtime'
            }, {
                name: 'size'
            }, {
                name: 'mapperUrl',
                sortType: function(value){
                    return value.toLowerCase();
                }
            }],
            url: 'classes/php/custReqHandler.php?object=filesystem&action=listFiles',
            baseParams: {
                path: path
            },
            listeners: {
                load: function(thisStore){
                    fs.ProgressStore.each(function(rec){
                        if (rec.get('path') == fs.CurrentPath) {
                            fs.store.insert(0, rec);
                        }
                    });
					fs.ToBePasted.each(function(rec){
						var existingIndex = thisStore.find('name', rec.get('name'));
						if(existingIndex >= 0){
							thisStore.removeAt(existingIndex);
						}
						thisStore.add(rec);						
					});
					fs.ToBePasted.removeAll();
                }
            }
        });
        
        var sizeRenderer = function(val){
            return size_format(val);
        };
        
        var renderLink = function(val, p, record){
            if (val) {
                var url = 'classes/php/forceDownload';
                url = Ext.urlAppend(url, 'path=' + escape(val));
                url = Ext.urlAppend(url, 'fileName=' + encodeURI(escape(record.get('name'))));
                return '<a href="#" onclick="x=window.open(' + "'" + val + "'" + ", '" + "newWindow1')" + '"' + '><img id="previewIcon_' + record.id + '" height="15" width="15" src="resources/images/icon-preview-gray.png"></a>&nbsp&nbsp<a href="#"  onclick="x=window.open(' + "'" + url + "'" + ", '" + "newWindow2')" + '"' + '><img height="15" width="15" id="downloadIcon_' + record.id + '" src="resources/images/icon_download_gray.png"></a>';
            }
            else {
                return '<img height="15" width="30" src="resources/images/uploading.gif">';
            }
        };
        
        fs.fileGrid = new Ext.grid.GridPanel({
            store: fs.store,
            enableDragDrop: true,
            id: 'filesGrid',
            ddGroup: 'grid2tree',
            layout: 'fit',
            tbar: new Ext.Toolbar({
                items: [{
                    icon: 'libs/ext/resources/images/gray/grid/refresh.gif',
                    width: 20,
                    tooltip: 'Refresh',
                    listeners: {
                        click: function(){
                            Ext.getCmp('fileBrowserSearchField').setValue('');
                            fs.store.load();
                        }
                    }
                }, {
                    xtype: 'textfield',
                    emptyText: 'Filter',
                    id: 'fileBrowserSearchField',
                    enableKeyEvents: true,
                    listeners: {
                        keyup: function(thisTxt, e){
                            if (thisTxt.getValue() == '') {
                                fs.store.clearFilter();
                            }
                            if (e.getKey() == e.ENTER) {
                                var searchRegex = thisTxt.getValue() + "(\\w*)+";
                                fs.store.filter('name', new RegExp(searchRegex, "i"));
                            }
                        }
                    }
                }, {
                    xtype: 'button',
                    iconCls: 'search-icon',
                    handler: function(){
                        var searchTxt = Ext.getCmp('fileBrowserSearchField');
                        var searchRegex = searchTxt.getValue() + "(\\w*)+";
                        fs.store.filter('name', new RegExp(searchRegex, "i"));
                    }
                }]
            }),
            getDragDropText: function(){
                var count = this.selModel.getCount();
                //return String.format(this.ddText, count, count == 1 ? '' : 's'); // <-- original code
                var txt = 'Move {0} selected file';
                if (count > 1) 
                    txt = txt + 's'; // <--  backward compatible
                return String.format(txt, count);
            },
            viewConfig: {
                forcefit: true
            },
            columns: [{
                header: "",
                width: 60,
                sortable: true,
                dataIndex: 'mapperUrl',
                renderer: renderLink
            }, {
                header: "File Name",
                width: 300,
                sortable: true,
                dataIndex: 'name',
                id: 'fileNameCol'
            }, {
                header: "Size",
                width: 75,
                sortable: true,
                dataIndex: 'size',
                renderer: sizeRenderer
            }, {
                header: "Created",
                width: 120,
                sortable: true,
                dataIndex: 'ctime'
            }, {
                header: "Modified",
                width: 120,
                sortable: true,
                dataIndex: 'mtime'
            }],
            autoExpandColumn: 'fileNameCol',
            stripeRows: true,
            loadMask: true,
            listeners: {
                cellcontextmenu: function(thisGrid, rowIndex, colIndex, e){
                    var coords = e.getXY();
                    e.stopEvent();
                    if (thisGrid.getSelectionModel().getCount() == 1) {
                        if (!thisGrid.getSelectionModel().isSelected(rowIndex)) {
                            thisGrid.getSelectionModel().selectRow(rowIndex);
                        }
                        if (colIndex != 0) {
                            var record = thisGrid.store.getAt(rowIndex);
                            fs.FileContextMenu(record, thisGrid.store, coords);
                        }
                    }
                    else {
                    
                        if (!thisGrid.getSelectionModel().isSelected(rowIndex)) {
                            thisGrid.getSelectionModel().selectRow(rowIndex);
                            var record = thisGrid.getStore().getAt(rowIndex);
                            fs.FileContextMenu(record, thisGrid.store, coords);
                        }
                        else {
                            var records = thisGrid.getSelectionModel().getSelections();
                            fs.MultiFileContextMenu(records, thisGrid.store, coords);
                        }
                        
                    }
                    
                },
                viewready: function(thisGrid){
                    var thisStore = thisGrid.getStore();
                    thisStore.on('datachanged', renderTooltips);                                        
                    thisStore.load();
                }
                
            }
        });
        
        
        return fs.fileGrid;
    };
    
    this.RenameForm = function(record){
    
        var oldName = record.get('name');
        
        var renameFormWindow = new Ext.Window({
            title: 'Rename file',
            iconCls: 'rename-icon-gray',
            layout: 'fit',
            modal: true,
            autoWidth: true
        });
        
        var renameForm = new Ext.form.FormPanel({
            url: 'classes/php/custReqHandler.php?object=filesystem&action=rename',
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
            items: [{
                name: 'newName',
                allowBlank: false,
                id: 'newFileNameTxt',
                value: oldName,
                fieldLabel: 'Name',
                validator: checkFoldername,
                listeners: {
                    specialkey: function(f, e){
                        if (e.getKey() == e.ENTER) {
                            if (renameForm.getForm().isValid()) {
                                renameForm.getForm().submit({
                                    params: {
                                        oldName: oldName,
                                        path: fs.CurrentPath
                                    },
                                    success: function(f, a){
                                        var newNameField = Ext.getCmp('newFileNameTxt');
                                        record.set('name', newNameField.getValue());
                                        record.commit();
                                        renameFormWindow.close();
                                    },
                                    failure: function(f, a){
                                        Ext.Msg.alert('Warning', a.result.data);
                                        renameFormWindow.close();
                                    }
                                });
                            }
                            else {
                                Ext.Msg.alert('Notice', "Please correct fields marked as invalid.");
                            }
                        }
                    }
                }
            }],
            buttons: [{
                text: 'Save',
                handler: function(){
                    if (renameForm.getForm().isValid()) {
                        renameForm.getForm().submit({
                            params: {
                                oldName: oldName,
                                path: fs.CurrentPath
                            },
                            success: function(f, a){
                                var newNameField = Ext.getCmp('newFileNameTxt');
                                record.set('name', newNameField.getValue());
                                record.commit();
                                renameFormWindow.close();
                            },
                            failure: function(f, a){
                                Ext.Msg.alert('Warning', a.result.data);
                                renameFormWindow.close();
                            }
                        });
                    }
                    else {
                        Ext.Msg.alert('Notice', "Please correct fields marked as invalid.");
                    }
                }
            }, {
                text: 'Cancel',
                handler: function(){
                    renameFormWindow.close();
                }
            }]
        
        });
        
        renameFormWindow.add(renameForm);
        renameFormWindow.show();
    };
    
    fileSystemTreeLoader = Ext.extend(Ext.ux.tree.PagingTreeLoader, {
    
        constructor: function(config){
        
            var loaderConfig = {
                dataUrl: 'classes/php/custReqHandler.php',
                pageSize: 100,
                enableTextPaging: false,
                enableLastButton: false,
                pagingModel: 'local'
            };
            
            Ext.apply(this, loaderConfig);
            fileSystemTreeLoader.superclass.constructor.apply(this, arguments);
        }
    });
    
    
    
    
    fileSystemTree = Ext.extend(Ext.tree.TreePanel, {
    
        constructor: function(config){
        
            var treeConfig = {
                useArrows: true,
                plugins: [new Ext.ux.tree.TreeNodeMouseoverPlugin()],
                autoScroll: true,
                layout: 'fit',
                ddAppendOnly: true,
                animate: true,
                enableDD: true,
                ddGroup: 'grid2tree',
                rootVisible: false,
                containerScroll: true,
                root: {
                    nodeType: 'async',
                    text: 'Ext JS',
                    draggable: false,
                    id: 'source'
                }
            };
            Ext.apply(this, treeConfig);
            
            fileSystemTree.superclass.constructor.apply(this, arguments);
        }
    });
    
    
    this.DirectoryContextMenu = function(node, evt, options){
    
        var coords = evt.getXY();
        evt.stopEvent();
        
        var path = node.getPath('name');
        var start = path.indexOf('/', 2);
        path = path.substr(start);
        
        var menuOptions = new Object();
        
        menuOptions['create'] = {
            text: 'Create new directory',
            iconCls: 'folder-icon',
            listeners: {
                click: function(myButtonThis, e){
                    var reloadNode = function(){
                        node.attributes.children = null;
                        node.reload();
                    };
                    directory.Form(reloadNode, path);
                }
            }
        };
        
        var disabled = true;
        var pasteText = "Paste";
        var mode = undefined;
        var clipboardCount = fs.ClipboardFiles.getCount();
        if (clipboardCount > 0) {
            var disabled = false;
            mode = fs.ClipboardFiles.mode;
            pasteText = "Paste " + clipboardCount + " " + mode + " files";
            if (clipboardCount == 1) {
                pasteText = "Paste " + mode + " file";
            }
        }
        
        
        menuOptions['paste'] = {
            text: pasteText,
            iconCls: 'paste-icon-gray',
            disabled: disabled,
            listeners: {
                click: function(myButtonThis, e){
                    var files = [];                    
					var records = [];
                    fs.ClipboardFiles.each(function(record){                        
                        files.push(record.get('name'));
						records.push(record);
                    });
                    var params = {
                        files: Ext.encode(files),
                        oldPath: fs.ClipboardFiles.path,
                        newPath: path,
                        mode: fs.ClipboardFiles.mode
                    };
                    var updateStores = function(success){
                        if (success) {
                            if (fs.ClipboardFiles.mode == 'cut') {
								fs.ClipboardFiles.sourceStore.remove(records);
                            }
							fs.ToBePasted.add(records);
							fs.ClipboardFiles.removeAll();
							fs.ClipboardFiles.sourceStore = undefined;
							fs.ClipboardFiles.mode = undefined;
                            fileTabPanel.setActiveTab(0);
                            var filePanel = Ext.getCmp('fileViewPanel');
                            filePanel.removeAll();
                            var path = node.getPath('name');
                            var start = path.indexOf('/', 2);
                            path = path.substr(start);
                            uploader.updatePath(path);
                            uploader.currentPath = path;
                            fs.CurrentPath = path;
                            filePanel.add(fs.FilesGrid(path));
                            filePanel.doLayout();
                            node.select();
                        }
                    };
                    performAjax('filesystem', 'paste', params, null, null, updateStores);
                }
            }
        };
        
        
        menuOptions['refresh'] = {
            text: 'Refresh',
            iconCls: 'reload-icon',
            listeners: {
                click: function(myButtonThis, e){
                    node.attributes.children = null;
                    node.reload();
                }
            }
        };
        
        if (path != '/' && node.id != 'source') {
            menuOptions['delete'] = {
                text: 'Delete',
                iconCls: 'delete-icon',
                listeners: {
                    click: function(myButtonThis, e){
                        Ext.Msg.confirm('Warning', 'Really delete directory?', function(btn, text){
                            if (btn == 'yes') {
                                var parentNode = node.parentNode;
                                var params = {
                                    path: path
                                };
                                var reloadNode = function(success){
                                    if (success) {
                                        parentNode.attributes.children = null;
                                        parentNode.reload();
                                    }
                                };
                                performAjax('filesystem', 'deleteDirectory', params, null, null, reloadNode);
                            }
                        });
                    }
                }
            };
        }
        
        
        var messageContextMenu = new Ext.menu.Menu({});
        if (options) {
            while (options.length > 0) {
                var option = options.shift();
                messageContextMenu.add(menuOptions[option]);
            }
        }
        else 
            if (node.id == 'source') {
                messageContextMenu.add(menuOptions['refresh']);
                messageContextMenu.add(menuOptions['create']);
            }
            else {
                for (option in menuOptions) {
                    if (option != 'remove') {
                        messageContextMenu.add(menuOptions[option]);
                    }
                }
            }
        
        messageContextMenu.showAt([coords[0], coords[1]]);
    };
    
    
    this.DirectoryClick = function(node, evt){
        fileTabPanel.setActiveTab(0);
        var filePanel = Ext.getCmp('fileViewPanel');
        filePanel.removeAll();
        var path = node.getPath('name');
        var start = path.indexOf('/', 2);
        path = path.substr(start);
        uploader.updatePath(path);
        uploader.currentPath = path;
        fs.CurrentPath = path;
        filePanel.add(fs.FilesGrid(path));
        filePanel.doLayout();
        
    };
    
	
	//this is the context menu which shows up if one record is selected when a right click is performed
    this.FileContextMenu = function(record, store, coords, options){
    
        var fileName = record.get('name');
        
        var menuOptions = new Object();
        
		/* temporarily commented out until API fix is pushed to support this
		 * planned to be part of 2.0.1 release		 
        menuOptions['copy'] = {
            text: 'Copy file',			
            iconCls: 'copy-icon-gray',
            listeners: {
                click: function(myButtonThis, e){
                    var recordCopy = record.copy();
                    var currentPath = fs.CurrentPath;
                    fs.ClipboardFiles.mode = 'copied';
                    fs.ClipboardFiles.path = currentPath;
                    fs.ClipboardFiles.sourceStore = store;
                    fs.ClipboardFiles.removeAll();
                    fs.ClipboardFiles.add(recordCopy);
                }
            }
        };
        */
        
        
		
        
        menuOptions['cut'] = {
            text: 'Cut file',
            iconCls: 'cut-icon-gray',
            listeners: {
                click: function(myButtonThis, e){
                    var recordCopy = record.copy();
                    var currentPath = fs.CurrentPath;
                    fs.ClipboardFiles.mode = 'cut';
                    fs.ClipboardFiles.sourceStore = store;
                    fs.ClipboardFiles.path = currentPath;
                    fs.ClipboardFiles.removeAll();
                    fs.ClipboardFiles.add(recordCopy);
                }
            }
        };
        
		
		
        menuOptions['rename'] = {
            text: 'Rename file',
            iconCls: 'rename-icon-gray',
            listeners: {
                click: function(myButtonThis, e){
                    var path = fs.CurrentPath;
                    if (path == '/') {
                        path = '';
                    }
                    var path = path + '/' + fileName;
                    fs.RenameForm(record);
                }
            }
        };
        
        
        menuOptions['open'] = {
            text: 'Share Links',
            iconCls: 'tibet-icon',
            listeners: {
                click: function(myButtonThis, e){
                    var path = fs.CurrentPath;
                    if (path == '/') {
                        path = '';
                    }
                    var path = path + '/' + fileName;
                    
                    var fileShareMask;
                    
                    var shareUrlForm = new Ext.form.FormPanel({
                        padding: 10,
                        border: true,
                        url: 'classes/php/custReqHandler.php',
                        id: 'fileShareForm',
                        frame: true,
                        width: 560,
                        labelWidth: 100,
                        items: [{
                            xtype: 'fieldset',
                            title: 'Send Email',
                            items: [{
                                xtype: 'combo',
                                store: fs.userStore,
                                displayField: 'uid',
                                fieldLabel: 'To',
                                typeAhead: false,
                                loadingText: 'Searching...',
                                name: 'emailAddr',
                                width: 380,
                                allowBlank: false,
                                vtype: 'email',
                                vtypeText: 'Please enter a valid email address',
                                minChars: 2,
                                pageSize: 10,
                                hideTrigger: true,
                                tpl: new Ext.XTemplate('<tpl for="."><div class="search-item">', '<h3>{cn}</h3>', '{uid}', '</div></tpl>'),
                                itemSelector: 'div.search-item'
                            }, {
                                fieldLabel: 'Message',
                                width: 380,
                                name: 'msgBody',
                                emptyText: 'Email Message (optional)',
                                xtype: 'textarea'
                            }, {
                                xtype: 'radiogroup',
                                fieldLabel: 'Share',
                                items: [{
                                    boxLabel: 'Direct',
                                    name: 'rbShare',
                                    fieldLabel: '',
                                    labelSeparator: '',
                                    inputValue: 1
                                }, {
                                    boxLabel: 'TinyURL',
                                    name: 'rbShare',
                                    fieldLabel: '',
                                    labelSeparator: '',
                                    inputValue: 2
                                }, {
                                    boxLabel: 'Both',
                                    name: 'rbShare',
                                    fieldLabel: '',
                                    labelSeparator: '',
                                    checked: true,
                                    inputValue: 3
                                }]
                            }],
                            buttons: [{
                                text: 'Send',
                                handler: function(){
                                    if (shareUrlForm.getForm().isValid()) {
                                        shareUrlForm.getForm().submit({
                                            submitEmptyText: false,
                                            params: {
                                                object: 'email',
                                                action: 'send',
                                                fileName: fileName
                                            },
                                            success: function(){
                                                downloadWindow.close();
                                                var successWindow = new Ext.Window({
                                                    title: 'Success',
                                                    padding: 20,
                                                    shadow: false,
                                                    html: "<div>Email sent. You have been bcc'd a copy of the message.<div>",
                                                    listeners: {
                                                        afterrender: function(thisWindow){
                                                            var win = thisWindow.getEl();
                                                            win.pause(2.5).puff('t', {
                                                                easing: 'easeOut',
                                                                duration: 0.5,
                                                                remove: true
                                                            });
                                                        }
                                                    }
                                                }).show();
                                            },
                                            failure: function(){
                                                Ext.Msg.alert('Error', 'Email failed to send.  Please report this issue to lknol@llnw.com');
                                            }
                                        });
                                    }
                                    else {
                                        Ext.Msg.alert('Notice', 'Please enter a valid email address');
                                    }
                                }
                            }]
                        }, {
                            xtype: 'fieldset',
                            title: 'Copy Links',
                            items: [{
                                fieldLabel: 'Direct Link',
                                xtype: 'textfield',
                                width: 380,
                                readOnly: true,
                                name: 'mapperUrl'
                            }, {
                                fieldLabel: 'TinyURL Link',
                                xtype: 'textfield',
                                width: 380,
                                readOnly: true,
                                name: 'tinyUrl'
                            }]
                        }],
                        listeners: {
                            afterrender: function(){
                                fileCheckMask = new Ext.LoadMask('fileShareForm', {
                                    msg: "Please wait..."
                                });
                                fileCheckMask.show();
                            }
                        }
                    });
                    
                    shareUrlForm.getForm().load({
                        params: {
                            object: 'filesystem',
                            action: 'shareUrls',
                            path: path,
                            fileName: fileName
                        },
                        success: function(){
                            fileCheckMask.hide();
                        },
                        failure: function(){
                            fileCheckMask.hide();
                        }
                    });
                    
                    var downloadWindow = new Ext.Window({
                        title: 'Sharing Options',
                        iconCls: 'tibet-icon',
                        autoHeight: true,
                        modal: true,
                        resizable: false,
                        width: 570,
                        items: [shareUrlForm]
                    }).show();
                    
                }
            }
        };
        
        menuOptions['delete'] = {
            text: 'Delete',
            iconCls: 'delete-icon',
            listeners: {
                click: function(myButtonThis, e){
                    Ext.Msg.confirm('Warning', 'Really delete file?', function(btn, text){
                        fs.ClipboardFiles.removeAll();
                        if (btn == 'yes') {
                            var path = fs.CurrentPath;
                            if (path == '/') {
                                path = '';
                            }
                            var path = path + '/' + fileName;
                            var params = {
                                path: path
                            };
                            var removeFile = function(success){
                                if (success) {
                                    if (store) {
                                        store.remove(record);
                                    }
                                }
                            };
                            performAjax('filesystem', 'deleteFile', params, null, null, removeFile);
                        }
                        else {
                            // abort, abort!
                        }
                    });
                }
            }
        };
        var messageContextMenu = new Ext.menu.Menu({});
        if (options) {
            while (options.length > 0) {
                var option = options.shift();
                messageContextMenu.add(menuOptions[option]);
            }
        }
        else {
            for (option in menuOptions) {
                if (option != 'remove') {
                    messageContextMenu.add(menuOptions[option]);
                }
            }
        }
        
        messageContextMenu.showAt([coords[0], coords[1]]);
    };
    
	
	//this is the context menu which shows up if multiple records are selected when a right click is performed
    this.MultiFileContextMenu = function(records, store, coords, options){
    
        var path = fs.CurrentPath;
        if (path == '/') {
            path = '';
        }
        var files = [];
        Ext.each(records, function(rec){
            var filePath = path + '/' + rec.get('name');
            files.push(filePath);
        });
        
        var showPlaylist = false;
        var mappers = [];
		//checks to see if all selected files are mp3s
		//also builds a list of urls for the selected assets
        Ext.each(records, function(rec){
            var filename = rec.get('name');
            var ext = filename.substr(filename.lastIndexOf('.') + 1);
            if (ext == 'mp3') {
                showPlaylist = true;
            }
            var mapperPath = rec.get('mapperUrl');
            mappers.push(mapperPath);
        });
        
        var menuOptions = new Object();
        
		/*
        menuOptions['copy'] = {
            text: 'Copy ' + files.length + ' files',						
            iconCls: 'copy-icon-gray',
            listeners: {
                click: function(myButtonThis, e){
                    var currentPath = fs.CurrentPath;
                    //var recordCopy = record.copy();
					fs.ClipboardFiles.sourceStore = store;
                    fs.ClipboardFiles.mode = 'copied';
                    fs.ClipboardFiles.path = currentPath;
                    fs.ClipboardFiles.removeAll();
                    fs.ClipboardFiles.add(records);
                }
            }
        };
        */
        
        
		
        menuOptions['cut'] = {
            text: 'Cut ' + files.length + ' files',
            iconCls: 'cut-icon-gray',
            listeners: {
                click: function(myButtonThis, e){
                    var currentPath = fs.CurrentPath;
                    //var recordCopy = record.copy();			
					fs.ClipboardFiles.sourceStore = store;		
                    fs.ClipboardFiles.mode = 'cut';
                    fs.ClipboardFiles.path = currentPath;
                    fs.ClipboardFiles.removeAll();
                    fs.ClipboardFiles.add(records);
                }
            }
        };
        
        
        menuOptions['delete'] = {
            text: 'Delete Selected Files',
            iconCls: 'delete-icon',
            listeners: {
                click: function(myButtonThis, e){
                    Ext.Msg.confirm('Warning', 'Really delete files? This cannot be undone.', function(btn, text){
                        if (btn == 'yes') {
                            var params = {
                                files: Ext.encode(files)
                            };
                            var removeFile = function(success){
                                if (success) {
                                    if (store) {
                                        store.remove(records);
                                    }
                                }
                            };
                            performAjax('filesystem', 'deleteFiles', params, null, null, removeFile);
                        }
                        else {
                            // abort, abort!
                        }
                    });
                }
            }
        };
        
        
        if (showPlaylist) {			
            menuOptions['playlist'] = {
                text: 'Generate Playlist',
                iconCls: 'play-icon',
                listeners: {
                    click: function(myButtonThis, e){
                        var params = {
                            files: Ext.encode(mappers),
                            path: path
                        };
                        var reload = function(success){
                            if (success) {
                                if (store) {
                                    store.reload();
                                }
                            }
                        };
                        performAjax('filesystem', 'playlist', params, null, null, reload);
                    }
                }
            };           
        }
        
        
        var messageContextMenu = new Ext.menu.Menu({});
        if (options) {
            while (options.length > 0) {
                var option = options.shift();
                messageContextMenu.add(menuOptions[option]);
            }
        }
        else {
            for (option in menuOptions) {
                if (option != 'remove') {
                    messageContextMenu.add(menuOptions[option]);
                }
            }
        }
        
        messageContextMenu.showAt([coords[0], coords[1]]);
    };
};
