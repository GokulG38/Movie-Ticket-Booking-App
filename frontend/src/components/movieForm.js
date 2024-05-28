

import React, { useState, useEffect } from "react";
import CheckAdmin from "../utils/checkAdmin";
import { useNavigate, useParams } from "react-router-dom";
import { handleMovieUpdates, handleAddMovie } from "../utils/Authentication";

const MovieForm = ({ purpose }) => {
    const movieId = useParams().movieId;
    const Navigate = useNavigate();
    const [error, setError] = useState("");
    

    const getDefaultShowTime = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const year = tomorrow.getFullYear();
        const month = String(tomorrow.getMonth() + 1).padStart(2, "0");
        const day = String(tomorrow.getDate()).padStart(2, "0");
        const defaultTime = `${year}-${month}-${day}T11:30`;
        return formatDate(defaultTime);
    };

    const [input, setInput] = useState({
        title: "",
        description: "",
        posterUrl: "",
        starring: "",
        disabled: false,
        ticketPrice: 0,
        shows: [{
            showTime: getDefaultShowTime(),
            availableSeats: 0
        }]
    });

    useEffect(() => {
        if (purpose === "updation") {
            window.scrollTo(0, 0);
            getForm();
        }
    }, [purpose]);


    function formatDate(dateTimeString) {
        const dateTime = new Date(dateTimeString);
        const options = {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "numeric",
            minute: "numeric",
            hour12: true,
        };
        return dateTime.toLocaleString("en-US", options);
    }

    async function getForm() {
        try {
            const response = await fetch(`http://localhost:5000/movies/${movieId}`);
            const jsonData = await response.json();
            const showsWithFormattedTime = jsonData.movie.shows.map(show => ({
                ...show,
                showTime: formatDate(show.showTime)
            }));

            setInput({
                ...jsonData.movie,
                shows: showsWithFormattedTime
            });
        } catch (error) {
            console.error("Error fetching movie data:", error);
        }
    }


    const addShowTiming = () => {
        setInput((prevInput) => ({
            ...prevInput,
            shows: [...prevInput.shows, {
                showTime: getDefaultShowTime(),
                availableSeats: 100
            }]
        }));
    };

    const removeShowTiming = (index) => {
        if (input.shows.length === 1) return;
        const Shows = [...input.shows];
        setInput((prevInput) => ({
            ...prevInput,
            shows: Shows.filter((_, idx) => idx !== index)
        }));
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setInput((prevData) => ({
            ...prevData,
            [name]: type === "checkbox" ? checked : name === "ticketPrice" ? parseFloat(value) : value
        }));
    };

    const handleTimingChange = (index, value) => {
        setInput(prevInput => ({
            ...prevInput,
            shows: prevInput.shows.map((show, idx) =>
                idx === index ? { ...show, showTime: value } : show
            )
        }));
    };



    const handleSeatsChange = (index, value) => {
        const parsedValue = parseInt(value, 10);
        if (!isNaN(parsedValue)) {
            setInput(prevInput => ({
                ...prevInput,
                shows: prevInput.shows.map((show, idx) =>
                    idx === index ? { ...show, availableSeats: parsedValue } : show
                )
            }));
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        const { title, description, posterUrl, starring, ticketPrice, shows } = input;

        if (!title.trim() || !description.trim() || !posterUrl.trim() || !starring.trim() || isNaN(ticketPrice) || ticketPrice <= 0) {
            setError("Please fill out all fields and ensure ticket price is a positive number.");
            return;
        }
        if (shows.length === 0 || shows.some(show => !show.showTime.trim() || isNaN(show.availableSeats))) {
            setError("Invalid show timings or available seats.");
            return;
        }
        if (shows.some(show => show.availableSeats < 0)) {
            setError("Available seats cannot be negative.");
            return;
        }
        setError(""); 
        try {
            if (purpose === "updation") {
                await handleMovieUpdates(movieId, input);
            } else if (purpose === "add") {
                await handleAddMovie(input);
            }
            Navigate("/");
        } catch (err) {
            setError(err.message);
        }
    };


    return (
        <div className="max-w-3xl mx-auto p-6 bg-gray-100 rounded-md shadow-md mt-28">
            <h1 className="text-2xl font-bold mb-4 text-center">Add Movie</h1><br />
            <form onSubmit={handleSubmit}>
                <div className="flex">
                    <div className="w-1/2 pr-4">
                        <div className="mb-4">
                            <label className="block text-gray-700 font-bold mb-2" htmlFor="title">
                                Title
                            </label>
                            <input
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500"
                                type="text"
                                name="title"
                                value={input?.title}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 font-bold mb-2" htmlFor="description">
                                Description:
                            </label>
                            <textarea
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500"
                                name="description"
                                value={input?.description}
                                onChange={handleChange}
                                required
                            ></textarea>
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 font-bold mb-2" htmlFor="posterUrl">
                                Poster URL:
                            </label>
                            <input
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500"
                                type="text"
                                name="posterUrl"
                                value={input?.posterUrl}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 font-bold mb-2" htmlFor="starring">
                                Starring:
                            </label>
                            <input
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500"
                                type="text"
                                name="starring"
                                value={input?.starring}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 font-bold mb-2" htmlFor="ticketPrice">
                                Ticket Price:
                            </label>
                            <input
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500"
                                type="number"
                                name="ticketPrice"
                                value={input?.ticketPrice}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="mb-4 flex items-center">
                            <input
                                className="mr-2 leading-tight"
                                type="checkbox"
                                name="disabled"
                                checked={input?.disabled}
                                onChange={handleChange}
                            />
                            <label className="text-gray-700 font-bold" htmlFor="disabled">
                                Disabled
                            </label>
                        </div>
                    </div>
                    <div className="w-1/2 pl-4">
                        <div className="mb-4">
                            <label className="block text-gray-700 font-bold mb-2" htmlFor="showTimings">
                                Show Date Timings:
                            </label>
                            {input?.shows.map((show, index) => (
                                <div key={index} className="flex items-center mb-2">
                                    <input
                                        className="w-full px-3 py-2 border rounded-md mr-2 focus:outline-none focus:border-blue-500"
                                        type="text"
                                        value={show.showTime}
                                        onChange={(e) => handleTimingChange(index, e.target.value)}
                                        placeholder="YYYY-MM-DDTHH:MM"
                                    />
                                    <input
                                        className="w-20 px-3 py-2 border rounded-md mr-2 focus:outline-none focus:border-blue-500"
                                        type="number"
                                        value={show.availableSeats}
                                        onChange={(e) => handleSeatsChange(index, e.target.value)}
                                        placeholder="Seats"
                                    />
                                    <button
                                        type="button"
                                        className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline"
                                        onClick={() => removeShowTiming(index)}
                                    >
                                        -
                                    </button>
                                    <button
                                        type="button"
                                        className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline ml-2"
                                        onClick={addShowTiming}
                                    >
                                        +
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="text-red-500 text-center mb-4">{error}</div>
                )}
                <button
                    className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-4 ml-auto"
                    type="submit"
                >
                    Submit
                </button>
            </form>
        </div>
    );
};

export default CheckAdmin(MovieForm);
