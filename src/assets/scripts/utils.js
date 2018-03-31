function toPx(value){ return value.toString() + 'px'; } 

function sleep(ms){ return new Promise(resolve => setTimeout(resolve, ms)); }

function isFunction(functionToCheck) { return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]'; }

function argmin( a ) {
	var len = a.length, min = a[0], id=0, val;
	for ( var i = 1; i < len; i++ ) {
		val = a[i];
        if (!isNaN(val) && (isNaN(min) || val < min)) {
			min=val;
			id=i;
		}
	}
	return id;
}
