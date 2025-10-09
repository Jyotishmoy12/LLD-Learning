class BankAccount:
    def __init__(self, account_number, balance):
        # Encapsulation example with private variables
        self._account_number = account_number
        self._balance = balance
    
    def deposit(self, amount):
        self._balance += amount
        
    def withdraw(self, amount):
        if self._balance >= amount:
            self._balance -= amount
        else:
            print("Insufficient funds")
            
    def get_balance(self):
        return self._balance