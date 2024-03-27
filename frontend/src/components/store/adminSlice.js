import {createSlice} from "@reduxjs/toolkit"

const adminSlice = createSlice({
    name: "admin",
    initialState: { isLoggedIn: false },
    reducers: {
      login(state) {
        state.isLoggedIn = true;
      },
      logout(state) {
        localStorage.removeItem("adminId");
        localStorage.removeItem("adminToken");
        state.isLoggedIn = false;
      },
    },
  });

  export const {login, logout} = adminSlice.actions
  export default adminSlice.reducer
