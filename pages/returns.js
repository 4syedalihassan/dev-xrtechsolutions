import Head from 'next/head';
import Link from 'next/link';
import FrontLayout from '../components/Layout/FrontLayout';

export default function Returns() {
    return (
        <FrontLayout>
            <Head>
                <title>Returns & Refunds | XR Tech Solutions</title>
                <meta name="description" content="Return policy and refund process for XR Tech Solutions." />
            </Head>

            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <h1 className="text-4xl font-bold mb-8 text-center text-primary-600">Returns & Refunds</h1>

                <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
                    <div className="mb-8 p-4 bg-blue-50 text-blue-800 rounded-lg flex items-start gap-3">
                        <span className="text-2xl">ℹ️</span>
                        <div>
                            <p className="font-bold">Need to make a return?</p>
                            <p className="text-sm mt-1">Visit our <Link href="/contact" className="underline">Support Center</Link> to initiate a return request.</p>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="bg-gray-50 p-6 rounded-lg mb-8">
                            <h3 className="font-bold text-gray-800 mb-2">Return Address (Pakistan)</h3>
                            <p className="text-gray-600">
                                XR Tech Solutions Returns<br />
                                123 MM Alam Road, Gulberg III<br />
                                Lahore, Pakistan 54000<br />
                                Phone: +92 300 1234567
                            </p>
                        </div>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">30-Day Money Back Guarantee</h2>
                            <p className="text-gray-600">
                                We want you to be completely satisfied with your immersive experience. If you are not happy with your purchase,
                                you can return it within 30 days of receipt for a full refund or exchange.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-800 mb-3">Eligibility Conditions</h2>
                            <ul className="list-disc pl-5 space-y-2 text-gray-600">
                                <li>Item must be unused and in the same condition that you received it.</li>
                                <li>Item must be in the original packaging.</li>
                                <li>Receipt or proof of purchase is required.</li>
                                <li>Software licenses and digital goods are non-refundable once redeemed/downloaded.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-800 mb-3">Refund Process</h2>
                            <p className="text-gray-600 mb-4">
                                Once your return is received and inspected, we will send you an email to notify you that we have received your returned item.
                                We will also notify you of the approval or rejection of your refund.
                            </p>
                            <p className="text-gray-600">
                                If approved, your refund will be processed, and a credit will automatically be applied to your credit card or original
                                method of payment, within a certain amount of days.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-800 mb-3">Return Shipping</h2>
                            <p className="text-gray-600">
                                You will be responsible for paying for your own shipping costs for returning your item. Shipping costs are non-refundable.
                                If you receive a refund, the cost of return shipping will be deducted from your refund (unless the return is due to our error).
                            </p>
                        </section>

                        <div className="border-t pt-6 mt-6">
                            <p className="text-sm text-gray-500 text-center">
                                For full legal details, please view our <Link href="/refund-policy" className="text-primary-600 hover:underline">Refund Policy</Link> document.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </FrontLayout>
    );
}
