import React , {useEffect}from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header'; 
import Body from './components/Body';
import SignUpForm from './components/auth/Signup';
import LoginForm from './components/auth/Login';
import './App.css';
import { login as adminLogin } from "./components/store/adminSlice";
import { login as userLogin } from "./components/store/userSlice";
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import BookTicket from './components/bookTickets';
import MyBookings from './components/myBookings';
import MovieForm from './components/movieForm';
import MovieDetails from './components/movieDetails';
import NewMovieForm from "./components/addMovieForm"





function App() {
const dispatch = useDispatch();

  useEffect(() => {
    if (localStorage.getItem("userId")) {
      dispatch(userLogin());
    } else if (localStorage.getItem("adminId")) {
      dispatch(adminLogin());

    }
  }, []);

  return (
      <Router>
        <>
          <Routes>
            <Route path="/" element={<><Header /><Body/></>} /> 
            <Route path="/signup" element={<SignUpForm />} />
            <Route path="/login" element={<LoginForm user="user"/>} />
            <Route path="/admin/login" element={<LoginForm user="admin" />} />
            <Route path="/movie/:movieId" element={<><Header/><MovieDetails /></>} /> 
            <Route path="/user/:userId/movie/:movieId/bookTickets/:showId" element={<><Header/><BookTicket/></>} /> 
            <Route path="/user/:userId/myBookings" element={<><Header/><MyBookings/></>} />
            <Route path="/admin/:adminId/addMovie" element={<><Header/><MovieForm purpose="add"/></>} /> 
            <Route path="/admin/:adminId/movie/:movieId/update" element={<><Header/><MovieForm purpose="updation" /></>} /> 
          </Routes>
        </>
      </Router>

  );
}

export default App;
