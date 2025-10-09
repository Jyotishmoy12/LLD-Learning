class LazySingleTon {
  private static instance: LazySingleTon;

  private constructor() {}

  public static getInstance(): LazySingleTon {
    if (LazySingleTon.instance == null) {
      LazySingleTon.instance = new LazySingleTon();
    }
    return LazySingleTon.instance;
  }
}

//Checks if an instance already exists (instance == null).
//If not, it creates a new instance.
//If an instance already exists, it skips the creation step

/* 

We need the **private constructor** to prevent external instantiation, ensuring that only one instance of the class
can ever be created and accessed through `getInstance()`.

*/
