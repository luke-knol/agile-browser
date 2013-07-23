
function GetDataCenterCoords(pop){
    var points = new Object();
    points['HQ'] = Array(33.413859, -111.973552);
    points['LAX'] = Array(34.047237, -118.257598);
    points['DAL'] = Array(32.800325, -96.820064);
    points['ATL'] = Array(33.755436, -84.391584);
    points['LGA'] = Array(40.740494, -74.002018);
    points['IAD'] = Array(39.016208, -77.459289);
    points['ICN'] = Array(37.4138, 127.5183);
    points['LIN'] = Array(45.480262, 9.089932);
    points['MAD'] = Array(40.441994, -3.586331);
    points['MEX'] = Array(41.608569, -71.073548);
    points['PMO'] = Array(38.161665, 13.314826);
    points['YMQ'] = Array(45.497568, -73.571015);
    points['YVR'] = Array(49.259727, -123.040177);
    points['JNB'] = Array(-26.204103, 28.047305);
    points['ORD'] = Array(41.853045, -87.618333);
    points['HND'] = Array(35.553333, 139.781111);
    points['SEA'] = Array(47.614351, -122.338504);
    points['SJC'] = Array(37.241616, -121.782668);
    points['PHX2'] = Array(33.439147, -112.045339);
    points['MIA'] = Array(25.776235, -80.173556);
    points['AMS'] = Array(52.303075, 4.937673);
    points['ARN'] = Array(59.422471, 17.918073);
    points['FRF'] = Array(50.119402, 8.735451);
    points['HKG'] = Array(22.365655, 114.120262);
    points['LON'] = Array(51.511535, -0.002922);
    points['LCY'] = Array(51.520221, -0.073004);
    points['PAR'] = Array(48.856017, 2.383435);
    points['SIN'] = Array(1.295134, 103.790321);
    points['SYD'] = Array(-33.92139, 151.188205);
    points['TYO'] = Array(35.689488, 139.691706);
    points['YYZ'] = Array(43.644833, -79.383652);
    if (points[pop]) {
        return points[pop];
    }
    else {
        return points['PHX2'];
    }
    
}



// Convert numbers to words
// copyright 25th July 2006, by Stephen Chapman http://javascript.about.com
// permission to use this Javascript on your web page is granted
// provided that all of the code (including this copyright notice) is
// used exactly as shown (you can change the numbering system if you wish)

// American Numbering System
var th = ['', 'thousand', 'million', 'billion', 'trillion'];
// uncomment this line for English Number System
// var th = ['','thousand','million', 'milliard','billion'];

