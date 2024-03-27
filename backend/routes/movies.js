const express = require("express");
const Movies = require("../models/movies");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Admin = require("../models/admin");

const adminAuth = (req, res, next) => {
    const extractedToken = req.headers.authorization.split(" ")[1];
    if (!extractedToken || extractedToken.trim() === "") {
        return res.status(404).json({ message: "Token Not Found" });
    }

    jwt.verify(extractedToken, process.env.ADMIN_JWT_SECRET, (err, decrypted) => {
        if (err) {
            return res.status(400).json({ message: `${err.message}` });
        } else {
            req.adminId = decrypted.id;
            next();
        }
    });
}

router.get("/", async function (req, res) {
    try {
        const movies = await Movies.find();
        return res.json(movies);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

router.get("/:id", async function (req, res) {
    const id = req.params.id;
    try {
        const movie = await Movies.findById(id);
        if (!movie) {
            return res.status(404).json({ message: "Movie not found" });
        }
        return res.status(200).json({ movie });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

router.post("/add", adminAuth, async function (req, res) {
    const { title, description, posterUrl, starring, disabled, ticketPrice, shows } = req.body;
    if (!Number.isFinite(ticketPrice) || ticketPrice <= 0) {
        return res.status(400).json({ message: "Invalid ticket price" });
    }
    if (!title || !description || !posterUrl || !starring|| !Array.isArray(shows)) {
        return res.status(400).json({ message: "Invalid inputs" });
    }
    const isValidShowsArray = shows.every(show => {
        return show.showTime && new Date(show.showTime).toString() !== 'Invalid Date' && Number.isInteger(show.availableSeats) && show.availableSeats >= 0;
    });

    if (!isValidShowsArray) {
        return res.status(400).json({ message: "Invalid shows array format" });
    }
    try {
        const adminUser = await Admin.findById(req.adminId);
        if (!adminUser) {
            return res.status(404).json({ message: "Admin not found" });
        }

        const movie = new Movies({ title, description, posterUrl, starring, disabled,ticketPrice, shows });
        await movie.save();

        adminUser.moviesAdded.push(movie);
        await adminUser.save();

        res.status(200).json({ message: "Movie added" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.put("/update/:id", adminAuth, async function (req, res) {
    try {
        const id = req.params.id;
        const { title, description, posterUrl, starring, disabled, ticketPrice, shows } = req.body;
        if (!Number.isFinite(ticketPrice) || ticketPrice <= 0) {
            return res.status(400).json({ message: "Invalid ticket price" });
        }
        if (!title || !description || !posterUrl || !starring|| !Array.isArray(shows)) {
            return res.status(400).json({ message: "Invalid inputs" });
        }
        const isValidShowsArray = shows.every(show => {
            return show.showTime && new Date(show.showTime).toString() !== 'Invalid Date' && Number.isInteger(show.availableSeats) && show.availableSeats >= 0;
        });
    
        if (!isValidShowsArray) {
            return res.status(400).json({ message: "Invalid shows array format" });
        }
        const movie = await Movies.findByIdAndUpdate(id, { title, description, posterUrl, starring, disabled, ticketPrice, shows });
        if (!movie) {
            return res.status(404).json({ message: "Movie not found" });
        }
        res.status(200).json({ message: "Movie updated" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.delete("/:id", adminAuth, async function (req, res) {
    try {
        const id = req.params.id;
        const movie = await Movies.findById(id);
        if (!movie) {
            return res.status(404).json({ message: "Movie not found" });
        }
        const adminUser = await Admin.findById(req.adminId);
        if (!adminUser) {
            return res.status(404).json({ message: "Admin not found" });
        }
        const index = adminUser.moviesAdded.indexOf(id);
        if (index !== -1) {
            adminUser.moviesAdded.splice(index, 1);
        }

        await adminUser.save();
        await Movies.findByIdAndDelete(id);

        res.status(200).json({ message: "Movie deleted" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = router;