import React,{ useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom"

export const CheckUser = (Component) =>{
    function Wrapper(props){
        const isAdminLoggedIn = useSelector(state => state.admin.isLoggedIn) ;
        const isUserLoggedIn = useSelector(state => state.user.isLoggedIn);
        var navigate = useNavigate();
        useEffect(()=>{
            if(!isUserLoggedIn){
                navigate('/login');
            }
        },[isAdminLoggedIn|| isUserLoggedIn])
        return  <Component {...props}/>;
    }
    return Wrapper;
}

export default CheckUser;