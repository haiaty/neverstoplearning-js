

# Classes

Just like functions, there are two ways to define a class in javascript: Class expression and class declaration

## Class Declaration

To declare a class, you use the classkeyword with the name of the class

```js
class person {}
```
One important thing to note here is that unlike function declarations, class declarations **can’t be hoisted**. You first need to declare your class and then access it, otherwise you get a ReferenceError:

```js
let chuks = new person(); // ReferenceError

class person {}
```

# Class expressions

A class expression is another way to define a class. Class expressions can be named or unnamed. The name given to a named class expression is local to the class’s body.

```js
//unnamed
let person = class {
    constructor() {
    } 
}
//named 
let person = class person {
    constructor () {
    }
}
```

Its important to note that Class expressions also suffer from the same hoisting issues mentioned for Class declarations.

# Constructor

The constructor method is a special method for creating and initializing an object created with a class. There can only be one special method with the name "constructor" in a class.

```js
class person {
    constructor (name, dob) {
        this.name = name;
        this.dob = dob;
    }
}
```

# Static Methods

Static methods are often used to create utility functions for an application. In ES5 it looks like a basic property on a constructor function.

```js
function person () {}
person.compare = function (a,b) {}
```

And the new shiny static syntax looks like this:

```js
class person {
    static (a,b) {}
}
```

Static methods are called without instantiating their class and cannot be called through a class instance.

Under the covers, JavaScript is still just adding a property to the personconstructor, it just ensures that the method is in fact static. Note that you can also add static value properties.

# Extending Classes

The extends keyword is used in class declarations or class expressions to create a class as a child of another class.

```js
class person{
  constructor(name,dob){
    this name= name;
    this year = year;
  }
  make() {
    return this._name;
  }
  year() {
    return this._dob;
  }
  toString() {
    return `${this.name}${thi.dob}`
  }
}

class gender extends person { 
    male(){
        console.log(this.name + " is a dude")
    }
}

let chuks = new gender("chuks", 2017)
chuks.male()
Super class
```

To call a parent constructor you simply use the super keyword as a function, eg super(name, dob). For all other functions, use super as an object, eg super.toString(). Here’s what the updated example looks like:

```js
class Gender extends person {
    toString() {
        return 'male' + super.toString();
    }
}
```js

At this time, there isn’t any advantage to using classes over prototypes other than better syntax.

# Resources

[Understanding ES6 Classes](https://hashnode.com/post/understanding-es6-classes-cj0dqw75w003mf7537mcwqrxh)