var dg = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
var tn = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
var tw = ['twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
function numberToWords(s){
    s = s.toString();
    s = s.replace(/[\, ]/g, '');
    if (s != parseFloat(s)) 
        return 'not a number';
    var x = s.indexOf('.');
    if (x == -1) 
        x = s.length;
    if (x > 15) 
        return 'too big';
    var n = s.split('');
    var str = '';
    var sk = 0;
    for (var i = 0; i < x; i++) {
        if ((x - i) % 3 == 2) {
            if (n[i] == '1') {
                str += tn[Number(n[i + 1])] + ' ';
                i++;
                sk = 1;
            }
            else 
                if (n[i] != 0) {
                    str += tw[n[i] - 2] + ' ';
                    sk = 1;
                }
        }
        else 
            if (n[i] != 0) {
                str += dg[n[i]] + ' ';
                if ((x - i) % 3 == 0) 
                    str += 'hundred ';
                sk = 1;
            }
        if ((x - i) % 3 == 1) {
            if (sk) 
                str += th[(x - i - 1) / 3] + ' ';
            sk = 0;
        }
    }
    if (x != s.length) {
        var y = s.length;
        str += 'point ';
        for (var i = x + 1; i < y; i++) 
            str += dg[n[i]] + ' ';
    }
    return str.replace(/\s+/g, ' ');
}


function displayErrorMessage(msg){
    Ext.Msg.alert('Warning', msg);
}

function basename(path, suffix){
    if (path == '') {
        return path;
    }
    var b = path.replace(/^.*[\/\\]/g, '');
    
    if (typeof(suffix) == 'string' && b.substr(b.length - suffix.length) == suffix) {
        b = b.substr(0, b.length - suffix.length);
    }
    
    return b;
}

function makeNumber(val){
    return Ext.util.Format.number(val, '0,000');
}

function roundtoN(x, n){
    var p = Math.pow(10, (n + 1));
    ans = x * p;
    ans = Math.round(ans / 10) + "";
    while (ans.length <= n) {
        ans = "0" + ans;
    }
    len = ans.length;
    ans = ans.substring(0, len - n) + "." + ans.substring(len - n, len);
    return ans;
}

/**
 * Convert number of bytes into human readable format
 *
 * @param integer bytes     Number of bytes to convert
 * @param integer precision Number of digits after the decimal separator
 * @return string
 */
function size_format(bytes, hideUnits, currentUnits){
    var precision = 2;
    var kilobyte = 1024;
    var megabyte = kilobyte * 1024;
    var gigabyte = megabyte * 1024;
    var terabyte = gigabyte * 1024;
    
    if (currentUnits) {
        if (currentUnits == 'MB') {
            bytes = bytes * 1048576;
        }
    }
    
    if ((bytes >= 0) && (bytes < kilobyte)) {
        if (hideUnits) {
            return bytes;
        }
        else {
            return bytes + ' B';
        }
        
    }
    else 
        if ((bytes >= kilobyte) && (bytes < megabyte)) {
            if (hideUnits) {
                return (bytes / kilobyte).toFixed(precision);
            }
            else {
                return (bytes / kilobyte).toFixed(precision) + ' KB';
            }
            
        }
        else 
            if ((bytes >= megabyte) && (bytes < gigabyte)) {
                if (hideUnits) {
                    return (bytes / megabyte).toFixed(precision);
                }
                else {
                    return (bytes / megabyte).toFixed(precision) + ' MB';
                }
                
            }
            else 
                if ((bytes >= gigabyte) && (bytes < terabyte)) {
                    if (hideUnits) {
                        return (bytes / gigabyte).toFixed(precision);
                    }
                    else {
                        return (bytes / gigabyte).toFixed(precision) + ' GB';
                    }
                    
                }
                else 
                    if (bytes >= terabyte) {
                        if (hideUnits) {
                            return (bytes / terabyte).toFixed(precision);
                        }
                        else {
                            return (bytes / terabyte).toFixed(precision) + ' TB';
                        }
                        
                    }
                    else {
                        if (hideUnits) {
                            return bytes;
                        }
                        else {
                            return bytes + ' B';
                        }
                    }
}

/*
 function size_format(size, hideUnits, currentUnits){
 if (currentUnits) {
 if (currentUnits == 'MB') {
 size = size * 1048576;
 }
 }
 
 if (size < 1024) {
 if (hideUnits) {
 return size;
 }
 else {
 return size + " B";
 }
 }
 else
 if (size < 1048576) {
 var ans = Math.round(((size * 10) / 1000)) / 10;
 if (hideUnits) {
 return ans;
 }
 else {
 return ans + " KB";
 }
 }
 else
 if (size < 1073741824) {
 var ans = Math.round(((size * 10) / 1000000)) / 10;
 if (hideUnits) {
 return ans;
 }
 else {
 return ans + " MB";
 }
 }
 else
 if (size < 1099511627776) {
 var ans = Math.round(((size * 100) / 1000000000)) / 100;
 //ans = roundtoN(ans, 1);
 if (hideUnits) {
 return ans;
 }
 else {
 return ans + ' GB';
 }
 }
 else {
 var ans = Math.round(((size * 100) / 1000000000000)) / 100;
 if (hideUnits) {
 return ans;
 }
 else {
 return ans + " TB";
 }
 }
 }
 */
function copyToClipboard(s){
    if (window.clipboardData && clipboardData.setData) {
        clipboardData.setData("Text", s);
    }
    else {
        // You have to sign the code to enable this or allow the action in about:config by changing
        user_pref("signed.applets.codebase_principal_support", true);
        netscape.security.PrivilegeManager.enablePrivilege('UniversalXPConnect');
        
        var clip = Components.classes['@mozilla.org/widget/clipboard;[[[[1]]]]'].createInstance(Components.interfaces.nsIClipboard);
        if (!clip) 
            return;
        
        // create a transferable
        var trans = Components.classes['@mozilla.org/widget/transferable;[[[[1]]]]'].createInstance(Components.interfaces.nsITransferable);
        if (!trans) 
            return;
        
        // specify the data we wish to handle. Plaintext in this case.
        trans.addDataFlavor('text/unicode');
        
        // To get the data from the transferable we need two new objects
        var str = new Object();
        var len = new Object();
        
        var str = Components.classes["@mozilla.org/supports-string;[[[[1]]]]"].createInstance(Components.interfaces.nsISupportsString);
        
        var copytext = meintext;
        
        str.data = copytext;
        
        trans.setTransferData("text/unicode", str, copytext.length * [[[[2]]]]);
        
        var clipid = Components.interfaces.nsIClipboard;
        
        if (!clip) 
            return false;
        
        clip.setData(trans, null, clipid.kGlobalClipboard);
    }
}


// Copyright © 2001 by Apple Computer, Inc., All Rights Reserved.
//
// You may incorporate this Apple sample code into your own code
// without restriction. This Apple sample code has been provided "AS IS"
// and the responsibility for its operation is yours. You may redistribute
// this code, but you are not permitted to redistribute it as
// "Apple sample code" after having made changes.

// email

function checkEmail(strng){
    var error = "";
    if (strng == "") {
        error = "You didn't enter an email address.\n";
    }
    
    var emailFilter = /^.+@.+\..{2,3}$/;
    if (!(emailFilter.test(strng))) {
        error = "Please enter a valid email address.\n";
    }
    else {
        //test email for illegal characters
        var illegalChars = /[\(\)\<\>\,\;\:\\\"\[\]]/;
        if (strng.match(illegalChars)) {
            error = "The email address contains illegal characters.\n";
        }
    }
    return error;
}


// phone number - strip out delimiters and check for 10 digits

function checkPhone(strng){
    var error = "";
    if (strng == "") {
        error = "You didn't enter a phone number.\n";
    }
    
    var stripped = strng.replace(/[\(\)\.\-\ ]/g, ''); //strip out acceptable non-numeric characters
    if (isNaN(parseInt(stripped))) {
        error = "The phone number contains illegal characters.";
        
    }
    if (!(stripped.length == 10)) {
        error = "The phone number is the wrong length. Make sure you included an area code.\n";
    }
    return error;
}


// password - between 6-8 chars, uppercase, lowercase, and numeral




function checkPassword(pwd){
    rgx = /\s/;
    if (rgx.test(pwd)) 
        return "Password may not contain spaces";
		
	return true;
}


// username - 4-10 chars, uc, lc, and underscore only.

function checkUsername(txtbox){
    var strng = txtbox.getValue();
    
    var error = true;
    if (strng == "") {
        txtbox.markInvalid("You didn't enter a username.");
    }
    strng = strng.toLowerCase();
    if (strng.search(/^[a-z]+/)) {
        txtbox.markInvalid("Username may only begin with a letter.");
    }
    var illegalChars = /[^a-zA-Z0-9_\-]/; // allow letters, numbers, and underscores
    if ((strng.length < 4) || (strng.length > 32)) {
        txtbox.markInvalid("Username must be between 4 and 32 characters.");
    }
    else 
        if (illegalChars.test(strng)) {
            txtbox.markInvalid("The username may only contain letters, numbers and dashes or underscores.");
        }
    
    var checkUnique = function(isUnique){
        if (!isUnique) {
            txtbox.markInvalid('Username unavailable');
        }
    };
    
    performAjax('account', 'checkUsername', {
        username: txtbox.getValue()
    }, null, null, checkUnique, true);
    
}

function checkFilename(strng){

    if (strng == "") {
        return "You didn't enter a filename.";
    }
    
    var illegalChars = /[^a-zA-Z0-9_\-\.]/; // allow letters, numbers, and underscores
    if (illegalChars.test(strng)) {
        return "Filename may only contain letters, numbers, dashes and underscores.";
    }
	return true;
}

function checkFoldername(strng){

    if (strng == "") {
        return "You didn't enter a name.";
    }
	
	rgx = /\//;
    if (rgx.test(strng))
    	return "Name may not contain forward slashes.";
    
	return true;
}

function checkFirstLastName(txtbox){

    var strng = txtbox.getValue();
    
    var illegalChars = /[^a-zA-Z0-9_\s\-]/; // allow letters, numbers, and underscores
    if (strng.length > 24) {
        txtbox.markInvalid('This field must be less than 24 characters.');
    }
    else 
        if (illegalChars.test(strng)) {
            txtbox.markInvalid('This field may only contain letters, numbers, dashes or underscores, and single spaces.');
        }
    return true;
}

function checkShortname(strng){
    var error = true;
    if (strng == "") {
        error = "You didn't enter a shortname.\n";
    }
    //strng = strng.toLowerCase();
    
    var illegalChars = /[^a-z]/; // allow letters, numbers, and underscores
    if ((strng.length < 2) || (strng.length > 24)) {
        error = "Shortname must be between 2 and 24 chars.\n";
    }
    else 
        if (illegalChars.test(strng)) {
            error = "Shortname may only contain lowercase letters.\n";
        }
    return error;
}

function checkOU(strng){
    var error = true;
    if (strng == "") {
        error = "You didn't enter an Organizational unit.\n";
    }
    strng = strng.toLowerCase();
    
    var illegalChars = /[^a-zA-Z0-9_\-\&\s]/; // allow letters, numbers, and underscores
    if ((strng.length < 2) || (strng.length > 24)) {
        error = "Organizational unit must be between 2 and 24 chars.\n";
    }
    else 
        if (illegalChars.test(strng)) {
            error = "Organizational unit may only contain letters, numbers, spaces, -, _, and &.\n";
        }
    return error;
}

function checkBrickName(strng){
    var error = true;
    if (strng == "") {
        error = "Field cannot be empty.\n";
    }
    
    var illegalChars = /[^a-zA-Z0-9_\-\.]/; // allow letters, numbers, and underscores and spaces
    if ((strng.length < 3) || (strng.length > 36)) {
        error = "Name must be between 3 and 36 chars.\n";
    }
    else 
        if (illegalChars.test(strng)) {
            error = "The name contains illegal characters.\n";
        }
    return error;
}

function checkName(strng){
    var error = true;
    if (strng == "") {
        error = "Field cannot be empty.\n";
    }
    
    var illegalChars = /[^a-zA-Z0-9_\-\s\.]/; // allow letters, numbers, and underscores and spaces
    if ((strng.length < 3) || (strng.length > 36)) {
        error = "Name must be between 3 and 36 chars.\n";
    }
    else 
        if (illegalChars.test(strng)) {
            error = "The name contains illegal characters.\n";
        }
    return error;
}


// non-empty textbox

function isEmpty(strng){
    var error = "";
    if (strng.length == 0) {
        error = "The mandatory text area has not been filled in.\n";
    }
    return error;
}

// was textbox altered

function isDifferent(strng){
    var error = "";
    if (strng != "Can\'t touch this!") {
        error = "You altered the inviolate text area.\n";
    }
    return error;
}

// exactly one radio button is chosen

function checkRadio(checkvalue){
    var error = "";
    if (!(checkvalue)) {
        error = "Please check a radio button.\n";
    }
    return error;
}

// valid selector from dropdown list

function checkDropdown(choice){
    var error = "";
    if (choice == 0) {
        error = "You didn't choose an option from the drop-down list.\n";
    }
    return error;
}
