
class Cat {

    constructor(public name : string) {}
    
    public eaten: boolean = false;
    
    public meow() {
        if (!this.eaten) {
            console.log(this.name + " meows");
        } else {
            console.log(this.name + " is not able to meow");
        }
    }
}

class Dog {
    
    constructor(public name) {}
    
    public eat(catToEat: Cat) {
        catToEat.eaten = true;
        console.log(this.name + " eats " + catToEat.name);
    }
}

var dog = new Dog("Spencer");
var cat = new Cat("Simon");

cat.meow();
dog.eat(cat);
cat.meow();