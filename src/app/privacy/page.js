import Navbar from '@/components/layout/Navbar';
import Card from '@/components/ui/Card';
import { Shield } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#fffaf1] to-white">
      <Navbar />
      <div className="pt-8 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-8 h-8 text-orange-500" />
              <h1 className="text-4xl font-bold text-gray-900">Privacy Policy</h1>
            </div>
            <p className="text-gray-600">Last updated: January 22, 2026</p>
          </div>

          {/* Content */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
              <p className="text-gray-700 leading-relaxed">
                ConsistencyGrid ("we," "us," or "our") operates the website and application. This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.
              </p>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Information Collection and Use</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">1.1 Account Information</h3>
                  <p className="text-gray-700">
                    When you create an account, we collect: name, email address, password (hashed), and profile information. This information is used to provide and improve our service.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">1.2 User-Generated Content</h3>
                  <p className="text-gray-700">
                    We collect habits, goals, reminders, and other data you create within the application. This data is stored to provide tracking and analytics features.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">1.3 Automatically Collected Information</h3>
                  <p className="text-gray-700">
                    We automatically collect usage data including: IP address, browser type, pages visited, time and date stamps, and device information. This helps us understand how you use our service and improve it.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Use of Data</h2>
              <p className="text-gray-700 mb-4">
                ConsistencyGrid uses the collected data for various purposes:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>To provide and maintain our service</li>
                <li>To notify you about changes to our service</li>
                <li>To provide customer support</li>
                <li>To gather analysis or valuable information so that we can improve our service</li>
                <li>To monitor the usage of our service</li>
                <li>To detect, prevent, and address technical and security issues</li>
                <li>To provide personalized recommendations</li>
              </ul>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Security of Data</h2>
              <p className="text-gray-700">
                The security of your data is important to us but remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mt-4">
                <li>Passwords are hashed using bcryptjs with cost factor 12</li>
                <li>All data is transmitted over HTTPS encrypted connections</li>
                <li>Session tokens expire after 1 year</li>
                <li>HttpOnly cookies prevent XSS attacks</li>
                <li>Rate limiting prevents brute force attacks</li>
              </ul>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. GDPR Compliance</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  If you are a resident of the European Economic Area (EEA), you have certain data protection rights. ConsistencyGrid aims to take reasonable steps to allow you to correct, amend, delete, or limit the use of your Personal Data.
                </p>
                <p className="font-semibold">Your rights include:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Right to access your personal data</li>
                  <li>Right to correct inaccurate data</li>
                  <li>Right to request deletion of your data</li>
                  <li>Right to restrict processing of your data</li>
                  <li>Right to data portability</li>
                  <li>Right to withdraw consent</li>
                </ul>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Cookies</h2>
              <p className="text-gray-700 mb-4">
                We use cookies and similar tracking technologies to track activity on our Service and to hold certain information. Cookies are files with a small amount of data that are stored on your device.
              </p>
              <div className="space-y-2 text-gray-700">
                <p><strong>Session Cookies:</strong> Used to maintain your logged-in state (valid for 1 year)</p>
                <p><strong>Preference Cookies:</strong> Store your settings and preferences</p>
                <p><strong>Analytics Cookies:</strong> Help us understand how you use our service</p>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Third-Party Services</h2>
              <p className="text-gray-700 mb-4">
                Our Service may contain links to third-party sites that are not operated by us. This Privacy Policy does not apply to third-party websites and we are not responsible for their privacy practices.
              </p>
              <p className="text-gray-700">
                We recommend reviewing the Privacy Policy of any third-party services before providing your personal information.
              </p>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Changes to This Privacy Policy</h2>
              <p className="text-gray-700">
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date at the top of this policy.
              </p>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Contact Us</h2>
              <p className="text-gray-700">
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <div className="mt-4 space-y-2 text-gray-700">
                <p><strong>Email:</strong> privacy@consistencygrid.com</p>
                <p><strong>Website:</strong> www.consistencygrid.com</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
