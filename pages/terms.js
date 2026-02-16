import Head from 'next/head';
import FrontLayout from '../components/Layout/FrontLayout';

export default function Terms() {
    return (
        <FrontLayout>
            <Head>
                <title>Terms of Service | XR Tech Solutions</title>
                <meta name="description" content="Terms and conditions for using the XR Tech Solutions website and services." />
            </Head>

            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <h1 className="text-4xl font-bold mb-8 text-center text-primary-600">Terms of Service</h1>

                <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 prose lg:prose-lg max-w-none text-gray-700">
                    <p className="lead">
                        Last Updated: February 2026. Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the XR Tech Solutions website.
                    </p>

                    <h3>1. Acceptance of Terms</h3>
                    <p>
                        By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the Service.
                    </p>

                    <h3>2. Accounts</h3>
                    <p>
                        When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
                    </p>

                    <h3>3. Intellectual Property</h3>
                    <p>
                        The Service and its original content, features, and functionality are and will remain the exclusive property of XR Tech Solutions and its licensors. The Service is protected by copyright, trademark, and other laws of both the Country and foreign countries.
                    </p>

                    <h3>4. User-Generated Content</h3>
                    <p>
                        Our Service may allow you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material ("Content"). You are responsible for the Content that you post to the Service, including its legality, reliability, and appropriateness.
                    </p>

                    <h3>5. Purchases</h3>
                    <p>
                        If you wish to purchase any product or service made available through the Service ("Purchase"), you may be asked to supply certain information relevant to your Purchase including, without limitation, your credit card number, the expiration date of your credit card, your billing address, and your shipping information.
                    </p>

                    <h3>6. Termination</h3>
                    <p>
                        We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                    </p>

                    <h3>7. Limitation of Liability</h3>
                    <p>
                        In no event shall XR Tech Solutions, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Service; (ii) any conduct or content of any third party on the Service; (iii) any content obtained from the Service; and (iv) unauthorized access, use or alteration of your transmissions or content, whether based on warranty, contract, tort (including negligence) or any other legal theory, whether or not we have been informed of the possibility of such damage, and even if a remedy set forth herein is found to have failed of its essential purpose.
                    </p>

                    <h3>8. Changes</h3>
                    <p>
                        We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
                    </p>

                    <h3>9. Governing Law</h3>
                    <p>
                        These Terms shall be governed and construed in accordance with the laws of Pakistan, without regard to its conflict of law provisions.
                        Any disputes shall be resolved in the courts of Lahore, Pakistan.
                    </p>

                    <h3>Contact Us</h3>
                    <p>
                        If you have any questions about these Terms, please contact us.
                    </p>
                </div>
            </div>
        </FrontLayout>
    );
}
