import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { FiShoppingCart, FiSearch, FiMenu, FiX } from "react-icons/fi"
import logo from "../../assets/LOGO.png"

function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const toggleMenu = () => setMenuOpen(!menuOpen)

  // a function to build class names for NavLink
  const linkClass = ({ isActive }) =>
    `cursor-pointer hover:text-green-600 ${
      isActive ? 'text-green-600 font-bold' : 'text-gray-800'
    }`

  return (
    <div className="bg-white shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <img src={logo} alt="Logo" className="h-15 w-auto" />
          <span className="text-3xl text-green-800 font-bold leading-tight font-transcity">
            DietWithDee
          </span>
        </div>

        {/* Desktop Nav */}
        <ul className="hidden md:flex space-x-6 font-medium text-sm font-inter">
          <li>
            <NavLink to="/" className={linkClass} end>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/diet-app/about" className={linkClass}>
              About
            </NavLink>
          </li>
          <li>
            <NavLink to="/diet-app/plans" className={linkClass}>
              Plans
            </NavLink>
          </li>
          <li>
            <NavLink to="/diet-app/services" className={linkClass}>
              Services
            </NavLink>
          </li>
          <li>
            <NavLink to="/diet-app/blog" className={linkClass}>
              Blog
            </NavLink>
          </li>
          <li>
            <NavLink to="/diet-app/KnowYourBody" className={linkClass}>
              KnowYourBody
            </NavLink>
          </li>
          <li>
            <NavLink to="/diet-app/contactus" className={linkClass}>
              Contact Us
            </NavLink>
          </li>
        </ul>

        {/* Right Side */}
        <div className="flex items-center space-x-4 text-green-700">
          <div className="relative">
            <FiShoppingCart size={18} />
            <span className="absolute -top-2 -right-2 text-xs bg-green-700 text-white rounded-full px-1">
              0
            </span>
          </div>
          <FiSearch size={18} className="text-gray-700 hover:text-black cursor-pointer" />

          {/* Hamburger Menu (mobile) */}
          <button className="md:hidden text-gray-800" onClick={toggleMenu}>
            {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {menuOpen && (
  <ul className="md:hidden px-6 pb-4 space-y-3 font-medium text-sm">
    {[
      { path: '/', label: 'Home' },
      { path: '/diet-app/about', label: 'About' },
      { path: '/diet-app/plans', label: 'Plans' },
      { path: '/diet-app/services', label: 'Services' },
      { path: '/diet-app/blog', label: 'Blog' },
      { path: '/diet-app/KnowYourBody', label: 'KnowYourBody' },
      { path: '/diet-app/contactus', label: 'Contact Us' },
    ].map(({ path, label }) => (
      <li key={path}>
        <NavLink
          to={path}
          className={linkClass}
          end={path === '/'}
          onClick={() => setMenuOpen(false)} // Close menu on click
        >
          {label}
        </NavLink>
      </li>
    ))}
  </ul>
)}
    </div>
  )
}

export default NavBar
