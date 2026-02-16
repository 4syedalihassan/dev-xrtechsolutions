import Head from 'next/head';
import { useState } from 'react';
import FrontLayout from '../components/Layout/FrontLayout';

const FAQItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-gray-200 last:border-0">
            <button
                className="w-full py-6 flex items-center justify-between text-left focus:outline-none"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="text-lg font-semibold text-gray-800">{question}</span>
                <span className={`text-2xl text-primary-600 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                    ↓
                </span>
            </button>
            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100 mb-6' : 'max-h-0 opacity-0'}`}
            >
                <p className="text-gray-600 leading-relaxed pr-8">{answer}</p>
            </div>
        </div>
    );
};

export default function FAQ() {
    const faqs = [
        {
            question: "What is WebXR?",
            answer: "WebXR is a technology that allows you to experience Virtual Reality (VR) and Augmented Reality (AR) directly in your web browser, without needing to download a separate app. Our store is built on this technology."
        },
        {
            question: "Do I need a VR headset to shop here?",
            answer: "Not necessarily! While a VR headset provides the most immersive experience, our 3D stores are fully accessible on desktop and mobile devices. You can look around using your mouse or touchscreen."
        },
        {
            question: "Which VR headsets are supported?",
            answer: "We support all WebXR-compatible headsets, including Meta Quest 2/3/Pro, HTC Vive, and Apple Vision Pro (via Safari). Just open our website in your headset's browser and click 'Enter VR'."
        },
        {
            question: "How accurate are the 3D product models?",
            answer: "Our products are modeled with high-fidelity textures and physically based rendering (PBR) materials to ensure they look as close to real life as possible. We use laser scanning for select items."
        },
        {
            question: "Can I try on items virtually?",
            answer: "Yes! Many of our accessories and fashion items support AR Try-On. Look for the 'AR View' button on product pages to see them in your space or on yourself using your phone's camera."
        },
        {
            question: "Is my payment information secure?",
            answer: "Absolutely. We process all payments through secure, PCI-compliant payment gateways. We do not store your credit card information on our servers."
        }
    ];

    return (
        <FrontLayout>
            <Head>
                <title>FAQ | XR Tech Solutions</title>
                <meta name="description" content="Frequently Asked Questions about XR Tech Solutions and WebXR shopping." />
            </Head>

            <div className="container mx-auto px-4 py-12 max-w-3xl">
                <h1 className="text-4xl font-bold mb-4 text-center text-primary-600">Frequently Asked Questions</h1>
                <p className="text-center text-gray-600 mb-12">
                    Everything you need to know about the future of shopping.
                </p>

                <div className="bg-white px-8 py-2 rounded-xl shadow-sm border border-gray-100">
                    {faqs.map((faq, index) => (
                        <FAQItem key={index} question={faq.question} answer={faq.answer} />
                    ))}
                </div>

                <div className="mt-12 text-center bg-primary-50 p-8 rounded-xl">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Still have questions?</h3>
                    <p className="text-gray-600 mb-6">Can't find the answer you're looking for? Please chat to our friendly team.</p>
                    <a href="/contact" className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors">
                        Contact Support
                    </a>
                </div>
            </div>
        </FrontLayout>
    );
}
