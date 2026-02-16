import Head from 'next/head';
import FrontLayout from '../components/Layout/FrontLayout';

export default function Privacy() {
    return (
        <FrontLayout>
            <Head>
                <title>Privacy Policy | XR Tech Solutions</title>
                <meta name="description" content="Privacy policy detailing how XR Tech Solutions collects and uses your data." />
            </Head>

            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <h1 className="text-4xl font-bold mb-8 text-center text-primary-600">Privacy Policy</h1>

                <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 prose lg:prose-lg max-w-none text-gray-700">
                    <p className="lead">
                        Last Updated: February 2026. XR Tech Solutions ("us", "we", or "our") operates the XR Tech Solutions website (the "Service"). This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.
                    </p>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Data Protection Rights (Pakistan)</h2>
                        <p className="text-gray-600 mb-4">
                            We comply with the Prevention of Electronic Crimes Act (PECA) 2016 and other relevant data protection laws in Pakistan.
                            You have the right to access, correct, or delete your personal data.
                        </p>
                    </div>

                    <h3>1. Information Collection and Use</h3>
                    <p>
                        We collect several different types of information for various purposes to provide and improve our Service to you.
                    </p>
                    <h4>Types of Data Collected</h4>
                    <ul>
                        <li><strong>Personal Data:</strong> While using our Service, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you ("Personal Data"). Personally identifiable information may include, but is not limited to: Email address, First name and last name, Phone number, Address, State, Province, ZIP/Postal code, City, Cookies and Usage Data.</li>
                        <li><strong>Usage Data:</strong> We may also collect information on how the Service is accessed and used ("Usage Data"). This Usage Data may include information such as your computer's Internet Protocol address (e.g. IP address), browser type, browser version, the pages of our Service that you visit, the time and date of your visit, the time spent on those pages, unique device identifiers and other diagnostic data.</li>
                        <li><strong>Tracking & Cookies Data:</strong> We use cookies and similar tracking technologies to track the activity on our Service and hold certain information.</li>
                    </ul>

                    <h3>2. Use of Data</h3>
                    <p>
                        XR Tech Solutions uses the collected data for various purposes:
                    </p>
                    <ul>
                        <li>To provide and maintain the Service</li>
                        <li>To notify you about changes to our Service</li>
                        <li>To allow you to participate in interactive features of our Service when you choose to do so</li>
                        <li>To provide customer care and support</li>
                        <li>To provide analysis or valuable information so that we can improve the Service</li>
                        <li>To monitor the usage of the Service</li>
                        <li>To detect, prevent and address technical issues</li>
                    </ul>

                    <h3>3. Transfer of Data</h3>
                    <p>
                        Your information, including Personal Data, may be transferred to — and maintained on — computers located outside of your state, province, country or other governmental jurisdiction where the data protection laws may differ than those from your jurisdiction.
                    </p>

                    <h3>4. Disclosure of Data</h3>
                    <p>
                        XR Tech Solutions may disclose your Personal Data in the good faith belief that such action is necessary to:
                        <ul>
                            <li>To comply with a legal obligation</li>
                            <li>To protect and defend the rights or property of XR Tech Solutions</li>
                            <li>To prevent or investigate possible wrongdoing in connection with the Service</li>
                            <li>To protect the personal safety of users of the Service or the public</li>
                            <li>To protect against legal liability</li>
                        </ul>
                    </p>

                    <h3>5. Security of Data</h3>
                    <p>
                        The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
                    </p>

                    <h3>6. Service Providers</h3>
                    <p>
                        We may employ third party companies and individuals to facilitate our Service ("Service Providers"), to provide the Service on our behalf, to perform Service-related services or to assist us in analyzing how our Service is used.
                    </p>

                    <h3>7. Links to Other Sites</h3>
                    <p>
                        Our Service may contain links to other sites that are not operated by us. If you click on a third party link, you will be directed to that third party's site. We strongly advise you to review the Privacy Policy of every site you visit.
                    </p>

                    <h3>Contact Us</h3>
                    <p>
                        If you have any questions about this Privacy Policy, please contact us.
                    </p>
                </div>
            </div>
        </FrontLayout>
    );
}
