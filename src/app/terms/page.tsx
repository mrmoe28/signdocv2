import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
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
                    <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
                    <p className="mt-2 text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
                </div>

                {/* Content */}
                <div className="bg-white rounded-lg shadow-sm p-8 prose prose-lg max-w-none">
                    <h2>1. Acceptance of Terms</h2>
                    <p>
                        By accessing and using Job Invoicer (&quot;the Service&quot;), you accept and agree to be bound by
                        the terms and provision of this agreement. If you do not agree to abide by the above,
                        please do not use this service.
                    </p>

                    <h2>2. Description of Service</h2>
                    <p>
                        Job Invoicer is a web-based invoice management system that helps businesses create,
                        manage, and track invoices, customers, and payments. The service includes features for
                        document management, customer relationship management, and financial reporting.
                    </p>

                    <h2>3. User Accounts</h2>
                    <p>
                        To access certain features of the Service, you must register for an account. You agree to:
                    </p>
                    <ul>
                        <li>Provide accurate, current, and complete information during registration</li>
                        <li>Maintain and update your account information</li>
                        <li>Keep your password secure and confidential</li>
                        <li>Accept responsibility for all activities under your account</li>
                    </ul>

                    <h2>4. Acceptable Use</h2>
                    <p>You agree not to use the Service to:</p>
                    <ul>
                        <li>Upload, transmit, or distribute any unlawful, harmful, or objectionable content</li>
                        <li>Violate any applicable laws or regulations</li>
                        <li>Interfere with or disrupt the Service or servers</li>
                        <li>Attempt to gain unauthorized access to any part of the Service</li>
                    </ul>

                    <h2>5. Data and Privacy</h2>
                    <p>
                        Your privacy is important to us. Please refer to our Privacy Policy for information
                        about how we collect, use, and disclose your personal information.
                    </p>

                    <h2>6. Intellectual Property</h2>
                    <p>
                        The Service and its original content, features, and functionality are owned by Job Invoicer
                        and are protected by international copyright, trademark, patent, trade secret, and other
                        intellectual property laws.
                    </p>

                    <h2>7. Termination</h2>
                    <p>
                        We may terminate or suspend your account and access to the Service immediately, without
                        prior notice or liability, for any reason, including if you breach the Terms.
                    </p>

                    <h2>8. Disclaimer</h2>
                    <p>
                        The Service is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis. We make no warranties,
                        expressed or implied, and hereby disclaim all other warranties including, without limitation,
                        implied warranties or conditions of merchantability, fitness for a particular purpose, or
                        non-infringement of intellectual property.
                    </p>

                    <h2>9. Limitation of Liability</h2>
                    <p>
                        In no event shall Job Invoicer be liable for any indirect, incidental, special,
                        consequential, or punitive damages, including without limitation, loss of profits, data,
                        use, goodwill, or other intangible losses.
                    </p>

                    <h2>10. Changes to Terms</h2>
                    <p>
                        We reserve the right to modify or replace these Terms at any time. If a revision is
                        material, we will try to provide at least 30 days notice prior to any new terms taking effect.
                    </p>

                    <h2>11. Contact Information</h2>
                    <p>
                        If you have any questions about these Terms, please contact us at legal@jobinvoicer.com
                    </p>
                </div>
            </div>
        </div>
    );
} 