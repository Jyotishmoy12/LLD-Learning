/*

Singleton Design Pattern
Ashish
Ashish Pratap Singh
6 min read
In software development, we often require classes that can only have one object.

Example: thread pools, caches, loggers etc.

Creating more than one objects of these could lead to issues such as incorrect program behavior, overuse of resources, or inconsistent results.

This is where Singleton Design Pattern comes into play.


It is one of the simplest design patterns, yet challenging to implement correctly.

In this article, we will explore what it is, different ways you can implement it Java, real-world examples where it’s used and it’s pros and cons.

What is Singleton Pattern?
Singleton Pattern is a creational design pattern that guarantees a class has only one instance and provides a global point of access to it.

It involves only one class which is responsible for instantiating itself, making sure it creates not more than one instance.

To implement the singleton pattern, we must prevent external objects from creating instances of the singleton class. Only the singleton class should be permitted to create its own objects.

Additionally, we need to provide a method for external objects to access the singleton object.

Class Diagram
In Java, one of the ways to implement Singleton is by making the constructor private and providing a static method for external objects to access it.


The instance class variable holds the one and only instance of the Singleton class.
The Singleton() constructor is declared as private, preventing external objects from creating new instances.
The getInstance() method is a static class method, making it accessible to the external world.
Implementation
There are several ways to implement the Singleton Pattern in Java, each with its own advantages and disadvantages.

Lets explore 7 of the most common methods.

1. Lazy Initialization
This approach creates the singleton instance only when it is needed, saving resources if the singleton is never used in the application.


Java

Python

C++

C#

Typescript





class LazySingleton {
    // The single instance, initially null
    private static instance: LazySingleton;

    // Private constructor to prevent instantiation
    private constructor() {}

    // Public method to get the instance
    public static getInstance(): LazySingleton {
        if (LazySingleton.instance == null) {
            LazySingleton.instance = new LazySingleton();
        }
        return LazySingleton.instance;
    }
}
Checks if an instance already exists (instance == null).
If not, it creates a new instance.
If an instance already exists, it skips the creation step.
Warning

This implementation is not thread-safe. If multiple threads call getInstance() simultaneously when instance is null, it's possible to create multiple instances.

2. Thread-Safe Singleton
This approach is similar to lazy initialization but also ensures that the singleton is thread-safe.

This is achieved by making the getInstance() method synchronized ensuring only one thread can execute this method at a time.

When a thread enters the synchronized method, it acquires a lock on the class object. Other threads must wait until the method is executed.
*/

class ThreadSafeSingleTon {
  private static instance: ThreadSafeSingleTon;
  private static isCreating = false;

  private constructor() {}

  public static getInstance(): ThreadSafeSingleTon {
    if (ThreadSafeSingleTon.instance == null) {
      if (ThreadSafeSingleTon.isCreating) {
        // wait for the creation to complete
        while (ThreadSafeSingleTon.isCreating) {
          // wait
        }
        return ThreadSafeSingleTon.instance;
      }
      ThreadSafeSingleTon.isCreating = true;
      if (ThreadSafeSingleTon.instance == null) {
        ThreadSafeSingleTon.instance = new ThreadSafeSingleTon();
      }
      ThreadSafeSingleTon.isCreating = false;
    }
    return ThreadSafeSingleTon.instance;
  }
}
