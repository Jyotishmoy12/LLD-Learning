class Car {
  make: string;
  model: string;
  year: number;

  constructor(make: string, model: string, year: number) {
    this.make = make;
    this.model = model;
    this.year = year;
  }

  startEngine(): void {
    console.log(`Starting engine for ${this.make} ${this.model} (${this.year})`);
  }
}

const toyotaCar = new Car("Toyota", "Camry", 2022);
toyotaCar.startEngine();

const chevroletCar = new Car("Chevrolet", "Camaro", 2023);
chevroletCar.startEngine();