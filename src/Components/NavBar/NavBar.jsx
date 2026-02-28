import React, { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { FiShoppingCart, FiMenu, FiX, FiUser } from "react-icons/fi"
import logo from "../../assets/LOGO.webp"
import { useNavigate } from 'react-router'

export default function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  // Prevent background scroll when open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const links = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/plans', label: 'Plans' },
    { path: '/blog', label: 'Blog' },
    { path: '/services', label: 'Services' },
    { path: '/contactus', label: 'Contact Us' },
  ]

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-white ">
      <div className="flex items-center justify-between px-4 ">
        {/* Logo */}
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
          <img src={logo} alt="Logo" className="h-14 w-auto" />
          <span className="text-3xl text-green-800 font-transcity pt-4">
            DietWithDee
          </span>
        </div>

        {/* Desktop Links */}
        <ul className="hidden md:flex space-x-6 text-sm font-inter">
          {links.map(({ path, label }) => (
            <li key={path}>
              <NavLink
                to={path}
                className={({ isActive }) =>
                  `cursor-pointer hover:text-green-600 ${isActive ? 'text-green-600 font-bold' : 'text-gray-800'
                  }`
                }
                end={path === '/'}
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Icons & Hamburger */}
        <div className="flex items-center space-x-4 text-orange-400">
          {/* My Journey icon */}
          <button
            onClick={() => navigate('/my-journey')}
            className="relative group"
            title="My Journey"
          >
            <FiUser size={23} className="transition-transform duration-300 group-hover:scale-110" />
          </button>
          <button onClick={() => navigate('/plans')} className="relative">
            <FiShoppingCart size={23} />
          </button>
          <button className="md:hidden text-gray-800" onClick={() => setMenuOpen(true)}>
            <FiMenu size={26} />
          </button>
        </div>
      </div>

      {/* Mobile Backdrop */}
      {menuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Mobile Side Drawer */}
      <div
        className={`
          fixed right-0 top-0 h-full w-64 bg-white shadow-2xl z-50
          transform transition-transform duration-300 ease-in-out
          ${menuOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Drawer Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <img src={logo} alt="Logo" className="h-10 w-auto" />
              <span className="text-xl text-green-800 font-transcity pt-2">
                DietWithDee
              </span>
            </div>
            <button
              className="text-gray-800 text-3xl"
              onClick={() => setMenuOpen(false)}
            >
              <FiX />
            </button>
          </div>

          {/* Drawer Links */}
          <ul className="flex flex-col py-2">
            {links.map(({ path, label }) => (
              <li key={path}>
                <NavLink
                  to={path}
                  className={({ isActive }) =>
                    `block px-6 py-4 text-lg hover:bg-gray-50 transition-colors ${
                      isActive ? 'text-green-600 font-bold' : 'text-gray-800'
                    }`
                  }
                  onClick={() => setMenuOpen(false)}
                  end={path === '/'}
                >
                  {label}
                </NavLink>
              </li>
            ))}
            <li>
              <NavLink
                to="/my-journey"
                className={({ isActive }) =>
                  `block px-6 py-4 text-lg hover:bg-gray-50 transition-colors ${
                    isActive ? 'text-green-600 font-bold' : 'text-gray-800'
                  }`
                }
                onClick={() => setMenuOpen(false)}
              >
                My Journey
              </NavLink>
            </li>
          </ul>

          {/* Bottom Links (Terms & Privacy) */}
          <div className="mt-auto p-6 border-t border-gray-100 flex justify-center items-center gap-4">
            <NavLink 
              to="/terms" 
              className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 hover:text-green-600 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Terms
            </NavLink>
            <span className="text-gray-300 text-[10px]">|</span>
            <NavLink 
              to="/privacy" 
              className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 hover:text-green-600 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Privacy
            </NavLink>
          </div>
        </div>
      </div>
    </header>
  )
}