class DoubleCheckedSingleton {
  // The single instance, initially null
  private static instance: DoubleCheckedSingleton;
  private static isCreating = false;

  private constructor() {}

  public static getInstance(): DoubleCheckedSingleton {
    // First check (not synchronized)
    if (DoubleCheckedSingleton.instance == null) {
      // Simple lock mechanism
      if (!DoubleCheckedSingleton.isCreating) {
        DoubleCheckedSingleton.isCreating = true;
        // Second check (synchronized)
        if (DoubleCheckedSingleton.instance == null) {
          DoubleCheckedSingleton.instance = new DoubleCheckedSingleton();
        }
        DoubleCheckedSingleton.isCreating = false;
      }
    }
    // Return the instance (either newly created or existing)
    return DoubleCheckedSingleton.instance;
  }
}

/*
If the first check (instance == null) passes, we synchronize on the class object.
We check the same condition one more time because multiple threads may have passed the first check.
The instance is created only if both checks pass.

*/
