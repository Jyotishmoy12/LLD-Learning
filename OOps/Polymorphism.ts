// The 'abstract' keyword defines a base class that cannot be instantiated directly.
// It's used as a blueprint for other classes.
abstract class Document {
  // An abstract method is declared without an implementation.
  // Any class that inherits from Document MUST provide an implementation for this method.
  abstract show(): string;
}

// Pdf inherits from Document and provides a concrete implementation for the 'show' method.
class Pdf extends Document {
  show(): string {
    return "Displaying PDF document";
  }
}

// Word also inherits from Document and provides its own implementation.
class Word extends Document {
  show(): string {
    return "Displaying Word document";
  }
}

// We create an array that holds objects of the base type 'Document'.
const docs: Document[] = [new Pdf(), new Word()];

// We can loop through the array and call the 'show' method on each object.
// The correct method implementation (either from Pdf or Word) is executed at runtime.
docs.forEach(doc => {
  console.log(doc.show());
});