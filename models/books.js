const mongoose = require('mongoose');
const dateObj = new Date();
// dateObj.setHours(dateObj.getHours() + 5);
const formattedDate = dateObj.toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true });

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  body: {
    type: String,
    required: true,
  },
  createdAt:{
    type : String,
    default : formattedDate
  }
}
);

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
