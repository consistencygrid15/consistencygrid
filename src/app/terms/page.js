import Navbar from '@/components/layout/Navbar';
import Card from '@/components/ui/Card';
import { FileText } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#fffaf1] to-white">
      <Navbar />
      <div className="pt-8 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-8 h-8 text-orange-500" />
              <h1 className="text-4xl font-bold text-gray-900">Terms of Service</h1>
            </div>
            <p className="text-gray-600">Last updated: January 22, 2026</p>
          </div>

          {/* Content */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700">
                By accessing and using ConsistencyGrid ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. License Grant</h2>
              <p className="text-gray-700 mb-4">
                ConsistencyGrid grants you a limited, non-exclusive, non-transferable, revocable license to use the Service for personal, non-commercial purposes in accordance with these terms.
              </p>
              <p className="text-gray-700">
                You may not: reproduce, duplicate, copy, sell, resell or exploit any portion of the Service without express written permission from ConsistencyGrid.
              </p>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Accounts</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  When you create an account with ConsistencyGrid, you are responsible for maintaining the security of your account and you are fully responsible for all activities that occur under the account.
                </p>
                <p>
                  You agree to immediately notify ConsistencyGrid of any unauthorized uses of your account or any other breaches of security.
                </p>
                <p>
                  ConsistencyGrid will not be liable for any acts or omissions by you, including any damages of any kind incurred as a result of such acts or omissions.
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Acceptable Use Policy</h2>
              <p className="text-gray-700 mb-4">
                You agree not to use the Service for any purpose that is unlawful or prohibited by these terms, including:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Harassing or causing distress or inconvenience to any person</li>
                <li>Obscene or abusive content</li>
                <li>Disrupting the normal flow of dialogue within our website or application</li>
                <li>Attempting to gain unauthorized access to our systems</li>
                <li>Attempting to obtain personal information about other users</li>
                <li>Commercial solicitation or spam</li>
                <li>Violating any applicable laws or regulations</li>
              </ul>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Intellectual Property Rights</h2>
              <p className="text-gray-700">
                The Service and its entire contents, features and functionality (including but not limited to all information, software, text, displays, images, video and audio) are owned by ConsistencyGrid, its licensors or other providers of such material and are protected by copyright, trademark, and other intellectual property laws.
              </p>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. User-Generated Content</h2>
              <p className="text-gray-700 mb-4">
                You retain all rights to any content you submit, post or display on or through the Service. You grant ConsistencyGrid a worldwide, non-exclusive, royalty-free license to use, copy, reproduce, process, adapt, modify, publish, transmit, display and distribute such content in any media or medium and for any purposes.
              </p>
              <p className="text-gray-700">
                You warrant that you own or have the necessary rights to the content you provide and that such content does not violate the intellectual property rights of any third party.
              </p>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Limitation of Liability</h2>
              <p className="text-gray-700">
                In no event shall ConsistencyGrid, nor its directors, employees, or agents, be liable to you for any damages, direct, indirect, incidental, special, punitive or consequential damages, losses or expenses arising out of or in connection with your use of the Service or any other dealings related to the Service.
              </p>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Disclaimer of Warranties</h2>
              <p className="text-gray-700 mb-4">
                The Service is provided on an "as is" and "as available" basis. ConsistencyGrid makes no warranties, expressed or implied, and hereby disclaims and negates any other warranties including any implied warranty of merchantability, fitness for a particular purpose, or non-infringement of intellectual property rights.
              </p>
              <p className="text-gray-700">
                We do not guarantee that the Service will be uninterrupted or error-free, or that defects will be corrected.
              </p>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Indemnification</h2>
              <p className="text-gray-700">
                You agree to indemnify and hold harmless ConsistencyGrid and its parent, subsidiaries, affiliates, officers, employees, agents, partners and licensors (if any) from any claim, demand, loss or damage, including reasonable attorneys' fees, arising out of or related to your violation of these Terms or your use of the Service.
              </p>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Termination</h2>
              <p className="text-gray-700">
                ConsistencyGrid may terminate your account and access to the Service at any time for any reason without notice if we believe you have violated these Terms or other policies. Upon termination, your right to use the Service will immediately cease.
              </p>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Modifications to Terms</h2>
              <p className="text-gray-700">
                ConsistencyGrid reserves the right to modify these terms at any time. Your continued use of the Service following the posting of modified Terms means that you accept and agree to the changes. If you do not agree to the modifications, your sole remedy is to cease using the Service.
              </p>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Data Deletion</h2>
              <p className="text-gray-700 mb-4">
                You can request deletion of your account and associated data at any time through your account settings or by contacting support.
              </p>
              <p className="text-gray-700">
                Upon deletion request, we will remove your personal data within 30 days, except where we are required to retain it by law.
              </p>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Contact Information</h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <div className="space-y-2 text-gray-700">
                <p><strong>Email:</strong> support@consistencygrid.com</p>
                <p><strong>Website:</strong> www.consistencygrid.com</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
