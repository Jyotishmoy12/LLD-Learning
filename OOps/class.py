class Car:
    def __init__(self, make, model, year):
        self.make = make
        self.model = model
        self.year = year
    
    def start_engine(self):
        print(f"Starting engine for {self.make} {self.model} ({self.year})")
        

toyota_car = Car("Toyota", "Camry", 2022)
toyota_car.start_engine()

chevrolet_car = Car("Chevrolet", "Camaro", 2023)
chevrolet_car.start_engine()