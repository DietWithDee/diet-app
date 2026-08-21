# 🥗 Diet With Dee - Nutrition Consultation Platform

A modern, responsive web application for nutrition consultation and appointment booking. Built with React 19, Vite, Firebase, and Tailwind CSS.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Installation](#installation)
- [Available Scripts](#available-scripts)
- [Firebase Configuration](#firebase-configuration)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

**Diet With Dee** is a comprehensive nutrition consultation platform that enables dietitians and nutritionists to:
- Showcase their services and expertise
- Manage client bookings efficiently
- Deliver personalized nutrition plans
- Engage with clients through blogs and educational content
- Build an online presence with SEO-optimized pages

The application is built as a **Progressive Web App (PWA)** with offline capabilities and installable on mobile devices.

## ✨ Features

### User-Facing Features
- **📅 Appointment Booking System** - Interactive calendar-based booking interface
- **🥗 Diet Plans & Guides** - Glassmorphic wellness tier cards with instant plan sharing (`#plan-id`) and smooth deep-linking
- **🤝 OnTrack App Partnership** - Integrated companion diabetes tracker flow for the *Blood Sugar Balance* guide with interactive download modal (Android Google Play & iOS preview)
- **🧾 Minimalist Checkout Flow** - Receipt-style post-checkout screen with Paystack payment verification and instant download instructions
- **🔍 Smart Search** - Instant prefix and fuzzy search with clean separation for other available plans
- **💪 Body Analysis** - "Know Your Body" assessment tool with personalized recommendations
- **📚 Blog & Resources** - SEO-optimized blog articles with rich content
- **📞 Contact & Support** - Email contact system with automated responses
- **📱 Progressive Web App** - Installable app with offline support and service worker

### Admin Features
- **👨‍💼 Admin Dashboard** - Manage bookings, plans, and content
- **📧 Email Notifications** - Automated email templates and communications
- **🔐 Authentication** - Firebase-based user authentication
- **📊 Booking Management** - View, confirm, and manage client bookings

### Technical Features
- **⚡ Fast Performance** - Built with Vite for instant HMR and optimized builds
- **🎨 Modern UI** - Tailwind CSS + DaisyUI components
- **📱 Responsive Design** - Mobile-first approach (97.8% JavaScript, 1.9% HTML, 0.3% CSS)
- **🔍 SEO Optimized** - React Helmet for meta tags and structured data
- **🔥 Real-time Database** - Firebase Firestore for scalable data management
- **☁️ Cloud Functions** - Serverless backend with Firebase Functions

## 🛠️ Tech Stack

### Frontend
- **React 19.1.0** - Modern UI library with concurrent features
- **React Router 7.6.3** - Advanced client-side routing
- **Vite 7.0.0** - Next-generation build tool
- **Tailwind CSS 4.1.11** - Utility-first CSS framework
- **DaisyUI 5.0.43** - Component library for Tailwind
- **React Helmet Async 2.0.5** - Dynamic document head management
- **React Icons 5.5.0** - Icon library
- **React Slick 0.30.3** - Carousel component

### Backend & Services
- **Firebase 12.0.0** - Authentication, Firestore database
- **Firebase Functions 6.4.0** - Serverless backend
- **Firebase Admin 13.4.0** - Server-side Firebase SDK
- **EmailJS 4.4.1** - Email delivery service
- **Nodemailer 7.0.5** - Node.js email module
- **Google APIs 155.0.1** - Google Workspace integration

### Development & Build Tools
- **ESLint 9.29.0** - Code quality and style
- **PostCSS 8.5.6** - CSS processing
- **Autoprefixer 10.4.21** - CSS vendor prefixes
- **Puppeteer 24.16.2** - Headless browser (for pre-rendering)
- **gh-pages 6.3.0** - GitHub Pages deployment

