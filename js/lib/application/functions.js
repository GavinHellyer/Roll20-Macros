var notify = function(msg, type) {
    console.log(msg);
};

var ucfirst = function(str) {
    str += '';
    var f = str.charAt(0).toUpperCase();
    return f + str.substr(1);
};

var lcfirst = function(str) {
    str += '';
    var f = str.charAt(0).toLowerCase();
    return f + str.substr(1);
};

var ucwords = function(str) {
    return (str + '').replace(/^([a-z])|\s+([a-z])/g, function ($1) {
        return $1.toUpperCase();
    });
};