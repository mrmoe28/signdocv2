import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/"
                        className="inline-flex items-center text-blue-600 hover:text-blue-500 mb-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Home
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
                    <p className="mt-2 text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
                </div>

                {/* Content */}
                <div className="bg-white rounded-lg shadow-sm p-8 prose prose-lg max-w-none">
                    <h2>1. Information We Collect</h2>
                    <p>
                        We collect information you provide directly to us, such as when you create an account,
                        use our services, or contact us for support.
                    </p>

                    <h3>Personal Information</h3>
                    <ul>
                        <li>Name and contact information (email address, phone number)</li>
                        <li>Account credentials (username, password)</li>
                        <li>Business information (company name, address)</li>
                        <li>Payment information (processed securely through third-party providers)</li>
                    </ul>

                    <h3>Usage Information</h3>
                    <ul>
                        <li>Log data (IP address, browser type, pages visited)</li>
                        <li>Device information (device type, operating system)</li>
                        <li>Usage patterns and preferences</li>
                    </ul>

                    <h2>2. How We Use Your Information</h2>
                    <p>We use the information we collect to:</p>
                    <ul>
                        <li>Provide, maintain, and improve our services</li>
                        <li>Process transactions and send related information</li>
                        <li>Send technical notices and support messages</li>
                        <li>Respond to your comments and questions</li>
                        <li>Monitor and analyze trends and usage</li>
                    </ul>

                    <h2>3. Information Sharing</h2>
                    <p>
                        We do not sell, trade, or otherwise transfer your personal information to third parties
                        except as described in this policy:
                    </p>
                    <ul>
                        <li>With your consent</li>
                        <li>To comply with legal obligations</li>
                        <li>To protect our rights and safety</li>
                        <li>With trusted service providers who assist in our operations</li>
                    </ul>

                    <h2>4. Data Security</h2>
                    <p>
                        We implement appropriate technical and organizational measures to protect your personal
                        information against unauthorized access, alteration, disclosure, or destruction. However,
                        no method of transmission over the internet is 100% secure.
                    </p>

                    <h2>5. Data Retention</h2>
                    <p>
                        We retain your personal information for as long as necessary to provide our services
                        and fulfill the purposes outlined in this policy, unless a longer retention period
                        is required by law.
                    </p>

                    <h2>6. Your Rights</h2>
                    <p>Depending on your location, you may have the following rights:</p>
                    <ul>
                        <li>Access to your personal information</li>
                        <li>Correction of inaccurate information</li>
                        <li>Deletion of your personal information</li>
                        <li>Portability of your data</li>
                        <li>Restriction of processing</li>
                        <li>Objection to processing</li>
                    </ul>

                    <h2>7. Cookies and Tracking</h2>
                    <p>
                        We use cookies and similar tracking technologies to collect and track information
                        about your use of our service. You can control cookies through your browser settings.
                    </p>

                    <h2>8. Third-Party Services</h2>
                    <p>
                        Our service may contain links to third-party websites or services. We are not
                        responsible for the privacy practices of these third parties.
                    </p>

                    <h2>9. Children&apos;s Privacy</h2>
                    <p>
                        Our service is not intended for children under 13 years of age. We do not knowingly
                        collect personal information from children under 13.
                    </p>

                    <h2>10. International Transfers</h2>
                    <p>
                        Your information may be transferred to and processed in countries other than your own.
                        We ensure appropriate safeguards are in place for such transfers.
                    </p>

                    <h2>11. Changes to This Policy</h2>
                    <p>
                        We may update this Privacy Policy from time to time. We will notify you of any
                        material changes by posting the new policy on this page and updating the
                        &quot;Last updated&quot; date.
                    </p>

                    <h2>12. Contact Us</h2>
                    <p>
                        If you have any questions about this Privacy Policy, please contact us at:
                    </p>
                    <ul>
                        <li>Email: privacy@jobinvoicer.com</li>
                        <li>Address: [Your Company Address]</li>
                    </ul>
                </div>
            </div>
        </div>
    );
} 