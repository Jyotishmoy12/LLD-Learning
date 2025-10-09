class Document:
    # Abstract method to be implemented by subclasses
    def show(self):
        raise NotImplementedError("Subclass must implement this abstract method")
    
class Pdf(Document):
    def show(self):
        return "Displaying PDF document"

class Word(Document):
    def show(self):
        return "Displaying Word document"
    
docs = [Pdf(), Word()]
for doc in docs:
    print(doc.show())