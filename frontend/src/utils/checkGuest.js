import React,{ useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom"

export const checkGuest = (Component) =>{
    function Wrapper(props){
        const isAdminLoggedIn = useSelector(state => state.admin.isLoggedIn ) ;
        const isUserLoggedIn = useSelector(state => state.user.isLoggedIn);
        var navigate = useNavigate();
        useEffect(()=>{
            if(isAdminLoggedIn||isUserLoggedIn){
                navigate('/');
            }
        },[isAdminLoggedIn|| isUserLoggedIn])
        return  <Component {...props}/>;
    }
    return Wrapper;
}

export default checkGuest;