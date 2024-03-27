const express = require("express")
const Admin = require("../models/admin")
const bcrypt = require ("bcryptjs")
const router = express.Router()
const jwt = require("jsonwebtoken")

router.get("/", async function(req,res){
    try{
        const admin = await Admin.find()
        res.json(admin)
    }catch(error){
        console.log(error)
    }
})

router.post("/signup",async function(req,res){
    const {name, email, password} = req.body;
    if(
        (!email||email.trim()==="")||
        (!password || password.trim()==="")){
            res.json({message:"Invalid inputs"})
        }
        const hashedPassword = bcrypt.hashSync(password)
    const admin = new Admin({name, email, password:hashedPassword})
    try {
        await admin.save();
        res.status(200).json({message:"Admin added"});
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
})

router.post("/login", async function(req, res){
    let existingAdmin
    const { email, password } = req.body
    
    if (!email || !password) {
        res.status(400).json({ message: "Email and password are required." })
        return;
    }

    try {
        existingAdmin = await Admin.findOne({ email: email })
    } catch(error) {
        console.log(error)
    }

    if (!existingAdmin) {
        res.status(404).json({ message: "Unable to find admin" })
        return;
    }

    const isPassword = bcrypt.compareSync(password, existingAdmin.password)
    if (!isPassword) {
        res.status(400).json({ message: "Incorrect Password" })
        return;
    }

    const token = jwt.sign({ id: existingAdmin._id }, process.env.ADMIN_JWT_SECRET, {
        expiresIn: "7d",
    });

    res.status(200).json({ message: "Successfully logged in", id: existingAdmin._id, token })
})


router.get("/:id", async function(req,res){
    const id = req.params.id;
  let admin;
  try {
    admin = await Admin.findById(id).populate("moviesAdded");
  } catch (err) {
    return console.log(err);
  }
  if (!admin) {
    return res.status(500).json({ message: "Unexpected Error Occured" });
  }
  return res.status(200).json({ admin });
})

module.exports = router