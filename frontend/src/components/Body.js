
import React, { useState, useEffect } from "react";
import MovieCard from "./movieCard";
import { Shimmer } from "./shimmer";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";


const Body = () => {
    const [movieDetails, setMovieDetails] = useState(null);
    const isAdmin = useSelector(state => state.admin.isLoggedIn);
    const isUser = useSelector(state => state.user.isLoggedIn);
    let id = null;

    if (isUser) {
        id = localStorage.getItem("userId");

    } else if (isAdmin) {
        id = localStorage.getItem("adminId");


    }


    useEffect(() => {
        getMovies();

    }, []);

    async function getMovies() {
        try {
            const data = await fetch("http://localhost:5000/movies");
            const moviejson = await data.json();
            setMovieDetails(moviejson);

        } catch (error) {
            console.error("Error fetching movies:", error);
        }
    }

    return (
        <div className="flex flex-wrap justify-center gap-6 p-6">
    {movieDetails && movieDetails.length === 0
        ? <Shimmer />
        : movieDetails?.map(details => (
            <>

                    <Link to={`/movie/${details._id}`} style={{ textDecoration: 'none' }}>
                        <MovieCard key={details._id} {...details} />
                    </Link>
                
            </>
        ))}
</div>

    );
};

export default Body;
