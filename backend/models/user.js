const mongoose = require("mongoose")

let userSchema = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    bookings: [
        {
          type: mongoose.Types.ObjectId,
          ref: "Movie",
        },
      ]

})

module.exports = mongoose.model("User", userSchema)