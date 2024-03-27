import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux'; 
import { logout as adminLogout } from './store/adminSlice';
import { logout as userLogout } from './store/userSlice';
 import { useNavigate } from 'react-router-dom';

const Header = () => {
  const isAdminLoggedIn = useSelector(state => state.admin.isLoggedIn);
  const isUserLoggedIn = useSelector(state => state.user.isLoggedIn);
  const userId = isUserLoggedIn?localStorage.getItem("userId"):null;
  const adminId = isAdminLoggedIn?localStorage.getItem("adminId"):null;

  const dispatch = useDispatch();
  const navigate = useNavigate()

  const handleLogout = () => {

    if (isAdminLoggedIn) {
      dispatch(adminLogout());
      navigate('/')

    } else if (isUserLoggedIn) {
      dispatch(userLogout());
      navigate('/')


    }

  };

  return (
    <div className='flex justify-between shadow-2xl'>
      <div className='logo'>
        <img className="h-24 p-2" src='https://i.pinimg.com/originals/c5/4f/67/c54f67eb87181a3e6b628d4865307b65.jpg' alt='logo'></img>
      </div>
      <div className='navbar'>
        <ul className='flex'>
          <li className='m-2'>
            <Link to="/" className="no-underline hover:underline text-black">Home</Link>
          </li>
          {!isAdminLoggedIn && !isUserLoggedIn && ( 
            <>
              
              <li className='m-2 login'>
                <Link to="/admin/login" className="no-underline hover:underline text-black">Admin</Link>
              </li>
              <li className='m-2 login'>
                <Link to="/login" className="no-underline hover:underline text-black">Login</Link>
              </li>
            </>
          )}
          {(!isAdminLoggedIn && isUserLoggedIn) && ( 
            <li className='m-2'>
              <Link to={`/user/${userId}/myBookings`} className="no-underline hover:underline text-black">My Bookings</Link>
            </li>
          )}
          {(isAdminLoggedIn && !isUserLoggedIn) && ( 
            <li className='m-2'>
              <Link to={`/admin/${adminId}/addMovie`} className="no-underline hover:underline text-black">Add Movie</Link>
            </li>
          )}
          {(isAdminLoggedIn || isUserLoggedIn) && ( 
            <li className='m-2 logout'>
              <button onClick={handleLogout} className="no-underline hover:underline text-black">Logout</button>
            </li>
          )}
          
        </ul>
      </div>
    </div>
  );
};

export default Header;
