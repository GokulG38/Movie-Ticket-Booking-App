const mongoose = require("mongoose")

const adminSchema = mongoose.Schema({
    
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    moviesAdded: [
        {
          type: mongoose.Types.ObjectId,
          ref: "Movie",
        },
      ]
})

module.exports = mongoose.model("Admin", adminSchema)