const mongoose = require("mongoose");


const showSchema = new mongoose.Schema({
    showTime: {
        type: Date,
        required: true
    },
    availableSeats: {
        type: Number,
        default: 100 
    }
});


const moviesSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    starring: {
        type: String,
        required: true
    },
    posterUrl: {
        type: String,
        required: true
    },
    disabled: {
        type: Boolean,
        default: false
    },
    ticketPrice: {
        type: Number,
        required:true
    },
    shows: [showSchema],
    bookings: [{
        type: mongoose.Types.ObjectId,
        ref: "Booking"
    }],
    admin: {
        type: mongoose.Types.ObjectId,
        ref: "Admin"
    }
});


module.exports = mongoose.model("Movies", moviesSchema);
