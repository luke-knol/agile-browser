var activeConnections = new Object;
var activeConnectionCount = 0;

function deleteObject(objType, id, store, store2){
    myMask.show();
    Ext.Ajax.request({
        url: "classes/php/custReqHandler.php?object=" + objType + "&action=delete",
        params: {
            id: id
        },
        success: function(response, a){
            myMask.hide();
            var o = Ext.decode(response.responseText);
            if (o.success == false) {
                displayErrorMessage(o.data);
            }
            else {
                if (store) {
                    store.reload();
                }
				if(store2){
					store2.reload();
				}
            }
            
        },
        failure: function(response, a){
            Ext.Msg.alert('Failure', a.result.data);
            myMask.hide();
        }
    });
}

function performAjax(objType, action, params, store, mask, callback, supressFailureMessage){
    if (mask) {
        mask.show();
    }
    Ext.Ajax.request({
        url: "classes/php/custReqHandler.php?object=" + objType + "&action=" + action,
        params: params,
        success: function(response, a){
            var o = Ext.decode(response.responseText);
            if (mask) {
                mask.hide();
            }
            if (o.success == false) {
                if (supressFailureMessage == undefined || supressFailureMessage == false) {
                    displayErrorMessage(o.data);
                }
                if (callback) {
                    callback(false);
                }
            }
            else {
                if (store) {
                    store.reload();
                }
                if (callback) {
                    callback(true, o);
                }
            }
            
            
        },
        failure: function(response, a){
            Ext.Msg.alert('Failure', a.result.data);
            if (mask) {
                mask.hide();
            }
            if (callback) {
                callback(false);
            }
        }
    });
}

function setAjaxTimeout(millisecs, supressWarning){

    if (!millisecs) {
        millisecs = 90000;
    }
	
	Ext.Ajax.on('beforerequest', function(){
		activeConnectionCount++;
		if(activeConnectionCount > 3){
			myMask.show();
		}
	});
    
    //set warning time
    if (!supressWarning) {
    
        if (millisecs > 60000) {
            var warning = millisecs / 2;
            
            Ext.Ajax.on('beforerequest', function(conn, opt){
                //conn.id;								
                var timeoutPrompt = function(){
                    Ext.Msg.confirm('Continue?', 'The LAMA is taking longer than expected to respond. Would you like to continue to wait or cancel your request?', function(btn, text){
                        if (btn == 'yes') {
                            //continue to wait... boring					        
                            runner.stop(task);
                        }
                        else {
                            runner.stop(task);
                            Ext.Ajax.abort();
                            myMask.hide();
                        }
                    });
                };
                var task = {
                    run: timeoutPrompt,
                    interval: 45000 //45 seconds
                };
                //activeConnections[conn.id] = task;
                //var runner = new Ext.util.TaskRunner();
                //runner.start(task);
            });
            
        }
    }
    
    Ext.Ajax.on('requestexception', function(){
		activeConnectionCount--;
		if(activeConnectionCount < 3){
			myMask.hide();
		}		        
        //delete visibileIds[5];
        Ext.Msg.alert('Alert!', 'Your request has timed out.  If you submitted data, assuming correctness your request will be processed. If you requested data please try again later.', {
            width: 300
        });
        
    });
    
    Ext.Ajax.on('requestcomplete', function(){
		activeConnectionCount--;
        if(activeConnectionCount < 3){
			myMask.hide();	
		}		       
    });
    
    Ext.Ajax.timeout = millisecs;
    
}

