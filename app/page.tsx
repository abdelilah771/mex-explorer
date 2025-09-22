import Image from "next/legacy/image";

export default function Home() {
  return (
    <div className="font-sans min-h-screen">
      {/* Hero Section - Full Width */}
      <section className="pt-16 pb-16 bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                  <span className="text-teal-800">Explore</span>
                  <br />
                  <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    Marrakech
                  </span>
                  <br />
                  <span className="text-gray-800">Like a Local</span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                  Discover hidden gems, authentic experiences, and navigate the Red City with confidence. Your AI-powered travel companion for Morocco.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                  <div className="flex items-center space-x-2">
                    <span>📱</span>
                    <span>Download App</span>
                  </div>
                </button>
                <button className="border-2 border-teal-600 text-teal-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-teal-600 hover:text-white transition-all duration-300">
                  Watch Demo
                </button>
              </div>

              <div className="flex items-center space-x-8 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-teal-800">50K+</div>
                  <div className="text-sm text-gray-600">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-teal-800">4.8★</div>
                  <div className="text-sm text-gray-600">App Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-teal-800">200+</div>
                  <div className="text-sm text-gray-600">Locations</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10">
                <Image
                  className="rounded-3xl shadow-2xl"
                  src="/marrakech-hero.jpg"
                  alt="Explore Marrakech - Koutoubia Mosque and traditional architecture"
                  width={600}
                  height={400}
                  priority
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-teal-200 to-emerald-200 rounded-3xl transform rotate-6 scale-105 opacity-20"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Everything You Need to Explore</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">From interactive maps to local insights, we've got you covered for an unforgettable Marrakech experience.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group">
              <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl p-8 h-full border border-teal-100 hover:border-teal-200 transition-all duration-300 hover:shadow-lg">
                <div className="text-4xl mb-6">🗺️</div>
                <h3 className="text-xl font-bold text-teal-800 mb-4">Smart Navigation</h3>
                <p className="text-gray-600 leading-relaxed">GPS-enabled offline maps with real-time directions. Never get lost in the medina's winding streets.</p>
                <ul className="mt-4 space-y-2 text-sm text-gray-500">
                  <li>• Offline maps available</li>
                  <li>• Real-time GPS tracking</li>
                  <li>• Points of interest marked</li>
                </ul>
              </div>
            </div>

            <div className="group">
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8 h-full border border-emerald-100 hover:border-emerald-200 transition-all duration-300 hover:shadow-lg">
                <div className="text-4xl mb-6">🏛️</div>
                <h3 className="text-xl font-bold text-teal-800 mb-4">Cultural Insights</h3>
                <p className="text-gray-600 leading-relaxed">Learn about historic sites, local customs, and hidden stories from expert local guides.</p>
                <ul className="mt-4 space-y-2 text-sm text-gray-500">
                  <li>• Historical background</li>
                  <li>• Local customs guide</li>
                  <li>• Expert recommendations</li>
                </ul>
              </div>
            </div>

            <div className="group">
              <div className="bg-gradient-to-br from-cyan-50 to-teal-50 rounded-2xl p-8 h-full border border-cyan-100 hover:border-cyan-200 transition-all duration-300 hover:shadow-lg">
                <div className="text-4xl mb-6">🍽️</div>
                <h3 className="text-xl font-bold text-teal-800 mb-4">Local Cuisine</h3>
                <p className="text-gray-600 leading-relaxed">Discover authentic restaurants, street food spots, and traditional recipes from local chefs.</p>
                <ul className="mt-4 space-y-2 text-sm text-gray-500">
                  <li>• Verified restaurant reviews</li>
                  <li>• Street food locations</li>
                  <li>• Dietary restrictions support</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* App Preview Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-teal-50">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <h2 className="text-4xl font-bold text-gray-800 mb-6">Experience Marrakech Through Your Phone</h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Our intuitive app design makes exploring Marrakech effortless. From booking tours to finding the best tagine, everything is just a tap away.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                    <span className="text-xl">📍</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Personalized Recommendations</h3>
                    <p className="text-gray-600">AI-powered suggestions based on your interests and travel style.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <span className="text-xl">💬</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">24/7 Local Support</h3>
                    <p className="text-gray-600">Connect with local guides and get help whenever you need it.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                    <span className="text-xl">🎫</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Seamless Bookings</h3>
                    <p className="text-gray-600">Book tours, restaurants, and accommodations directly through the app.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-3xl p-8 shadow-2xl">
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-4 bg-teal-100 rounded w-3/4"></div>
                    <div className="h-4 bg-emerald-100 rounded w-1/2"></div>
                    <div className="h-32 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-lg"></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-16 bg-cyan-50 rounded border"></div>
                      <div className="h-16 bg-teal-50 rounded border"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Download Section */}
      <section id="download" className="py-20 bg-gradient-to-r from-teal-600 to-emerald-600">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-4xl lg:text-5xl font-bold text-white">Ready to Explore Marrakech?</h2>
            <p className="text-xl text-teal-100">Join thousands of travelers who have discovered the magic of Morocco with our app.</p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-teal-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg">
                <div className="flex items-center space-x-2">
                  <span>📱</span>
                  <span>Download for iOS</span>
                </div>
              </button>
              <button className="bg-white text-teal-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg">
                <div className="flex items-center space-x-2">
                  <span>🤖</span>
                  <span>Download for Android</span>
                </div>
              </button>
            </div>

            <div className="pt-8">
              <p className="text-teal-100 text-sm">Available in English, French, and Arabic</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-lg"></div>
                <span className="text-xl font-bold">Explore Marrakech</span>
              </div>
              <p className="text-gray-400">Your digital companion for exploring the Red City and discovering authentic Moroccan experiences.</p>
              <div className="flex space-x-4">
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-teal-600 transition-colors cursor-pointer">
                  <span className="text-sm">f</span>
                </div>
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-teal-600 transition-colors cursor-pointer">
                  <span className="text-sm">t</span>
                </div>
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-teal-600 transition-colors cursor-pointer">
                  <span className="text-sm">in</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4">Features</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-teal-400 transition-colors">Offline Maps</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors">Cultural Guides</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors">Restaurant Reviews</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors">Tour Booking</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-teal-400 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors">Terms of Service</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-teal-400 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors">Our Team</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors">Press Kit</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Explore Marrakech. All rights reserved. Made with ❤️ in Morocco.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
