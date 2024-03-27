const express = require ('express')
const mongoose = require("mongoose")
const user = require("./routes/user")
const cors = require("cors")
const admin = require("./routes/admin")
const movies = require("./routes/movies")
const booking = require("./routes/booking")

const app = express()


mongoose.connect(process.env.MONGO_URL)
db = mongoose.connection
db.on('error',function(err){
    console.log(err)
})
db.once('open', function(){
    console.log("Connected to mongodb")
})
app.use(cors())
app.use(express.json())
app.use("/user",user)
app.use("/admin",admin)
app.use("/movies",movies)
app.use("/booking",booking)



app.get("/",function(req,res){
    res.send("Welcome to Movie Theatre")
})




app.listen(process.env.PORT,function(){
    console.log("Connected to port 5000")
})