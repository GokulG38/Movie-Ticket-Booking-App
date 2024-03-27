import React, { useState } from "react";
import CheckAdmin from "../utils/checkAdmin";


const NewMovieForm = () => {

    const getDefaultShowTime = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1); 
        const year = tomorrow.getFullYear();
        const month = String(tomorrow.getMonth() + 1).padStart(2, "0");
        const day = String(tomorrow.getDate()).padStart(2, "0");
        const defaultTime = `${year}-${month}-${day}T11:30`;
        return defaultTime;
    };

    const [input, setInput] = useState({
        title: "",
        description: "",
        posterUrl: "",
        starring: "",
        disabled: false,
        availableSeats: 0,
        showTimings: [getDefaultShowTime()]
    });

    const addShowTiming = () => {
        setInput((prevInput) => ({
            ...prevInput,
            showTimings: [...prevInput.showTimings, getDefaultShowTime()] 
        }));
    };
    
    const removeShowTiming = (index) => {
        if (input.showTimings.length === 1) return; 
        const newTimings = [...input.showTimings];
        newTimings.splice(index, 1);
        setInput((prevInput) => ({
            ...prevInput,
            showTimings: newTimings
        }));
    };
    
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setInput((prevData) => ({
            ...prevData,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleTimingChange = (index, value) => {
        const newTimings = [...input.showTimings];
        newTimings[index] = value;
        setInput((prevData) => ({
            ...prevData,
            showTimings: newTimings
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(input);
    };
  
    return (
        <div className="max-w-3xl mx-auto p-6 bg-gray-100 rounded-md shadow-md mt-28">
            <h1 className="text-2xl font-bold mb-4 text-center">Add Movie</h1><br/>
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
                        <div className="mb-4">
                            <label className="block text-gray-700 font-bold mb-2" htmlFor="availableSeats">
                                Available Seats:
                            </label>
                            <input
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500"
                                type="number"
                                name="availableSeats"
                                value={input?.availableSeats}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                    <div className="w-1/2 pl-4">
                        <div className="mb-4">
                            <label className="block text-gray-700 font-bold mb-2" htmlFor="showTimings">
                                Show Date Timings:
                            </label>
                            {input?.showTimings.map((timing, index) => (
                                <div key={index} className="flex items-center mb-2">
                                    <input
                                        className="w-full px-3 py-2 border rounded-md mr-2 focus:outline-none focus:border-blue-500"
                                        type="text"
                                        value={timing}
                                        onChange={(e) => handleTimingChange(index, e.target.value)}
                                        placeholder="YYYY-MM-DDTHH:MM"
                                    />
                                    <button
                                        type="button"
                                        className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline"
                                        onClick={() => removeShowTiming(index)}
                                    >
                                        -
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline ml-2"
                                onClick={addShowTiming}
                            >
                                +
                            </button>
                        </div>
                    </div>
                </div>
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

export default CheckAdmin(NewMovieForm);
