import React, { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { useWebHaptics } from 'web-haptics/react'
import { FiShoppingCart, FiMenu, FiX, FiUser } from "react-icons/fi"
import { motion } from 'framer-motion'
import logo from "../../assets/LOGO.webp"
import { useNavigate } from 'react-router'
import { useAuth } from '../../AuthContext'

// Playful bouncing icon that transitions between shopping cart and gift emoji
const PlayfulNavBarIcon = () => {
  return (
    <div className="relative w-8 h-8 flex items-center justify-center select-none">
      {/* Shopping Cart Icon */}
      <motion.div
        initial={{ scale: 0, rotate: -180, opacity: 0 }}
        animate={{ 
          scale: [0, 1.2, 0.9, 1, 1, 0],
          rotate: [-180, 10, -5, 0, 0, 180],
          opacity: [0, 1, 1, 1, 1, 0]
        }}
        transition={{
          duration: 3,
          ease: "easeInOut",
          repeat: Infinity,
          repeatDelay: 0.5,
          times: [0, 0.15, 0.25, 0.35, 0.45, 0.5]
        }}
        className="absolute text-current flex items-center justify-center"
      >
        <FiShoppingCart size={22} />
      </motion.div>

      {/* Gift Emoji */}
      <motion.div
        initial={{ scale: 0, rotate: 180, opacity: 0 }}
        animate={{ 
          scale: [0, 0, 1.3, 0.9, 1.1, 1],
          rotate: [180, 180, -15, 5, -2, 0],
          opacity: [0, 0, 1, 1, 1, 1]
        }}
        transition={{
          duration: 3,
          ease: "easeInOut",
          repeat: Infinity,
          repeatDelay: 0.5,
          times: [0, 0.5, 0.65, 0.75, 0.85, 1]
        }}
        className="absolute text-lg flex items-center justify-center animate-pulse"
      >
        🎁
      </motion.div>
    </div>
  );
};

export default function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { trigger } = useWebHaptics()
  const navigate = useNavigate()
  const { user } = useAuth()

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
    { path: '/contactus', label: 'Book a Session' },
  ]

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-white ">
      <div className="flex items-center justify-between px-4 ">
        {/* Logo */}
        <div className="flex-shrink-0 flex items-center space-x-2 cursor-pointer" onClick={() => {
          trigger("nudge")
          navigate('/')
        }}>
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
                onClick={() => trigger("nudge")}
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Icons & Hamburger */}
        <div className="flex-shrink-0 flex items-center space-x-2 md:space-x-4">
          {/* My Journey icon */}
          <NavLink
            to="/my-journey"
            onClick={() => trigger("nudge")}
            className={({ isActive }) =>
              `relative flex items-center justify-center w-10 h-10 transition-colors duration-300 ${isActive ? 'text-orange-600' : 'text-orange-400'}`
            }
            title="My Journey"
            aria-label="My Journey"
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    className="absolute inset-0 bg-orange-100 rounded-full"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  />
                )}
                <motion.div
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  className="relative z-10 flex items-center justify-center"
                >
                  {user && user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || "Profile"}
                      className={`w-7 h-7 rounded-full object-cover border transition-all duration-300 ${
                        isActive ? 'border-orange-600 ring-2 ring-orange-100' : 'border-orange-400 hover:border-orange-500'
                      }`}
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <FiUser size={23} className="transition-transform duration-300" />
                  )}
                </motion.div>
              </>
            )}
          </NavLink>

          {/* Plans/Cart icon */}
          <NavLink
            to="/plans"
            onClick={() => trigger("nudge")}
            className={({ isActive }) =>
              `relative flex items-center justify-center w-10 h-10 transition-colors duration-300 ${isActive ? 'text-orange-600' : 'text-orange-400'}`
            }
            title="Plans"
            aria-label="Plans"
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    className="absolute inset-0 bg-orange-100 rounded-full"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  />
                )}
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="relative z-10 flex items-center justify-center"
                >
                  <PlayfulNavBarIcon />
                </motion.div>
              </>
            )}
          </NavLink>

          <button
            className="md:hidden text-orange-600"
            onClick={() => {
              trigger("nudge")
              setMenuOpen(true)
            }}
            aria-label="Open main menu"
            aria-expanded={menuOpen}
          >
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
              onClick={() => {
                trigger("success")
                setMenuOpen(false)
              }}
              aria-label="Close main menu"
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
                    `block px-6 py-4 text-lg hover:bg-gray-50 transition-colors ${isActive ? 'text-green-600 font-bold' : 'text-gray-800'
                    }`
                  }
                  onClick={() => {
                    trigger("nudge")
                    setMenuOpen(false)
                  }}
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
                  `block px-6 py-4 text-lg hover:bg-gray-50 transition-colors ${isActive ? 'text-green-600 font-bold' : 'text-gray-800'
                  }`
                }
                onClick={() => {
                  trigger("nudge")
                  setMenuOpen(false)
                }}
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
              onClick={() => {
                trigger("light")
                setMenuOpen(false)
              }}
            >
              Terms
            </NavLink>
            <span className="text-gray-300 text-[10px]">|</span>
            <NavLink
              to="/privacy"
              className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 hover:text-green-600 transition-colors"
              onClick={() => {
                trigger("light")
                setMenuOpen(false)
              }}
            >
              Privacy
            </NavLink>
          </div>
        </div>
      </div>
    </header>
  )
}