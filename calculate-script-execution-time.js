//==============
// FIRST WAY
//==================

const start = Date.now();
	// ...
const duration = Date.now() - start;


console.log(duration);


//==============
// SECOND WAY
//==================

const {performance} = require('perf_hooks');

const start = performance.now(); // returns something like 138.899999998509884, which means 138.9 milliseconds passed
	// ...
const duration = performance.now() - start;

console.log(duration + "ms");
