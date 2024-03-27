import { configureStore } from "@reduxjs/toolkit";
import userSlice from "./userSlice";
import adminSlice from "./adminSlice";


const store=configureStore({

    reducer:{
        user:userSlice,
        admin:adminSlice
    }
})



export default store