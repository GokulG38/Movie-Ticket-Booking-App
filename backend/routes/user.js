const express = require("express")
const router = express.Router()
const User = require("../models/user")
const Book = require("../models/book")
const bcrypt = require ("bcryptjs")
const jwt = require("jsonwebtoken")


router.get("/", async function(req,res){
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
})

router.post("/signup",async function(req,res){
    const {name, email, password} = req.body;
    if((!name || name.trim()==="")||
        (!email||email.trim()==="")||
        (!password || password.trim()==="")){
            res.json({message:"Invalid inputs"})
        }
        const hashedPassword = bcrypt.hashSync(password)
    const user = new User({name, email, password:hashedPassword})
    try {
        await user.save();
        res.status(200).json({message:"User added"});
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
})


router.put("/update/:id", async function(req,res){
    const id = req.params.id
    const {name, email, password} = req.body;
    if((!name || name.trim()==="")||
        (!email||email.trim()==="")||
        (!password || password.trim()==="")){
            res.json({message:"Invalid inputs"})
        }
    const hashedPassword = bcrypt.hashSync(password)
    let user
    try{
    user = await User.findByIdAndUpdate(id,{name, email, password:hashedPassword})
    }catch(error){ return console.log(error)}
    if( !user){
        res.status(500).json({message:"something went wrong"})
    }else{
        res.status(200).json({message:"Updated succesfully"})
    }
        
})

router.delete("/delete/:id", async function(req,res){
    const id = req.params.id
    let user
    try{
        user = await User.findByIdAndDelete(id);
    }catch(error){
        return console.log(error)
    }

    if(!user){
        res.status(500).json({message:"something went wrong"})
    }else{
        res.status(200).json({message:"Deleted Successfully"})
    }
})


router.post("/login", async function(req,res){
    let existingUser
    const { email, password } = req.body
    
    if (!email || !password) {
        res.status(400).json({ message: "Email and password are required." })
        return;
    }

    try {
        existingUser = await User.findOne({ email: email })
    } catch(error) {
        console.log(error)
    }

    if (!existingUser) {
        res.status(404).json({ message: "Unable to find user" })
        return;
    }

    const isPassword = bcrypt.compareSync(password, existingUser.password)
    if (!isPassword) {
        res.status(400).json({ message: "Incorrect Password" })
        return;
    }

    const token = jwt.sign({ id: existingUser._id }, process.env.USER_JWT_SECRET, {
        expiresIn: "7d",
    });

    res.status(200).json({ message: "Successfully logged in", id: existingUser._id, token })
})

router.get("/:id", async function(req,res){
    const id = req.params.id;
  let user;
  try {
    user = await User.findById(id);
  } catch (err) {
    return console.log(err);
  }
  if (!user) {
    return res.status(500).json({ message: "Unexpected Error Occured" });
  }
  return res.status(200).json({ user });
})

router.get("/bookings/:id", async function(req, res){
    const id = req.params.id;
    let bookings
    try{
        bookings = await Book.find({user:id}).populate("movies user")
    }catch (err) {
        return console.log(err);
      }
      if (!bookings) {
        return res.status(500).json({ message: "Unable to get Bookings" });
      }
      return res.status(200).json({ bookings });
    }

)

module.exports = router

