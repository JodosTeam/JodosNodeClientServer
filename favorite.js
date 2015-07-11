var mongoose = require('mongoose')
  , Schema = mongoose.Schema;
 
var favoriteSchema = new Schema({
    name:  String,
    price: String,
    ItemUrl: String,
    Desc: String,
    UserId: String,

});
 
module.exports = mongoose.model('favorites', favoriteSchema);