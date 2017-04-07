const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/solo')

let schema = new mongoose.Schema({
    item: String,
    maxPrice: String,
    minPrice: String
})

module.exports = mongoose.model('search', schema);