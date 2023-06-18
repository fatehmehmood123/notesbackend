const mongoose = require('mongoose');

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
  createdAt: {
    type: String,
    default: function() {
      const dateObj = new Date();
      const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
        timeZone: 'Asia/Karachi',
      };
      return dateObj.toLocaleDateString("en-US", options);
    },
  },
});

const note = mongoose.model('Note', noteSchema);

module.exports = note;
