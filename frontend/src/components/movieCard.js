import React from "react";
import { Link } from "react-router-dom";

const MovieCard =({title, posterUrl,description,starring})=>{


    return(
        
        <div className="w-64 p-4 m-2 border-2 border-solid border-black rounded-lg hover:bg-slate-200 text-slate-950">
        <img src={posterUrl} ></img>
        <h4 className=" no-underline">{title}</h4>
        <span>Actor-{starring}</span><br/>
        <span>{description}</span>
    </div>
    
    
    )
    
}
export default MovieCard