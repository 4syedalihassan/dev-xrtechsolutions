import Head from 'next/head';
import FrontLayout from '../components/Layout/FrontLayout';

export default function Careers() {
    return (
        <FrontLayout>
            <Head>
                <title>Careers | XR Tech Solutions</title>
                <meta name="description" content="Join the team at XR Tech Solutions and help build the future of immersive commerce." />
            </Head>

            <div className="container mx-auto px-4 py-12 max-w-5xl">
                <h1 className="text-4xl font-bold mb-4 text-center text-primary-600">Join Our Team</h1>
                <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
                    We're looking for visionaries, creators, and problem solvers to help us redefine the digital shopping experience.
                </p>

                <div className="grid md:grid-cols-2 gap-8 mb-12">
                    {/* Job Card 1 */}
                    <div className="bg-white p-8 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">Senior 3D Artist</h3>
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mb-4">Remote (Pakistan)</span>
                        <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mb-4 ml-2">Full-time</span>
                        <p className="text-gray-600 mb-6">
                            Create stunning, optimized 3D assets for our immersive shopping environments. Mastery of Blender and GLTF workflows required.
                        </p>
                        <button className="text-primary-600 font-semibold hover:text-primary-800">Learn More →</button>
                    </div>

                    {/* Job Card 2 */}
                    <div className="bg-white p-8 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">WebXR Developer</h3>
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mb-4">Lahore / Remote</span>
                        <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mb-4 ml-2">Engineering</span>
                        <p className="text-gray-600 mb-6">
                            Push the limits of the browser with Three.js and React Three Fiber. Help us build performant, beautiful 3D experiences.
                        </p>
                        <button className="text-primary-600 font-semibold hover:text-primary-800">Learn More →</button>
                    </div>

                    {/* Job Card 3 */}
                    <div className="bg-white p-8 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">UX/UI Designer</h3>
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mb-4">Lahore (Hybrid)</span>
                        <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mb-4 ml-2">Design</span>
                        <p className="text-gray-600 mb-6">
                            Design intuitive interfaces for spatial computing. Experience with AR/VR interactions is a big plus.
                        </p>
                        <button className="text-primary-600 font-semibold hover:text-primary-800">Learn More →</button>
                    </div>

                    {/* Job Card 4 */}
                    <div className="bg-white p-8 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">Product Manager</h3>
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mb-4">Lahore (On-site)</span>
                        <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mb-4 ml-2">Product</span>
                        <p className="text-gray-600 mb-6">
                            Lead the roadmap for our core e-commerce platform. Bridge the gap between technical feasibility and user needs.
                        </p>
                        <button className="text-primary-600 font-semibold hover:text-primary-800">Learn More →</button>
                    </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-8 text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Don't see your role?</h2>
                    <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                        We are always on the lookout for exceptional talent. If you think you'd be a great fit, send us your portfolio and resume.
                    </p>
                    <a href="mailto:careers@xrtechsolutions.com" className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors">
                        Email Us
                    </a>
                </div>
            </div>
        </FrontLayout>
    );
}
