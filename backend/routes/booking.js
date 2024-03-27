
const express = require("express");
const Book = require("../models/book");
const Movie = require("../models/movies");
const User = require("../models/user");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Razorpay = require("razorpay")
const shortid = require("shortid")
require("dotenv").config()


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
}
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_API_KEY,
    key_secret: process.env.RAZORPAY_API_SECRET
})


router.post('/verification', async(req, res) => {

	const secret = process.env.WEBHOOK_SECRET;
    console.log(req.body.payload.payment.entity.notes.user)
    const user = req.body.payload.payment.entity.notes.user;
    const movie = req.body.payload.payment.entity.notes.movie;
    const show = req.body.payload.payment.entity.notes.show;
    const numberOfTickets = req.body.payload.payment.entity.notes.numberOfTickets;
    const paymentId = req.body.payload.payment.entity.id;
    const orderId = req.body.payload.payment.entity.order_id
    const totalAmount = req.body.payload.payment.entity.amount


	const crypto = require('crypto')

	const shasum = crypto.createHmac('sha256', secret)
	shasum.update(JSON.stringify(req.body))
	const digest = shasum.digest('hex')

	console.log(digest, req.headers['x-razorpay-signature'])

	if (digest === req.headers['x-razorpay-signature']) {
		console.log('request is legit')
		console.log(req.body)

        try {
            const parsedNumberOfTickets = parseInt(numberOfTickets);
    
            if (isNaN(parsedNumberOfTickets) || parsedNumberOfTickets <= 0) {
                return res.status(400).json({ message: "Invalid number of tickets" });
            }
    
    
            const existingMovie = await Movie.findById(movie);
            const existingUser = await User.findById(user);
    
            if (!existingMovie || existingMovie.disabled || !existingUser) {
                return res.status(404).json({ message: "Invalid movie or user" });
            }
            const existingShow = existingMovie.shows.find(sho => sho._id.toString() === show.toString());
    
            console.log(existingShow)
            if (existingShow.availableSeats <=0||existingShow.availableSeats < parsedNumberOfTickets) {
                return res.status(400).json({ message: "Not enough available seats for booking" });
            }
    
            const booking = new Book({
                movie,
                showId:show,
                numberOfTickets: parsedNumberOfTickets, 
                user,
                paymentId,
                orderId,
                totalAmount
            });
            existingUser.bookings.push(booking);
            existingMovie.bookings.push(booking);
            existingShow.availableSeats -= parsedNumberOfTickets;
            await existingUser.save();
            await existingMovie.save();
            await booking.save();
    
            return res.status(201).json({ booking });
        } catch (err) {
            console.log(err);
            return res.status(500).json({ message: "Internal Server Error" });
        }
        
	} else {
        console.log("no")
	}
	res.json({ status: 'ok' })
})


router.post('/razorpay', async (req, res) => {
    console.log(process.env.RAZORPAY_API_KEY)
    const { totalAmount} = req.body;
    const amount = totalAmount * 100;
    const currency = 'INR';
	const payment_capture = 1


	const options = {
		amount,
		currency,
		receipt: shortid.generate(),
		payment_capture
	}

	try {
		const response = await razorpay.orders.create(options)
		console.log(response)

		res.json({
			id: response.id,
			currency: response.currency,
			amount: response.amount
		})
	} catch (error) {
		console.log(error)
	}
})


router.post("/add", adminAuth, async function (req, res) {
    const { movie, showId, numberOfTickets } = req.body;

    try {
        const parsedNumberOfTickets = parseInt(numberOfTickets);

        if (isNaN(parsedNumberOfTickets) || parsedNumberOfTickets <= 0) {
            return res.status(400).json({ message: "Invalid number of tickets" });
        }


        const existingMovie = await Movie.findById(movie);
        const existingUser = await User.findById(req.userId);

        if (!existingMovie || existingMovie.disabled || !existingUser) {
            return res.status(404).json({ message: "Invalid movie or user" });
        }
        const existingShow = existingMovie.shows.find(show => show._id.toString() === showId);


        if (existingShow.availableSeats <=0||existingShow.availableSeats < parsedNumberOfTickets) {
            return res.status(400).json({ message: "Not enough available seats for booking" });
        }

        const booking = new Book({
            movie,
            showId,
            numberOfTickets: parsedNumberOfTickets, 
            user: req.userId
        });
        existingUser.bookings.push(booking);
        existingMovie.bookings.push(booking);
        existingShow.availableSeats -= parsedNumberOfTickets;
        await existingUser.save();
        await existingMovie.save();
        await booking.save();

        return res.status(201).json({ booking });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

router.get("/:id", userAuth||adminAuth, async function (req, res) {
    const userId = req.params.id;

    try {
        const booking = await Book.find({ user: userId });
        if (!booking || booking.length === 0 || booking[0].user.toString() !== userId) {
            return res.status(404).json({ message: "Booking not found or unauthorized" });
        }

        return res.status(200).json({ booking });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});


router.put("/update/:id", adminAuth, async function (req, res) {
    const bookingId = req.params.id;
    const { showId, numberOfTickets } = req.body;

    try {
        const booking = await Book.findById(bookingId);

        if (!booking || booking.user.toString() !== req.userId) {
            return res.status(404).json({ message: "Booking not found or unauthorized" });
        }

        const parsedNumberOfTickets = parseInt(numberOfTickets);
        if (isNaN(parsedNumberOfTickets) || parsedNumberOfTickets < 0) {
            return res.status(400).json({ message: "Invalid number of tickets" });
        }
        const movie = await Movie.findById(booking.movie);
        if (!movie) {
            return res.status(404).json({ message: "Movie not found for this booking" });
        }

        const oldNumberOfTickets = booking.numberOfTickets;
        const ticketDifference = numberOfTickets - oldNumberOfTickets;
        existingShow = movie.shows.find(show => show._id.toString() === showId)
        if (existingShow.availableSeats < ticketDifference) {
            return res.status(400).json({ message: "Not enough available seats for the update" });
        }
        existingShow.availableSeats += oldNumberOfTickets;
        existingShow.availableSeats -= numberOfTickets;

        booking.date = date;
        booking.numberOfTickets = numberOfTickets;

        await movie.save();
        await booking.save();

        return res.status(200).json({ message: "Booking updated successfully", booking });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

router.delete("/delete/:id", adminAuth, async function (req, res) {
    const bookingId = req.params.id;
    const showId = req.params.showId
    try {
        const booking = await Book.findById(bookingId);
        if (!booking || booking.user.toString() !== req.userId) {
            return res.status(404).json({ message: "Booking not found or unauthorized" });
        }

        const movie = await Movie.findById(booking.movie);
        if (!movie) {
            return res.status(404).json({ message: "Movie not found for this booking" });
        }

        const show = movie.shows.find(show => show._id.toString() === showId);
        if (!show) {
            return res.status(404).json({ message: "Show not found for this booking" });
        }
        show.availableSeats += booking.numberOfTickets;

        await booking.remove();

        return res.status(200).json({ message: "Booking deleted successfully" });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = router;