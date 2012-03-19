Ext.QuickTips.init();

//Globals
var myMask;

function onReady(){
    main();
}

function main(){

    var loadingMask = Ext.get('loading-mask');
    var loading = Ext.get('loading');
    //  Hide loading message
    loading.fadeOut({
        duration: 0.2,
        remove: true
    });
    //  Hide loading mask
    loadingMask.setOpacity(0);
    loadingMask.fadeOut({
        xy: loading.getXY(),
        width: loading.getWidth(),
        height: loading.getHeight(),
        remove: true,
        duration: 0.5,
        opacity: 0.1,
        easing: 'easeOut'
    });
    
    
    //longer ajax timeout
    setAjaxTimeout(1800000, true);
    
	
	//references js "classes" not really classes just used for organization
    fileSystem = new FileSystem();    
    uploader = new Uploader();    
    directory = new Directory();
    Ext.QuickTips.init();
    
    //warns user if they have firebug open
	//feel free to leave firebug running for testing but will cause browser to hang on large uploads (>100mb)
    if (window.console && (window.console.firebug || window.console.exception)) {
        Ext.Msg.alert('Warning', 'Having Firebug enabled will significantly reduce site performance.');
    }
    
    myMask = new Ext.LoadMask(Ext.getBody(), {
        msg: "Please wait..."
    });
    
    Ext.Updater.defaults.showLoadIndicator = false;
    
    
    var sessionChecker = {
        run: function(){
            //check to make sure the user's session is still active.
            //if inactive user will be prompted to re-enter their creds
            session_check(sessionChecker, uploader.uploadRunning);
        },
        interval: 60000 //once a minute
    };
    
    Ext.TaskMgr.start(sessionChecker);
    
    
    var topPanel = new Ext.Panel({
        height: 100,
        layout: 'hbox',
        layoutConfig: {
            pack: 'start'
        },
        bodyStyle: 'background-color: transparent; padding: 2px',
        border: false,
        unstyled: true,
        width: 900,
        items: [{
            xtype: 'spacer',
            width: 5
        }, {
            border: false,
            xtype: 'panel',
            autoWidth: true,
			id: 'currentUserLabelPanelTxt',
            bodyStyle: 'background-color: transparent; text-align: left; padding: 1px',
            html: '<label style="color: #ccc;">Welcome:&nbsp</label><label style="color: #d0eb17;">' + currentUser + '</label>'
        }, {
            xtype: 'spacer',
            width: 5
        }, {
            border: false,
            bodyStyle: 'background-color: transparent; text-align: right; padding: 1px',
            html: '<label style="color: #bbb;">|</label>'
        }, {
            xtype: 'spacer',
            width: 5
        }, {
            border: false,
            xtype: 'panel',
            width: 43,
            bodyStyle: 'background-color: transparent; text-align: right; padding: 1px',
            html: '<label style="color: #ccc; cursor: pointer" onclick="session_logout()">Logout</label>'
        }, {
            xtype: 'spacer',
            width: 5
        }, {
            border: false,
            bodyStyle: 'background-color: transparent; text-align: right; padding: 1px',
            html: '<label style="color: #bbb;">|</label>'
        }, {
            xtype: 'spacer',
            width: 5
        }, {
            border: false,
            bodyStyle: 'background-color: transparent; text-align: right; padding: 1px',
            html: '<label style="color: #bbb;">v1.9.1</label>'
        }]
    });
    
    var firstTime = true;
    
    var outerViewport = new Ext.Viewport({
        layout: 'border',
        layoutConfig: {
            minWidth: 800,
            minHeight: 600
        },
        bodyStyle: 'background-color: transparent',
        items: [{
            region: 'north',
            layout: 'hbox',
            layoutConfig: {
                align: 'stretch',
                pack: 'start'
            },
            height: 70, // give north and south regions a height
            border: false,
            bodyStyle: 'background-color: transparent',
            items: [topPanel]
        }, centerPanel = new Ext.Panel({
            region: 'center',
            flex: 1,
            layout: 'hbox',
            layoutConfig: {
                align: 'stretch'
            },
            hideBorders: true,
            padding: '0 10 10 10',
            bodyStyle: 'background-color: transparent',
            border: false,
            items: [folderTabPanel = new Ext.TabPanel({
                activeTab: 0,
                unstyled: true,
                plain: true,
                flex: 1,
                hideMode: 'offsets',
                hideBorders: true,
                bodyStyle: 'background-color: transparent',
                forceLayout: true,
                defferedRender: false,
                border: true,
                items: [folderViewPanel = new Ext.Panel({
                    title: 'Folder Browser',
                    iconCls: 'folder-icon',
                    //bodyStyle: 'background-color: transparent',
                    border: true,
                    id: 'folderViewPanel',
                    layout: 'fit',
                    hideMode: 'offsets',
                    items: [fileSystem.Tree()]
                })]
            }), {
                xtype: 'spacer',
                width: 10
            }, {
                layout: 'vbox',
                border: false,
                flex: 5,
                bodyStyle: 'background-color: transparent',
                layoutConfig: {
                    align: 'stretch'
                },
                items: [fileTabPanel = new Ext.TabPanel({
                    activeTab: 0,
                    unstyled: true,
                    flex: 1,
                    bodyStyle: 'background-color: transparent',
                    plain: true,
                    hideMode: 'offsets',
                    hideBorders: true,
                    forceLayout: true,
                    defferedRender: false,
                    border: false,
                    items: [fileViewPanel = new Ext.Panel({
                        title: 'Object Browser',
                        iconCls: 'file-icon',
                        border: false,
                        bodyStyle: 'background-color: transparent',
                        layout: 'fit',
                        hideMode: 'offsets',
                        items: [{
                            layout: 'fit',
                            id: 'fileViewPanel',
                            items: [fileSystem.FilesGrid('/')]
                        }]
                    })]
                }), {
                    xtype: 'spacer',
                    height: 10
                }, {
                    xtype: 'panel',
                    layout: 'hbox',
                    border: false,
                    bodyStyle: 'background-color: transparent',
                    height: 250,
                    layoutConfig: {
                        align: 'stretch'
                    },
                    items: [new Ext.TabPanel({
                        activeTab: 0,
                        unstyled: true,
                        plain: true,
                        hideMode: 'offsets',
                        hideBorders: true,
                        forceLayout: true,
                        defferedRender: false,
                        border: false,
                        height: 250,
                        flex: 1,
                        items: [uploader.Dropbox]
                    }), {
                        xtype: 'panel',
                        width: 300,
                        layout: 'fit',
                        border: false,
                        bodyStyle: 'background-image: url(resources/images/uploadhelp.png); background-repeat:no-repeat; background-color: transparent'
                    }]
                }]
            }]
        })]
    });
    

}




