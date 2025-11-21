const mongoose = require('mongoose');

// Children do NOT require `url`
const childSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  description: String,
  url: String,
  children: []        // temporary placeholder 
}, { _id: false });

// Add recursive children reference AFTER initial definition
childSchema.add({
  children: [childSchema]   // ✔ correct recursive structure
});

// Parent schema requires `url`
const documentSchema = mongoose.Schema({
   id: { type: String, required: true },
   name: { type: String, required: true  },
   description: String,
   url: { type: String, required: true },
   children: [childSchema]   // ✔ correctly references recursive child schema
});

module.exports = mongoose.model('Document', documentSchema);