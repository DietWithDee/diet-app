import React, { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { FiShoppingCart, FiMenu, FiX } from "react-icons/fi"
import logo from "../../assets/LOGO.png"
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
    { path: '/',            label: 'Home' },
    { path: '/diet-app/about',        label: 'About' },
    { path: '/diet-app/plans',        label: 'Plans' },
    { path: '/diet-app/services',     label: 'Services' },
    { path: '/diet-app/blog',         label: 'Blog' },
    { path: '/diet-app/KnowYourBody', label: 'KnowYourBody' },
    { path: '/diet-app/contactus',    label: 'Contact Us' },
  ]

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-white ">
      <div className="flex items-center justify-between px-4 ">
        {/* Logo */}
        <div className="flex items-center space-x-2">
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
                  `cursor-pointer hover:text-green-600 ${
                    isActive ? 'text-green-600 font-bold' : 'text-gray-800'
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
          <button onClick={() => navigate('/diet-app/plans')} className="relative">
            <FiShoppingCart size={23} />
          </button>
          <button className="md:hidden text-gray-800" onClick={() => setMenuOpen(true)}>
            <FiMenu size={26} />
          </button>
        </div>
      </div>

      {/* Mobile Slide-Down Menu (50% height, solid green) */}
      <div
        className={`
          fixed inset-x-0 top-0 h-100 bg-orange-400 z-40
          transform transition-transform duration-300 ease-in-out
          ${menuOpen ? 'translate-y-0' : '-translate-y-full'}
        `}
      >
        <div className="relative h-full flex flex-col items-center justify-center">
          {/* Close button */}
          <button
            className="absolute top-4 right-4 text-white text-3xl"
            onClick={() => setMenuOpen(false)}
          >
            <FiX />
          </button>

          {/* Nav links */}
          <ul className="space-y-6 text-white text-xl font-semibold text-center">
            {links.map(({ path, label }) => (
              <li key={path}>
                <NavLink
                  to={path}
                  className="block hover:text-black transition-colors duration-200"
                  onClick={() => setMenuOpen(false)}
                  end={path === '/'}
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </header>
  )
}