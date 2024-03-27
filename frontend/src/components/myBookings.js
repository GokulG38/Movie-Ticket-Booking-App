import axios from "axios";
import React, { useEffect, useState } from "react";
import BookingCard from "./bookingCard";
import CheckUser from "../utils/checkUser";
import { useParams } from "react-router-dom";
import { Shimmer } from "./shimmer";

const MyBookings = () => {
    const  userId  = useParams().userId; 
    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        getDetails();
    }, []);

    async function getDetails() {
        try {
            const userToken = localStorage.getItem('userToken');
            if (!userToken) throw new Error('User token not found');

            const config = { headers: { 'Authorization': `Bearer ${userToken}` } };

            const response = await axios.get(`http://www.localhost:5000/booking/${userId}`, config);
            const jsonData = await response.data; 
            setBookings(jsonData.booking);
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <div className="text-center mt-8">
            <h2 className="text-5xl font-bold mb-4">My Bookings</h2>
            <div className="flex flex-wrap justify-center gap-6 p-6">
                
                {!bookings || bookings.length === 0 ? (
                    <Shimmer />
                ) : (
                    bookings.map(details => (
                        <BookingCard key={details._id} {...details} />
                    ))
                )}

            </div>
        </div>
    );
};

export default CheckUser(MyBookings);
