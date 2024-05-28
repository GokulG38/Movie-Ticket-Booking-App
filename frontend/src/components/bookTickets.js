

import React, { useState, useEffect } from "react";
import CheckUser from "../utils/checkUser";
import { useNavigate, useParams } from "react-router-dom";

function loadScript(src) {
    return new Promise((resolve) => {
        const script = document.createElement('script')
        script.src = src
        script.onload = () => {
            resolve(true)
        }
        script.onerror = () => {
            resolve(false)
        }
        document.body.appendChild(script)
    })
}

const BookTicket = () => {
    const navigate = useNavigate();
    const [input, setInput] = useState(0);
    const [ticketPrice, setTicketPrice] = useState(0);
    const [errorMessage, setErrorMessage] = useState("");
    const movieId = useParams().movieId;
    const userId = useParams().userId;
    const showId = useParams().showId;

    useEffect(() => {
        async function fetchTicketPrice() {
            try {
                const response = await fetch(`http://localhost:5000/movies/${movieId}`);
                const movieData = await response.json();
                setTicketPrice(movieData.movie.ticketPrice);
            } catch (error) {
                console.error("Error fetching ticket price:", error);
            }
        }
        fetchTicketPrice();
    }, [movieId]);

    const handleChange = (e) => {
        const value = parseInt(e.target.value);
        if (isNaN(value) || value < 0) {
            setInput(0);
            setErrorMessage("Please enter a valid number of tickets.");
        } else {
            setInput(value);
            setErrorMessage("");
        }
    };

    const buttonClass = () => {
        if (input <= 0 || isNaN(input)) {
            return "btn btn-info col-6 disabled";
        } else {
            return "btn btn-info col-6";
        }
    };

    async function displayRazorpay(e) {
        e.preventDefault();
        const response = await fetch(`http://localhost:5000/movies/${movieId}`);
        const movieData = await response.json();
        const show = movieData.movie.shows ? movieData.movie.shows.find(show => show._id === showId) : null;
        if (!show) {
            console.error('Show data not found or empty.');
            return;
        }

        const availableSeats = show.availableSeats;
        if (input > availableSeats) {
            setErrorMessage('No enough seats available.');
            return;
        }
        
        const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
    
        if (!res) {
            alert('Razorpay failed to load!!');
            return;
        }
    
        const totalAmount = input * ticketPrice;
    
        const data = await fetch('http://localhost:5000/booking/razorpay', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ totalAmount, movie:movieId, showId, numberOfTickets:input })
        }).then((t) => t.json());
    
        const options = {
            key: `${process.env.REACT_APP_RAZORPAY_API_KEY}`,
            amount: totalAmount * 100, 
            currency: data.currency,
            name: "Gokul G Nair",
            description: "Test Transaction",
            image: "https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/007c7812124161.56257a66483ee.jpg",
            order_id: data.id,
            notes: {
                address: "Razorpay Corporate Office",
                user: userId,
                movie: movieId,
                show: showId,
                numberOfTickets: input
            }, 
            handler: function () {
                navigate("/");
            },
            theme: {
                color: "#3399cc"
            }
        };
        
        const paymentObject = new window.Razorpay(options);
        paymentObject.open();

    }

    return (
        <div className="d-flex justify-content-center align-items-center mt-24">
            <div className="rounded-lg bg-white p-4 shadow" style={{ maxWidth: '400px' }}>
                <form method="POST" >
                    <div className="form-group">
                        <h4><b>Book Your Tickets</b></h4>
                        <p className="text-secondary">Please enter the number of tickets</p>
                        <div className="form-group">
                            <input type="number" className="form-control mt-3" placeholder="Number Of Tickets" onChange={handleChange} value={input} />
                            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
                        </div>
                        <div className="bg-gray-300 border border-black p-4 m-4 rounded-md text-center">
                            <p>{input} tickets x ₹{ticketPrice}</p>
                            <p>₹{input * ticketPrice}</p>
                        </div>

                        <div className="row justify-content-center mt-4">
                            <button onClick={displayRazorpay} className={buttonClass()}>Proceed</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CheckUser(BookTicket);
