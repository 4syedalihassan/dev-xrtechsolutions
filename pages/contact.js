import Head from 'next/head';
import FrontLayout from '../components/Layout/FrontLayout';

export default function Contact() {
    return (
        <FrontLayout>
            <Head>
                <title>Contact Us | XR Tech Solutions</title>
                <meta name="description" content="Get in touch with the XR Tech Solutions team." />
            </Head>

            <div className="container mx-auto px-4 py-12 max-w-6xl">
                <h1 className="text-4xl font-bold mb-12 text-center text-primary-600">Get in Touch</h1>

                <div className="grid md:grid-cols-2 gap-12">
                    {/* Contact Information */}
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">We'd love to hear from you</h2>
                            <p className="text-gray-600 text-lg leading-relaxed">
                                Have a question about our products, interested in a partnership, or just want to say hello?
                                Fill out the form and our team will get back to you within 24 hours.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center text-2xl">📍</div>
                                <div>
                                    <h3 className="font-bold text-gray-800 text-lg">Headquarters</h3>
                                    <p className="text-gray-600">123 Innovation Drive, Suite 400<br />Tech City, TC 94000</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center text-2xl">📧</div>
                                <div>
                                    <h3 className="font-bold text-gray-800 text-lg">Email</h3>
                                    <p className="text-gray-600">hello@xrtechsolutions.com<br />support@xrtechsolutions.com</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center text-2xl">📞</div>
                                <div>
                                    <h3 className="font-bold text-gray-800 text-lg">Call Us</h3>
                                    <p className="text-gray-600">+92 300 1234567<br />Mon-Fri, 9am - 6pm PKT</p>
                                </div>
                            </div>
                        </div>

                        {/* Map Placeholder */}
                        <div className="w-full h-64 bg-gray-200 rounded-xl overflow-hidden shadow-inner relative">
                            <div className="absolute inset-0 flex items-center justify-center text-gray-500 font-medium">
                                Map View
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Send us a message</h2>
                        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                    <input type="text" id="firstName" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all" placeholder="John" />
                                </div>
                                <div>
                                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                    <input type="text" id="lastName" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all" placeholder="Doe" />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <input type="email" id="email" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all" placeholder="john@example.com" />
                            </div>

                            <div>
                                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                                <select id="subject" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all">
                                    <option>General Inquiry</option>
                                    <option>Support Request</option>
                                    <option>Partnership Opportunity</option>
                                    <option>Media/Press</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                <textarea id="message" rows="4" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all" placeholder="How can we help you?"></textarea>
                            </div>

                            <button type="submit" className="w-full bg-primary-600 text-white font-bold py-3 rounded-lg hover:bg-primary-700 transition-colors shadow-md">
                                Send Message
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </FrontLayout>
    );
}
