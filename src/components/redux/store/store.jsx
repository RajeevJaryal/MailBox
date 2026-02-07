import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../slices/AuthSlice";
import mailReducer from "../slices/mailSlice";
export const store=configureStore({
    reducer:{
        auth:authReducer,
        mail:mailReducer,
    },
});