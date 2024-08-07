import React from 'react';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom
import './SideBar.css'; // Import your custom CSS file
import { toast, ToastContainer } from 'react-toastify';

const SideBar = ({ user, handleLogout }) => {

  return (
    <aside className="col-md-2 sidebar">
      <div className="border-end d-flex flex-column position-fixed col-md-2" style={{ top: 0, bottom: 0, overflowY: 'auto', zIndex: 1 }}>

        {/* Twitter logo */}
        <div className="text-start pe-2">
          <div className="mb-3">
            <i className="fa-brands fa-x-twitter text-primary mt-4 ms-5" style={{ fontSize: '2em' }}></i>
          </div>

          {/* Navigation links */}
          <ul className="nav nav-pills flex-column">

            {/* Home link */}
            <li className="nav-item mb-2">
              <Link to="/" className="nav-link d-flex justify-content-start ms-lg-3 align-items-center">
                <i className="fas fa-home me-3 text-dark"></i><span className='text-dark fw-bold'>Home</span>
              </Link>
            </li>

            {/* Profile link */}
            <li className="nav-item mb-2">
              <Link to={`/profile/${user._id}`} className="nav-link d-flex justify-content-start ms-lg-3 align-items-center">
                <i className="fas fa-user me-3 text-dark"></i><span className='text-dark fw-bold'>Profile</span>
              </Link>
            </li>

            {/* Logout link */}
            <li className="nav-item mb-2">
              <a className="nav-link d-flex justify-content-start ms-lg-3 align-items-center" href="#" onClick={handleLogout}>
                <i className="fas fa-sign-out-alt me-3 text-dark"></i><span className='text-dark fw-bold'>Logout</span>
              </a>
            </li>
          </ul>
        </div>


        <div className="p-3 mt-auto text-start position-absolute bottom-0 ">
          {/* User Info */}
          <ul className="nav nav-pills ">

            {/* User profile link */}
            <li className='nav-item text-start'>
              <Link to={`/profile/${user._id}`} className=' nav-link '>



                <div className='d-flex align-items-center user-info p-2'  >

                  {/* User avatar */}
                  {user.profileImg ? (
                    <img src={user.profileImg} alt="User Avatar" className="rounded-circle me-2 img-fluid" width="40" height="40" />
                  ) : (
                    <div className="rounded-circle me-2" style={{ width: '40px', height: '40px', background: 'gray' }}></div>
                  )}

                  {/* User name and username */}
                  <div className='d-flex flex-column'>
                    <p className="mb-1 text-dark fw-bold ">{user.fullName}</p>
                    <p className="mb-0 text-black" style={{ fontSize: '0.75em' }}>@{user.userName}</p>
                  </div>


                </div>
              </Link>
            </li>

          </ul>

        </div>


      </div>
    </aside>
  );
};

export default SideBar;
