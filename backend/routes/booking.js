const express = require("express");
const mongoose = require("mongoose");
const Book = require("../models/book");
const Movie = require("../models/movies");
const User = require("../models/user");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Razorpay = require("razorpay");
const shortid = require("shortid");
require("dotenv").config();

const userAuth = (req, res, next) => {
    const extractedToken = req.headers.authorization.split(" ")[1];
    if (!extractedToken || extractedToken.trim() === "") {
        return res.status(401).json({ message: "Token Not Found" });
    }

    jwt.verify(extractedToken, process.env.USER_JWT_SECRET, (err, decrypted) => {
        if (err) {
            return res.status(401).json({ message: "Invalid Token" });
        } else {
            req.userId = decrypted.id;
            next();
        }
    });
};

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
};

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_API_KEY,
    key_secret: process.env.RAZORPAY_API_SECRET,
});

router.post('/verification', async (req, res) => {
    const secret = process.env.WEBHOOK_SECRET;
    const crypto = require('crypto');
    const shasum = crypto.createHmac('sha256', secret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest('hex');

    if (digest === req.headers['x-razorpay-signature']) {
        try {
            const user = req.body.payload.payment.entity.notes.user;
            const movie = req.body.payload.payment.entity.notes.movie;
            const show = req.body.payload.payment.entity.notes.show;
            const numberOfTickets = parseInt(req.body.payload.payment.entity.notes.numberOfTickets);
            const paymentId = req.body.payload.payment.entity.id;
            const orderId = req.body.payload.payment.entity.order_id;
            const totalAmount = req.body.payload.payment.entity.amount;
            console.log(req.body.payload)

            if (isNaN(numberOfTickets) || numberOfTickets <= 0) {
                return res.status(400).json({ message: "Invalid number of tickets" });
            }

            const session = await mongoose.startSession();
            session.startTransaction();

            const existingMovie = await Movie.findById(movie).session(session);
            const existingUser = await User.findById(user).session(session);

            if (!existingMovie || existingMovie.disabled || !existingUser) {
                await session.abortTransaction();
                session.endSession();
                return res.status(404).json({ message: "Invalid movie or user" });
            }

            const existingShow = existingMovie.shows.find(sho => sho._id.toString() === show.toString());

            if (!existingShow || existingShow.availableSeats < numberOfTickets) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({ message: "Not enough available seats for booking" });
            }

            const booking = new Book({
                movie,
                showId: show,
                numberOfTickets,
                user,
                paymentId,
                orderId,
                totalAmount,
            });

            existingUser.bookings.push(booking);
            existingMovie.bookings.push(booking);
            existingShow.availableSeats -= numberOfTickets;

            await existingUser.save({ session });
            await existingMovie.save({ session });
            await booking.save({ session });

            await session.commitTransaction();
            session.endSession();

            return res.status(201).json({ booking });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    } else {
        return res.status(400).json({ message: "Invalid signature" });
    }
});


router.post('/razorpay', async (req, res) => {
    const { totalAmount, movie , showId, numberOfTickets } = req.body;
    const amount = totalAmount * 100;
    const currency = 'INR';
    const payment_capture = 1;
    console.log(totalAmount, movie, showId, numberOfTickets)

    try {
        const existingMovie = await Movie.findById(movie);
        if (!existingMovie || existingMovie.disabled) {

            return res.status(404).json({ message: "Invalid movie" });
        }

        const existingShow = existingMovie.shows.find(show => show._id.toString() === showId);
        if (!existingShow || existingShow.availableSeats < numberOfTickets) {


            return res.status(400).json({ message: "Not enough available seats for booking" });
        }

        const options = {
            amount,
            currency,
            receipt: shortid.generate(),
            payment_capture,
        };

        const response = await razorpay.orders.create(options);
        res.json({
            id: response.id,
            currency: response.currency,
            amount: response.amount,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


// router.post("/add", adminAuth, async (req, res) => {
//     const { movie, showId, numberOfTickets } = req.body;

//     try {
//         const parsedNumberOfTickets = parseInt(numberOfTickets);

//         if (isNaN(parsedNumberOfTickets) || parsedNumberOfTickets <= 0) {
//             return res.status(400).json({ message: "Invalid number of tickets" });
//         }

//         const session = await mongoose.startSession();
//         session.startTransaction();

//         const existingMovie = await Movie.findById(movie).session(session);
//         const existingUser = await User.findById(req.userId).session(session);

//         if (!existingMovie || existingMovie.disabled || !existingUser) {
//             await session.abortTransaction();
//             session.endSession();
//             return res.status(404).json({ message: "Invalid movie or user" });
//         }

//         const existingShow = existingMovie.shows.find(show => show._id.toString() === showId);

//         if (!existingShow || existingShow.availableSeats < parsedNumberOfTickets) {
//             await session.abortTransaction();
//             session.endSession();
//             return res.status(400).json({ message: "Not enough available seats for booking" });
//         }

//         const booking = new Book({
//             movie,
//             showId,
//             numberOfTickets: parsedNumberOfTickets,
//             user: req.userId,
//         });

//         existingUser.bookings.push(booking);
//         existingMovie.bookings.push(booking);
//         existingShow.availableSeats -= parsedNumberOfTickets;

//         await existingUser.save({ session });
//         await existingMovie.save({ session });
//         await booking.save({ session });

//         await session.commitTransaction();
//         session.endSession();

//         return res.status(201).json({ booking });
//     } catch (err) {
//         console.error(err);
//         return res.status(500).json({ message: "Internal Server Error" });
//     }
// });

router.get("/:id", userAuth || adminAuth, async (req, res) => {
    const userId = req.params.id;

    try {
        const booking = await Book.find({ user: userId });
        if (!booking || booking.length === 0 || booking[0].user.toString() !== userId) {
            return res.status(404).json({ message: "Booking not found or unauthorized" });
        }

        return res.status(200).json({ booking });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

router.put("/update/:id", adminAuth, async (req, res) => {
    const bookingId = req.params.id;
    const { showId, numberOfTickets } = req.body;

    try {
        const session = await mongoose.startSession();
        session.startTransaction();

        const booking = await Book.findById(bookingId).session(session);

        if (!booking || booking.user.toString() !== req.userId) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: "Booking not found or unauthorized" });
        }

        const parsedNumberOfTickets = parseInt(numberOfTickets);
        if (isNaN(parsedNumberOfTickets) || parsedNumberOfTickets < 0) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: "Invalid number of tickets" });
        }

        const movie = await Movie.findById(booking.movie).session(session);
        if (!movie) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: "Movie not found for this booking" });
        }

        const oldNumberOfTickets = booking.numberOfTickets;
        const ticketDifference = numberOfTickets - oldNumberOfTickets;
        const existingShow = movie.shows.find(show => show._id.toString() === showId);

        if (!existingShow || existingShow.availableSeats < ticketDifference) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: "Not enough available seats for the update" });
        }

        existingShow.availableSeats += oldNumberOfTickets;
        existingShow.availableSeats -= numberOfTickets;

        booking.showId = showId;
        booking.numberOfTickets = numberOfTickets;

        await movie.save({ session });
        await booking.save({ session });

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({ message: "Booking updated successfully", booking });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

router.delete("/delete/:id", adminAuth, async (req, res) => {
    const bookingId = req.params.id;
    const showId = req.params.showId;

    try {
        const session = await mongoose.startSession();
        session.startTransaction();

        const booking = await Book.findById(bookingId).session(session);
        if (!booking || booking.user.toString() !== req.userId) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: "Booking not found or unauthorized" });
        }

        const movie = await Movie.findById(booking.movie).session(session);
        if (!movie) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: "Movie not found for this booking" });
        }

        const show = movie.shows.find(show => show._id.toString() === showId);
        if (!show) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: "Show not found for this booking" });
        }

        show.availableSeats += booking.numberOfTickets;

        await booking.remove({ session });
        await movie.save({ session });

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({ message: "Booking deleted successfully" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = router;