var selectedPath;

function refreshTree(tree){
    if (tree.getSelectionModel().getSelectedNode()) {
        selectedPath = tree.getSelectionModel().getSelectedNode().getPath();
    }
    tree.getRootNode().reload();
}

function restoreSelectedPath(tree){
    if (selectedPath) {
        try {
            tree.selectPath(selectedPath);
        } 
        catch (err) {
            //myMask.hide();
        }
    }
}


var nodeContextMenu = function(node, coords, inclusiveOptions, exclusiveOptions){

    var objectName = node.text;
    var objectType = node.attributes.object;
    var nodeType = node.attributes.type;
    
    var messageContextMenu = new Ext.menu.Menu({});
    if (objectType == 'brick') {
        if (exclusiveOptions === undefined || exclusiveOptions === null || exclusiveOptions === false) {
            exclusiveOptions = ['delete', 'mounts', 'update', 'restart'];
        }
        brick.BrickContextMenu(objectName, null, coords, false, node, inclusiveOptions, exclusiveOptions);
    }
    else 
        if (objectType == 'tag') {
            if (exclusiveOptions === undefined || exclusiveOptions === null || exclusiveOptions === false) {
                exclusiveOptions = ['delete', 'edit'];
            }
            tag.TagContextMenu(objectName, coords, false, node, inclusiveOptions, exclusiveOptions);
        }
        else 
            if (objectType == 'tagset') {
                if (exclusiveOptions === undefined || exclusiveOptions === null || exclusiveOptions === false) {
                    exclusiveOptions = ['delete', 'edit'];
                }
                tagset.TagsetContextMenu(objectName, coords, false, node, inclusiveOptions, exclusiveOptions);
            }
            else 
                if (objectType == 'policy') {
                    if (exclusiveOptions === undefined || exclusiveOptions === null || exclusiveOptions === false) {
                        exclusiveOptions = ['delete', 'edit'];
                    }
                    policy.PolicyContextMenu(objectName, coords, false, node, inclusiveOptions, exclusiveOptions);
                }
                else 
                    if (objectType == 'file') {
                        fileSystem.FileContextMenu(node, coords, inclusiveOptions);
                    }
                    else 
                        if (objectType == 'directory') {
                            fileSystem.DirectoryContextMenu(node, coords, inclusiveOptions);
                        }
                        else 
                            if (objectType == 'account') { 
                                if (nodeType == 'account') {
                                    account.AccountContextMenu(node, coords, inclusiveOptions);
                                }
                                else {
                                    account.MemberContextMenu(node, coords, inclusiveOptions);
                                }
                            }
                            else 
                                if (objectType == 'error') {
                                    var coords = e.getXY();
                                    e.stopEvent();
                                    
                                    
                                    var messageContextMenu = new Ext.menu.Menu({
                                        items: [{
                                            text: 'Show Error Details',
                                            iconCls: 'info-icon',
                                            listeners: {
                                                click: function(myButtonThis, e){
                                                    Ext.Msg.alert('Warning', node.attributes.errorMessage);
                                                }
                                            }
                                        }]
                                    });
                                    messageContextMenu.showAt([coords[0], coords[1]]);
                                    
                                    
                                }
};
