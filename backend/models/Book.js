const mongoose =require("mongoose");

const bookSchema = new mongoose.Schema({
  movie: {
    type: mongoose.Types.ObjectId,
    ref: "Movie",
    required: true,
  },
  showId: {
    type: String,
    required: true,
  },
  paymentId: {
    type: String,
    required: true,
  },
  orderId: {
    type: String,
    required: true,
  },
  numberOfTickets: {
    type: Number,
    required: true,
    min:1
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  user: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true,
  },
});



module.exports = mongoose.model("Book", bookSchema);
