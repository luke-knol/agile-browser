function remove_empty_fields(fields){

    var newfields = new Array();
    
    for (var i in fields) {
		//why assign to a variable first? try it the other way and see :)		
		var check = fields[i]["value"];		
        if (check) {
			if (check != '' || check != " "){			
				    newfields.push(fields[i]);
			}				        
        }
    }
    
    return newfields;
}
