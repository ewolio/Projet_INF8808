function toPx(value){ return value.toString() + 'px'; } 

function sleep(ms){ return new Promise(resolve => setTimeout(resolve, ms)); }

function isFunction(functionToCheck) { return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]'; }
