import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Users, Building2, Globe2, ArrowRight, Heart as HeartIcon } from 'lucide-react';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <div className="flex items-center">
                  <Heart className="h-8 w-8 text-red-600" fill="currentColor" />
                  <Heart className="h-8 w-8 text-red-600 -ml-4" fill="currentColor" />
                </div>
                <span className="ml-2 text-2xl font-bold text-gray-900">LifeShare</span>
              </Link>
            </div>
            <div className="flex items-center">
              <div className="hidden md:flex space-x-8">
                <Link to="/about" className="text-gray-700 hover:text-gray-900">About Us</Link>
                <Link to="/donate" className="text-gray-700 hover:text-gray-900">Donate</Link>
                <Link to="/request" className="text-gray-700 hover:text-gray-900">Request Blood</Link>
                <Link to="/contact" className="text-gray-700 hover:text-gray-900">Contact</Link>
              </div>
              <div className="flex items-center ml-8 space-x-4">
                <Link
                  to="/login"
                  className="inline-flex items-center px-4 py-2 border border-red-600 text-sm font-medium rounded-md text-red-600 hover:bg-red-50"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                >
                  Register
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block">Donate Blood,</span>
                  <span className="block text-red-600">Save Lives</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Your donation can make a difference. One donation can save up to three lives. 
                  Join our community of donors today and help those in need.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Link
                      to="/donate"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 md:py-4 md:text-lg md:px-10"
                    >
                      Donate Now
                    </Link>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Link
                      to="/request"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-red-600 bg-red-100 hover:bg-red-200 md:py-4 md:text-lg md:px-10"
                    >
                      Request Blood
                    </Link>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center">
                <HeartIcon className="h-8 w-8 text-red-600" />
                <h3 className="ml-3 text-xl font-medium text-gray-900">Join Us</h3>
              </div>
              <p className="mt-4 text-gray-500">Become a Donor</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-red-600" />
                <h3 className="ml-3 text-xl font-medium text-gray-900">Community</h3>
              </div>
              <p className="mt-4 text-gray-500">Connect with Others</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center">
                <Building2 className="h-8 w-8 text-red-600" />
                <h3 className="ml-3 text-xl font-medium text-gray-900">Support</h3>
              </div>
              <p className="mt-4 text-gray-500">For Hospitals & Clinics</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center">
                <Globe2 className="h-8 w-8 text-red-600" />
                <h3 className="ml-3 text-xl font-medium text-gray-900">Locate</h3>
              </div>
              <p className="mt-4 text-gray-500">Find Donation Centers</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-red-600">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to Make a Difference?</span>
            <span className="block text-red-100">Join our lifesaving mission today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-red-600 bg-white hover:bg-red-50"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1">
              <div className="flex items-center">
                <Heart className="h-8 w-8 text-red-600" fill="currentColor" />
                <Heart className="h-8 w-8 text-red-600 -ml-4" fill="currentColor" />
                <span className="ml-2 text-2xl font-bold text-white">LifeShare</span>
              </div>
              <p className="mt-4 text-gray-300">
                We connect blood donors with recipients to ensure every patient gets the blood they need in time.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link to="/about" className="text-gray-300 hover:text-white">About Us</Link></li>
                <li><Link to="/donate" className="text-gray-300 hover:text-white">Donate Blood</Link></li>
                <li><Link to="/request" className="text-gray-300 hover:text-white">Request Blood</Link></li>
                <li><Link to="/contact" className="text-gray-300 hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Donation Centers</h3>
              <ul className="space-y-2">
                <li><Link to="/centers" className="text-gray-300 hover:text-white">Find Nearest Center</Link></li>
                <li><Link to="/eligibility" className="text-gray-300 hover:text-white">Eligibility Criteria</Link></li>
                <li><Link to="/drive" className="text-gray-300 hover:text-white">Host a Blood Drive</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Contact Us</h3>
              <ul className="space-y-2 text-gray-300">
                <li>123 Healthcare Ave, Medical District, City</li>
                <li>+1 (800) LIFE-SAVE</li>
                <li>info@lifeshare.org</li>
                <li>Mon-Sat: 8AM - 8PM</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-700 pt-8">
            <p className="text-center text-gray-400">
              © 2025 LifeShare Blood Donation Management System. All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;