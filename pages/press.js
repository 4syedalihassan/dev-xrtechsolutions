import Head from 'next/head';
import FrontLayout from '../components/Layout/FrontLayout';

export default function Press() {
    return (
        <FrontLayout>
            <Head>
                <title>Press | XR Tech Solutions</title>
                <meta name="description" content="Latest news, press releases, and media resources from XR Tech Solutions." />
            </Head>

            <div className="container mx-auto px-4 py-12 max-w-5xl">
                <h1 className="text-4xl font-bold mb-12 text-center text-primary-600">Press & Media</h1>

                <div className="grid md:grid-cols-3 gap-8 mb-16">
                    <div className="col-span-2 space-y-8">
                        <h2 className="text-2xl font-bold text-gray-800 border-b pb-4">Latest News</h2>

                        {/* Press Item 1 */}
                        <div className="flex flex-col md:flex-row gap-6 mb-8 group cursor-pointer">
                            <div className="w-full md:w-48 h-32 bg-gray-200 rounded-lg flex-shrink-0"></div>
                            <div>
                                <span className="text-sm text-gray-500 font-medium">October 15, 2025</span>
                                <h3 className="text-xl font-bold text-gray-900 mt-1 mb-2 group-hover:text-primary-600 transition-colors">XR Tech Solutions Raises Series A to Expand Metaverse Commerce</h3>
                                <p className="text-gray-600 line-clamp-2">
                                    Leading venture firms back the vision of immersive web-based shopping experiences, citing 300% growth in user engagement.
                                </p>
                            </div>
                        </div>

                        {/* Press Item 2 */}
                        <div className="flex flex-col md:flex-row gap-6 mb-8 group cursor-pointer">
                            <div className="w-full md:w-48 h-32 bg-gray-200 rounded-lg flex-shrink-0"></div>
                            <div>
                                <span className="text-sm text-gray-500 font-medium">August 22, 2025</span>
                                <h3 className="text-xl font-bold text-gray-900 mt-1 mb-2 group-hover:text-primary-600 transition-colors">Partnership Announced with Leading Luxury Brands</h3>
                                <p className="text-gray-600 line-clamp-2">
                                    Top perfume and fashion houses join the platform to create exclusive virtual boutiques accessible directly from the browser.
                                </p>
                            </div>
                        </div>

                        {/* Press Item 3 */}
                        <div className="flex flex-col md:flex-row gap-6 group cursor-pointer">
                            <div className="w-full md:w-48 h-32 bg-gray-200 rounded-lg flex-shrink-0"></div>
                            <div>
                                <span className="text-sm text-gray-500 font-medium">May 10, 2025</span>
                                <h3 className="text-xl font-bold text-gray-900 mt-1 mb-2 group-hover:text-primary-600 transition-colors">Launching the "Virtual Try-On" Initiative</h3>
                                <p className="text-gray-600 line-clamp-2">
                                    New AR features allow customers to visualize products in their own space with unprecedented fidelity.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="col-span-1">
                        <div className="bg-gray-50 p-6 rounded-xl sticky top-8">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Media Contact</h3>
                            <p className="text-gray-600 mb-6 text-sm">
                                For press inquiries, interview requests, or access to our media kit, please contact our communications team.
                            </p>

                            <div className="space-y-3 mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">✉️</div>
                                    <span className="text-gray-700 font-medium">press@xrtechsolutions.com</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">📞</div>
                                    <span className="text-gray-700 font-medium">+1 (555) 123-4567</span>
                                </div>
                            </div>

                            <h3 className="text-lg font-bold text-gray-800 mb-4 border-t pt-6">Brand Assets</h3>
                            <ul className="space-y-2">
                                <li><a href="#" className="text-primary-600 hover:text-primary-800 text-sm flex items-center gap-2">⬇️ Download Logo Pack</a></li>
                                <li><a href="#" className="text-primary-600 hover:text-primary-800 text-sm flex items-center gap-2">⬇️ Executive Headshots</a></li>
                                <li><a href="#" className="text-primary-600 hover:text-primary-800 text-sm flex items-center gap-2">⬇️ Brand Guidelines</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </FrontLayout>
    );
}
