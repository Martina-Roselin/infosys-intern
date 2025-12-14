import { Link } from 'react-router-dom';
import { Briefcase, Users, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';
import Chatbot from '../components/Chatbot'; 

export default function Home() {
  return (
   <>
    <Chatbot />
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-100 to-gray-200 flex flex-col">
      {/* Navbar */}
      <motion.nav
        className="bg-white shadow-md py-4 sticky top-0 z-50 backdrop-blur-md bg-opacity-90"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6">
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            ServiceFinder
          </h1>
          <div className="space-x-4">
            <Link
              to="/login"
              className="text-gray-700 hover:text-blue-600 font-medium transition duration-300"
            >
              Login
            </Link>
            <Link
              to="/register/user"
              className="text-gray-700 hover:text-blue-600 font-medium transition duration-300"
            >
              Register as User
            </Link>
            <Link
              to="/register/provider"
              className="text-gray-700 hover:text-blue-600 font-medium transition duration-300"
            >
              Register as Provider
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <header className="flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto px-6 py-20">
        {/* Left Text */}
        <motion.div
          className="md:w-1/2"
          initial={{ x: -80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.9 }}
        >
          <h2 className="text-5xl font-extrabold text-gray-800 mb-4 leading-tight">
            Find <span className="text-blue-600">Trusted</span> Local Services Near You
          </h2>
          <p className="text-gray-600 mb-8 text-lg leading-relaxed">
            From electricians to cleaners, connect with verified professionals in your area
            and book reliable service appointments with ease.
          </p>

          <div className="space-x-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
              <Link
                to="/login"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition duration-300"
              >
                <LogIn className="inline mr-2" /> Get Started
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
              <Link
                to="/register/provider"
                className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition duration-300 shadow-sm hover:shadow-md"
              >
                <Briefcase className="inline mr-2" /> Join as Provider
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Right Image */}
        <motion.div
          className="md:w-1/2 mt-10 md:mt-0 flex justify-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <motion.img
            src="https://arm003-buyer-web.usethisdomain.in/_next/image?url=%2Fassets%2Fpng%2Fvector.png&w=828&q=75"
            alt="Services"
            className="w-full max-w-sm mx-auto drop-shadow-2xl"
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </motion.div>
      </header>

      {/* Features Section */}
      <motion.section
        className="bg-white py-20 shadow-inner"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="max-w-6xl mx-auto text-center px-6">
          <motion.h3
            className="text-3xl font-extrabold text-gray-800 mb-12"
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            Why Choose <span className="text-blue-600">ServiceFinder?</span>
          </motion.h3>

          <div className="grid md:grid-cols-3 gap-10">
            {/* Card 1 */}
            <motion.div
              className="p-6 border rounded-lg shadow-sm hover:shadow-lg transition bg-gradient-to-b from-gray-50 to-white"
              whileHover={{ y: -8 }}
            >
              <Users className="w-14 h-14 text-blue-600 mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-gray-700 mb-2">Trusted Professionals</h4>
              <p className="text-gray-600">
                Verified service providers with genuine reviews and transparent pricing.
              </p>
            </motion.div>

            {/* Card 2 */}
            <motion.div
              className="p-6 border rounded-lg shadow-sm hover:shadow-lg transition bg-gradient-to-b from-gray-50 to-white"
              whileHover={{ y: -8 }}
            >
              <Briefcase className="w-14 h-14 text-indigo-600 mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-gray-700 mb-2">Wide Range of Services</h4>
              <p className="text-gray-600">
                From plumbing and electrical work to home cleaning — everything under one roof.
              </p>
            </motion.div>

            {/* Card 3 */}
            <motion.div
              className="p-6 border rounded-lg shadow-sm hover:shadow-lg transition bg-gradient-to-b from-gray-50 to-white"
              whileHover={{ y: -8 }}
            >
              <LogIn className="w-14 h-14 text-blue-500 mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-gray-700 mb-2">Easy Booking</h4>
              <p className="text-gray-600">
                Book your preferred provider in a few clicks — fast, secure, and reliable.
              </p>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer
        className="bg-gray-900 text-white text-center py-6 mt-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <p className="text-gray-400">
          &copy; {new Date().getFullYear()} <span className="text-blue-400 font-medium">ServiceFinder</span>. All rights reserved.
        </p>
      </motion.footer>
    </div>
    </>
  );
}
