import Head from 'next/head';
import FrontLayout from '../components/Layout/FrontLayout';

export default function Shipping() {
    return (
        <FrontLayout>
            <Head>
                <title>Shipping Info | XR Tech Solutions</title>
                <meta name="description" content="Shipping policies, delivery times, and rates for XR Tech Solutions." />
            </Head>

            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <h1 className="text-4xl font-bold mb-8 text-center text-primary-600">Shipping Information</h1>

                <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <span className="text-3xl">🚀</span> Global Delivery
                        </h2>
                        <p className="text-gray-600 mb-4">
                            We ship our physical products worldwide. Whether you're ordering a VR headset or haptic gloves, we ensure
                            it reaches you safely. Digital products are delivered instantly.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 mb-8">
                        <div className="bg-gray-50 p-6 rounded-lg">
                            <div className="policy-section">
                                <h2>Shipping Methods & Delivery Times</h2>
                                <div className="methods-grid">
                                    <div className="method-card">
                                        <h3>Standard Shipping (TCS/Leopards)</h3>
                                        <p className="price">Rs 200</p>
                                        <p className="time">3-5 Business Days</p>
                                        <p className="note">Free on orders over Rs 5,000</p>
                                    </div>
                                    <div className="method-card">
                                        <h3>Express Shipping</h3>
                                        <p className="price">Rs 500</p>
                                        <p className="time">1-2 Business Days</p>
                                        <p className="note">Order before 2 PM for same-day dispatch</p>
                                    </div>
                                </div>
                            </div>

                            <div className="policy-section">
                                <h2>Domestic Shipping (Pakistan)</h2>
                                <p>
                                    We deliver to all major cities in Pakistan including Lahore, Karachi, Islamabad,
                                    Rawalpindi, Faisalabad, and Multan. Remote areas may require additional delivery time.
                                </p>
                                <ul>
                                    <li>Orders are processed within 24 hours of confirmation.</li>
                                    <li>You will receive a tracking number via SMS/Email once dispatched.</li>
                                    <li>Cash on Delivery (COD) is available for orders up to Rs 50,000.</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">Order Processing</h3>
                            <p className="text-gray-600">
                                Orders are processed within 24 hours of payment confirmation. Usage of immersive tech requires precise calibration,
                                so we double-check all hardware before dispatch.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">Tracking Your Order</h3>
                            <p className="text-gray-600">
                                Once your order ships, you will receive a confirmation email with a tracking number. You can also track your order
                                status directly from your account dashboard.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">International Customs</h3>
                            <p className="text-gray-600">
                                For international orders, please note that customs fees and import duties are the responsibility of the customer.
                                These vary by country and are not included in our shipping rates.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </FrontLayout>
    );
}
