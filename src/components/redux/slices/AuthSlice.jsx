import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {firebaseAuthAPI} from "../../../firebase";

export const signupUser=createAsyncThunk(
    "auth/signupUser",
    async({email,password},{rejectWithValue})=>{
        try{
            const res=await firebaseAuthAPI.post("/accounts:signUp",{
                email,
                password,
                returnSecureToken:true,
            });
            return res.data;
        }catch(err){
            return rejectWithValue(
                err?.response?.data?.error?.message || "Signup failed"
            );
        }
    }
);
export const loginUser=createAsyncThunk(
    "auth/loginUser",
    async({email,password}, {rejectWithValue})=>{
        try{
            const res=await firebaseAuthAPI.post("/accounts:signInWithPassword",{
                email,
                password,
                returnSecureToken:true,
            })
            return res.data;
        }catch(err){
            return rejectWithValue(
                err?.response?.data?.error?.message || "Login failed"
            );
        }
    }
);


const initialState={
    token:null,
    refreshToken:null,
    userId:null,
    email:null,
    expiresAt:null,
    loading:false,
    error:null,
    isLoggedIn:false,
};

const authSlice=createSlice({
    name:"auth",
    initialState,
    reducers:{
        restoreSession(state, action) {
      const { token, refreshToken, userId, email, expiresAt } = action.payload;

      // if expired, ignore
      if (!token || !expiresAt || Date.now() >= expiresAt) return;

      state.token = token;
      state.refreshToken = refreshToken || null;
      state.userId = userId || null;
      state.email = email || null;
      state.expiresAt = expiresAt;
      state.isLoggedIn = true;
      state.error = null;
    },
    logout(state) {
      state.token = null;
      state.refreshToken = null;
      state.userId = null;
      state.email = null;
      state.expiresAt = null;
      state.isLoggedIn = false;
      state.loading = false;
      state.error = null;

      // clear storage
      localStorage.removeItem("auth");
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers:(builder)=>{
    const pending=(state)=>{
        state.loading=true;
        state.error=null;
    };
    const fulfilled=(state,action)=>{
        state.loading=false;
        const {idToken,refreshToken,localId,email,expiresIn}=action.payload;
        const expiresAt = Date.now() + Number(expiresIn) * 1000;

      state.token = idToken;
      state.refreshToken = refreshToken;
      state.userId = localId;
      state.email = email;
      state.expiresAt = expiresAt;
      state.isLoggedIn = true;
      localStorage.setItem(
        "auth", JSON.stringify({
            token:idToken,
            refreshToken,
            userId:localId,
            email,
            expiresAt,
        })
      );
    };
    const rejected = (state, action) => {
      state.loading = false;
      state.error = action.payload || "Something went wrong";
    };

    builder
      .addCase(signupUser.pending, pending)
      .addCase(signupUser.fulfilled, fulfilled)
      .addCase(signupUser.rejected, rejected)
      .addCase(loginUser.pending, pending)
      .addCase(loginUser.fulfilled, fulfilled)
      .addCase(loginUser.rejected, rejected);
  },
  
})
export const { logout, restoreSession, clearAuthError } = authSlice.actions;
export default authSlice.reducer;