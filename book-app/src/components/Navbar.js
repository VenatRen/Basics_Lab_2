import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ user, setUser }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:8000/logout', {
        method: 'GET',
        credentials: 'include',
      });
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        {user && (
          <>
            <Link to="/books" className="nav-link">Books</Link>
            <Link to="/books/new" className="nav-link">Add Book</Link>
          </>
        )}
      </div>
      <div className="nav-right">
        {user ? (
          <>
            <span className="nav-link">{user.email}</span>
            <button className="nav-link logout-btn" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/register" className="nav-link">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
