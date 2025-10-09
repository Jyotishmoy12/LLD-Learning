class BankAccount {
  // Using 'private' enforces true encapsulation, unlike Python's underscore convention.
  // These properties cannot be accessed directly from outside the class.
  private accountNumber: string;
  private balance: number;

  constructor(accountNumber: string, balance: number) {
    this.accountNumber = accountNumber;
    this.balance = balance;
  }

  deposit(amount: number): void {
    this.balance += amount;
  }

  withdraw(amount: number): void {
    if (this.balance >= amount) {
      this.balance -= amount;
    } else {
      console.log("Insufficient funds");
    }
  }

  getBalance(): number {
    return this.balance;
  }
}