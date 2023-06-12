const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  body: {
    type: String,
    required: true,
  },
  createdAt:{
    type : Date,
    default : Date.now
  }
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
