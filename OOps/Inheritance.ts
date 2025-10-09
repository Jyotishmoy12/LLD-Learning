// parent class with constructor named as Vehicle
class Vehicle{
    color:string;

    constructor(color:string){
        this.color = color
    }
    honk():void{
        console.log("Beep! Beep!")
    }
}

// child class named as Car
class Car extends Vehicle{
    speed:number;

    constructor(color:string, speed:number){
        // Call the constructor of the parent class (Vehicle) using super
        super(color)
        this.speed = speed
    }

    accelerate():void{
        this.speed += 10
    }
}

const MyCar = new Car("Red", 0)
MyCar.honk()