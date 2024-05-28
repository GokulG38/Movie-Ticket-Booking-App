
import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Shimmer } from "./shimmer";

const MovieDetails = () => {
    const Navigate = useNavigate();
    const movieId = useParams().movieId;
    const isAdmin = useSelector((state) => state.admin.isLoggedIn);
    const isUser = useSelector((state) => state.user.isLoggedIn);
    const [movieDetails, setMovieDetails] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);

    let userId, adminId;
    if (isAdmin) {
        adminId = localStorage.getItem("adminId");
    } else if (isUser) {
        userId = localStorage.getItem("userId");
    }

    useEffect(() => {
        getMovieDetails();
    }, []);

    async function getMovieDetails() {
        try {
            const response = await axios.get(`http://www.localhost:5000/movies/${movieId}`);
            const movieData = response.data.movie;
            setMovieDetails(movieData);
        } catch (error) {
            console.log(error);
        }
    }

    function filterShowTimings() {
        if (!selectedDate) {
            return movieDetails.shows;
        }
        return movieDetails.shows.filter((show) => {
            const showTime = new Date(show.showTime);
            return showTime.toDateString() === selectedDate.toDateString();
        });
    }

    function formatDate(dateTimeString) {
        const dateTime = new Date(dateTimeString);
        const options = {
            day: "numeric",
            month: "short",
            weekday: "long",
            hour: "numeric",
            minute: "numeric",
            hour12: true,
        };
        return dateTime.toLocaleString("en-US", options);
    }

    const handleMovieDelete = async () => {
        try {
            const adminToken = localStorage.getItem("adminToken");
            if (!adminToken) throw new Error("Admin token not found");
            const config = { headers: { Authorization: `Bearer ${adminToken}` } };
            await axios.delete(`http://www.localhost:5000/movies/${movieId}`, config);
            Navigate("/");
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="container-fluid mx-auto px-4">
            {!movieDetails ? (
                <Shimmer />
            ) : (
                <>
                    <div className="bg-gray-600 flex flex-wrap justify-evenly items-center p-8">
                        <div className="w-64">
                            <img src={movieDetails.posterUrl} alt="Movie Poster" className="w-full h-auto rounded-lg" />
                        </div>
                        <div className="text-white mr-12">
                            <h1 className="text-3xl font-bold">{movieDetails.title}</h1>
                            <h4 className="text-lg mt-2">Genre: {movieDetails.description}</h4>
                            <h4 className="text-lg">Starring: {movieDetails.starring}</h4>
                            {isAdmin && !isUser && (
                                <>
                                    <Link to={`/admin/${adminId}/movie/${movieId}/update`}>
                                        <button className="bg-gray-100 hover:bg-gray-200 text-black font-bold py-2 px-4 rounded mt-2">Update</button>
                                    </Link>
                                    <br />
                                    <button onClick={handleMovieDelete} className="bg-gray-100 hover:bg-gray-200 text-black font-bold py-2 px-4 rounded mt-2">
                                        Delete
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="text-center mt-8">
                        <h1 className="text-5xl font-bold mb-4">Show Timings</h1>
                        <div className="text-right mt-8">
                            <DatePicker
                                selected={selectedDate}
                                onChange={(date) => setSelectedDate(date)}
                                dateFormat="MMMM d, yyyy"
                                className="text-lg border p-2 rounded-md border-black"
                            />
                        </div>
                        <div className="flex justify-center flex-wrap">
                            {filterShowTimings().map((shows) => (
                               
                                <div key={shows.showTime} className="bg-gray-100 border border-gray-300 p-4 m-3 rounded-md text-center hover:shadow-lg">
                                    <p className="text-lg mb-2 mt-3">{formatDate(shows.showTime)}</p>
                                    <p className="text-lg mb-2 mt-3">{shows.availableSeats} seats available</p>

                                    {!isAdmin && isUser && movieDetails.disabled===false && shows.availableSeats!==0 &&(
                                        <Link to={`/user/${userId}/movie/${movieId}/bookTickets/${shows._id}`} >
                                            <button id="bookticketButton" className="bg-gray-800 text-white font-bold py-2 px-4 rounded mt-2 hover:bg-gray-700 mb-3">Book Ticket</button>
                                        </Link>
                                    )}
                                    {!isAdmin && !isUser && (
                                        <Link to="/login">
                                            <button className="bg-gray-800 text-white font-bold py-2 px-4 rounded mt-2 hover:bg-gray-700 mb-3">Book Ticket</button>
                                        </Link>
                                    )}
                                </div>

                            ))}
                        </div>

                    </div>
                </>
            )}
        </div>
    );
};

export default MovieDetails;
