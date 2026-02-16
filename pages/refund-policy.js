import Head from 'next/head';
import FrontLayout from '../components/Layout/FrontLayout';

export default function RefundPolicy() {
    return (
        <FrontLayout>
            <Head>
                <title>Refund Policy | XR Tech Solutions</title>
                <meta name="description" content="Detailed refund policy for XR Tech Solutions." />
            </Head>

            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <h1 className="text-4xl font-bold mb-8 text-center text-primary-600">Refund Policy</h1>

                <div className="bg-gray-50 p-6 rounded-lg mb-8">
                    <h3 className="font-bold text-gray-800 mb-2">Refund Timeline</h3>
                    <p className="text-gray-600 mb-2">
                        Once your return is received and inspected, we will send you an email to notify you that we have received your returned item.
                    </p>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                        <li>Credit/Debit Card: 5-10 business days (depending on your bank)</li>
                        <li>EasyPaisa/JazzCash: 24-48 hours</li>
                        <li>Bank Transfer: 3-5 business days</li>
                    </ul>
                </div>

                <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 prose lg:prose-lg max-w-none text-gray-700">
                    <p className="lead">
                        Our Refund Policy provides detailed information about your rights and our obligations regarding refunds for products and services purchased from XR Tech Solutions.
                    </p>

                    <h3>1. General Refund Policy</h3>
                    <p>
                        Our goal is to ensure your complete satisfaction. If you are not entirely satisfied with your purchase, we're here to help.
                    </p>

                    <h3>2. Physical Goods</h3>
                    <p>
                        <strong>Standard Refund Period:</strong> You have 30 calendar days to return an item from the date you received it.<br />
                        <strong>Condition:</strong> To be eligible for a return, your item must be unused and in the same condition that you received it. Your item must be in the original packaging.<br />
                        <strong>Proof of Purchase:</strong> Your item needs to have the receipt or proof of purchase.
                    </p>

                    <h3>3. Digital Goods & Software</h3>
                    <p>
                        <strong>Non-Refundable:</strong> Due to the nature of digital goods (software licenses, downloadable content, 3D assets), these items are generally non-refundable once the download link has been accessed or the license key has been revealed.
                        <br />
                        <strong>Exceptions:</strong> If the digital file is corrupted or technically defective, we will provide a replacement or a full refund if the issue cannot be resolved within 48 hours of reporting.
                    </p>

                    <h3>4. Subscriptions</h3>
                    <p>
                        <strong>Cancellation:</strong> You may cancel your subscription at any time. Cancellation will take effect at the end of the current billing cycle.
                        <br />
                        <strong>Refunds:</strong> We do not provide refunds for partial subscription periods.
                    </p>

                    <h3>5. Sale Items</h3>
                    <p>
                        Only regular priced items may be refunded. Unfortunately, sale items cannot be refunded unless they are defective.
                    </p>

                    <h3>6. Initiating a Refund</h3>
                    <p>
                        To initiate a return or request a refund, please contact our support team at <a href="mailto:support@xrtechsolutions.com">support@xrtechsolutions.com</a> with your order number and details about the product you would like to return.
                    </p>

                    <h3>7. Processing Time</h3>
                    <p>
                        Refunds are typically processed within 5-7 business days of our receipt of your returned item or approval of your refund request. The time it takes for the credit to appear on your account depends on your card issuer's policies.
                    </p>
                </div>
            </div>
        </FrontLayout>
    );
}
