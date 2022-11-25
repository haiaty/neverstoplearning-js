
//==================
// - A Generator function has the ability to stop and then continue later

function* generator(i){
    yield i;
    yield i+10;
}

// when this function is called it creates a Generator object
const gen = generator(10);

// Object [Generator] {}
console.log(gen);

// to take the first 'yield'
console.log(gen.next().value);
// expected output: 10

console.log("other logic here");

// to take the second 'yield'
console.log(gen.next().value);
console.log(gen.next().value);
// expected output: undefined


//================
// Other example
//==============

const foo = function*() {
    yield 'a';
    yield 'b';
    yield 'c';
};

let str = '';
for (const val of foo()) {
    str = str + val;
    console.log(str);
    console.log("other logic");
}

console.log(str);

/*
==================
INFINITE GENERATOR
====================
With a generator function, values are not evaluated until they are needed.
Therefore a generator allows us to define a potentially infinite data structure.
 */
function* infinite() {
    let index = 0;

    while (true) {
        yield index++;
    }
}

const infinitegenerator = infinite(); // "Generator { }"

console.log(infinitegenerator.next().value); // 0
console.log(infinitegenerator.next().value); // 1
console.log(infinitegenerator.next().value); //

//===================
// DIFFERENCE WITH OBSERVABLES
//======================
/*
https://stackoverflow.com/questions/48512319/what-is-the-difference-between-async-generators-and-observables
Judging from the proposed API descriptions:

observables can have multiple subscribers (broadcast), asynchronous iterators can only have a single reader (unicast)
observables push the events, while asynchronous iterators need to be polled
admittedly, the lazy nature of the Observable constructor does blur the lines
--

A Generator function has the ability to stop and then continue later. An Observable can also stop and continue later but you need to subscribe to it first for it to begin.

First Difference - A generator executes when that function is called. An Observable technically only begins to execute or emit values when you subscribe to it.
 */

