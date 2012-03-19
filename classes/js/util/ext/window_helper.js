var lamaWindow = Ext.extend(Ext.Window, {

    constructor: function(config){                    
        var windowConfig = {
            minimizable: true,
            toolbar: undefined,			
            listeners: {
                minimize: function(thisWin){                    
                    this.toolbar.add({
						xtype: 'button',
						id: 'taskBarButton_'+thisWin,
                        text: thisWin.title,
                        iconCls: thisWin.iconCls,
                        scale: 'medium',
                        listeners: {
                            click: function(){
                                thisWin.show();
                            }
                        }
                    });
                    this.hide();
                    this.toolbar.doLayout();
                },
                close: function(thisWin){
					var btn = Ext.getCmp('taskBarButton_'+thisWin);
                    if (btn) {
                        this.toolbar.remove(btn);
                    }
                },
				show: function(thisWin){
					var btn = Ext.getCmp('taskBarButton_'+thisWin);
					if (btn){
						this.toolbar.remove(btn);
					}
				}
            }
        
        };
        Ext.apply(this, windowConfig);
        
        lamaWindow.superclass.constructor.call(this, config);
    }
});
