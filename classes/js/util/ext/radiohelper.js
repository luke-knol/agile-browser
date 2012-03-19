function returnBoolRadio(label){

    var groupName = label.split(' ').join('').toLowerCase();
    
    var boolRadio = {
        xtype: 'radiogroup',
        required: true,
        fieldLabel: label,
        items: [{
            boxLabel: 'Yes',
            name: groupName,
            inputValue: 'yes'
        }, {
            boxLabel: 'No',
            name: groupName,
            inputValue: 'no'
        }]
    };
    
    return boolRadio;
}

function returnEnumRadio(label, optionsArray){

    var groupName = label.split(' ').join('').toLowerCase();
    
    var enumRadio = {
        xtype: 'radiogroup',
        required: true,
        fieldLabel: label,
        items: getRadios(optionsArray)
    };
    
    function getRadios(options){
        radios = new Array();
        for (var i = 0; i < options.length; i++) {
            radios.push({
                boxLabel: options[i],
                name: groupName,
                inputValue: options[i]
            })
        };
        return radios;
    }
    
    return enumRadio;
}