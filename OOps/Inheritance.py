# parent class with constructor named as Vehicle
class Vehicle:
    def __init__(self, color):
        self.color = color
    
    def honk(self):
        print("Beep! Beep!")


# child class named as Car which inherits from Vehicle

class Car(Vehicle):
    def __init__(self, color, speed):
        # call the constructor of the parent class using super
        super().__init__(color)
        self.speed = speed
    
    def accelerate(self):
        self.speed += 10
        

my_car = Car("Red", 0)
my_car.honk()

