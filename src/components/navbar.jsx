import { useState } from "react";
import { NavLink } from "react-router-dom";
import "../App.css"; // Assuming you have a CSS file for styling

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="custom-navbar">
      <div className="container-fluid">
        
        {/* Logo */}
        <NavLink to="/" className="logo">
          AEGIS
        </NavLink>

        {/* Hamburger Menu Button (Visible on Mobile) */}
        <button 
          className="hamburger md:hidden" 
          onClick={() => setIsOpen(!isOpen)}
        >
          ☰
        </button>

        {/* Links (Desktop) */}
        <div className="nav-links md:flex hidden">
          <NavLink to="/login" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>LOGIN</NavLink>
          <NavLink to="/signup" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>SIGNUP</NavLink>
        </div>
      </div>

      {/* Mobile Menu (Dropdown) */}
      {isOpen && (
        <div className="mobile-menu">
          <NavLink to="/login" className="nav-item" onClick={() => setIsOpen(false)}>LOGIN</NavLink>
          <NavLink to="/signup" className="nav-item" onClick={() => setIsOpen(false)}>SIGNUP</NavLink>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
