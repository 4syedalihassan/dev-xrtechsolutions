import Head from 'next/head';
import FrontLayout from '../components/Layout/FrontLayout';

export default function About() {
    return (
        <FrontLayout>
            <Head>
                <title>Our Story | XR Tech Solutions</title>
                <meta name="description" content="Learn about the history and mission of XR Tech Solutions." />
            </Head>

            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <h1 className="text-4xl font-bold mb-8 text-center text-primary-600">Our Story</h1>

                <div className="prose lg:prose-xl mx-auto text-gray-700 bg-white p-8 rounded-lg shadow-sm">
                    <p className="mb-6">
                        Founded in 2024, XR Tech Solutions began with a simple yet ambitious vision: to transform the way people shop
                        online by bridging the gap between digital convenience and physical immersion.
                    </p>

                    <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-800">Our Mission</h2>
                    <p className="mb-6">
                        We believe that e-commerce shouldn't just be about scrolling through grids of images. It should be an experience.
                        Our mission is to democratize Extended Reality (XR) spanning Virtual Reality (VR), Augmented Reality (AR),
                        and Mixed Reality (MR) for everyday shopping.
                    </p>

                    <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-800">Innovation from Pakistan</h2>
                    <p className="mb-6">
                        Headquartered in Lahore, Pakistan, our diverse team of developers, 3D artists, and UX designers work
                        tirelessly to push the boundaries of WebXR technology. We are proud to be Pakistan's first fully immersive 3D e-commerce platform,
                        building the metaverse of commerce, one store at a time.
                    </p>

                    <div className="mt-12 p-6 bg-gray-50 rounded-lg border-l-4 border-primary-500">
                        <p className="italic text-lg text-gray-600">
                            "The future of shopping isn't just online. It's inside the internet."
                        </p>
                        <p className="mt-2 font-bold text-gray-800">- Founder & CEO</p>
                    </div>
                </div>
            </div>
        </FrontLayout>
    );
}
