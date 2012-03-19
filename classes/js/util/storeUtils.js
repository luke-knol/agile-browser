var stores = new Array();
var storeNames = new Array();
var storeCount = 0;
var loadingCount = 0;
var maskOn = false;

function addStore(store, name){
    storeCheck(name);
    store.on({
		'beforeload' : {
			fn: function(){
				initLoadMask();
			},
			scope : this
		},
        'load': {
            fn: function(){
                isLoaded();
            },
            scope: this
        },
        'exception': {
            fn: function(){
                isLoaded();
            },
            scope: this
        }
    });
    
    storeNames.push(name);
    stores.push(store);
}

function refreshStores(){
    for (var i = 0; i < stores.length; i++) {
        stores[i].reload();
    }
}

function getStore(name){
    for (var i in storeNames) {
        if (storeNames[i] == name) {
            return stores[i];
        }
    }
}

function storeCheck(name){
    for (var i in storeNames) {
        if (storeNames[i] == name) {
            stores.remove(stores[i]);
        }
    }
	storeCount = stores.length;
}

function isLoaded(){
	loadingCount--;    	
    if (loadingCount <= 0) {
		maskOn = false;
        myMask.hide();
    }
}

function initLoadMask(){
	loadingCount++;
	if (!maskOn){
		myMask.show();
	}
}

