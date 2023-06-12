const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  body: {
    type: String,
    required: true,
  }
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
