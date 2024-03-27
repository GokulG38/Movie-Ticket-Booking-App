import {createSlice} from "@reduxjs/toolkit"

const userSlice = createSlice({
    name: "user",
    initialState: { isLoggedIn: false },
    reducers: {
      login(state) {
        state.isLoggedIn = true;
      },
      logout(state) {
        localStorage.removeItem("userId");
        localStorage.removeItem("userToken");
        state.isLoggedIn = false;
      },
    },
  });

  export const {login, logout} = userSlice.actions
  export default userSlice.reducer