const mongoose = require('mongoose');
const dateObj = new Date();
// dateObj.setHours(dateObj.getHours() + 5);
const formattedDate = dateObj.toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true });

const noteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    },
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

const note = mongoose.model('Note', noteSchema);

module.exports = note;
