import React from 'react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 font-sans leading-relaxed">
      <h1 className="text-3xl font-bold text-gray-800 border-b-2 border-gray-800 pb-2 mb-6">Privacy Policy</h1>
      <p className="mb-6">
        At SingMeSong, we value your privacy and are committed to safeguarding your personal information. 
        This policy outlines how we collect, use, and protect your data when you interact with our website and services.
      </p>

      <h2 className="text-2xl font-semibold text-gray-700 mt-8 mb-4">1. Information We Collect</h2>
      
      <h3 className="text-xl font-semibold text-gray-600 mt-6 mb-2">Personal Information</h3>
      <p className="mb-2">We may gather identifiable information such as:</p>
      <ul className="list-disc pl-6 mb-4">
        <li>Name</li>
        <li>Email address</li>
        <li>Postal address</li>
        <li>Phone number</li>
        <li>Payment details</li>
        <li>Other information you provide</li>
      </ul>
      <p className="mb-2">This occurs when you:</p>
      <ul className="list-disc pl-6 mb-4">
        <li>Create an account</li>
        <li>Subscribe to our services</li>
        <li>Make a purchase</li>
        <li>Join our mailing list</li>
        <li>Participate in surveys or contests</li>
        <li>Contact our support team</li>
      </ul>

      <h3 className="text-xl font-semibold text-gray-600 mt-6 mb-2">Non-Personal Information</h3>
      <p className="mb-2">We collect non-identifiable data during your site interactions, including:</p>
      <ul className="list-disc pl-6 mb-4">
        <li>Browser type and version</li>
        <li>Operating system</li>
        <li>IP address</li>
        <li>Referring URLs</li>
        <li>Site activity (pages visited, time spent, etc.)</li>
      </ul>

      <h3 className="text-xl font-semibold text-gray-600 mt-6 mb-2">Cookies and Tracking</h3>
      <p className="mb-4">
        We use cookies and similar technologies to enhance your experience and collect usage data. 
        You can adjust your browser settings to refuse cookies, but some features may not function properly.
      </p>

      <h2 className="text-2xl font-semibold text-gray-700 mt-8 mb-4">2. How We Use Your Information</h2>
      <p className="mb-2">We utilize your information to:</p>
      <ul className="list-disc pl-6 mb-4">
        <li>Operate and improve our services</li>
        <li>Verify your identity and manage accounts</li>
        <li>Process transactions</li>
        <li>Personalize your experience</li>
        <li>Analyze usage patterns</li>
        <li>Develop new features</li>
        <li>Communicate with you</li>
        <li>Provide customer support</li>
        <li>Send updates and marketing materials</li>
        <li>Respond to inquiries</li>
        <li>Prevent fraud</li>
        <li>Comply with legal obligations</li>
      </ul>

      <h2 className="text-2xl font-semibold text-gray-700 mt-8 mb-4">3. Sharing Your Information</h2>
      <p className="mb-2">We may share your data:</p>
      <ul className="list-disc pl-6 mb-4">
        <li>With service providers (e.g., payment processors, analytics providers)</li>
        <li>During business transfers (mergers, acquisitions)</li>
        <li>With affiliates and business partners</li>
        <li>To comply with legal requirements</li>
        <li>With your consent</li>
      </ul>

      <h2 className="text-2xl font-semibold text-gray-700 mt-8 mb-4">4. Data Security</h2>
      <p className="mb-2">We implement various security measures, including:</p>
      <ul className="list-disc pl-6 mb-4">
        <li>Data encryption</li>
        <li>Access controls</li>
        <li>Regular security audits</li>
        <li>Incident response planning</li>
      </ul>
      <p className="mb-4">While we strive to protect your information, no method is 100% secure.</p>

      <h2 className="text-2xl font-semibold text-gray-700 mt-8 mb-4">5. Your Data Protection Rights</h2>
      <p className="mb-2">Depending on your location, you may have the right to:</p>
      <ul className="list-disc pl-6 mb-4">
        <li>Access your personal data</li>
        <li>Request corrections to your data</li>
        <li>Delete your data</li>
        <li>Restrict processing of your data</li>
        <li>Data portability</li>
        <li>Object to data processing</li>
      </ul>
      <p className="mb-4">To exercise these rights, please contact us at [contact email].</p>

      <h2 className="text-2xl font-semibold text-gray-700 mt-8 mb-4">6. Updates to This Policy</h2>
      <p className="mb-4">
        We may update this policy periodically. Please review it regularly to stay informed about how we protect your information.
      </p>

      <h2 className="text-2xl font-semibold text-gray-700 mt-8 mb-4">7. Contact Us</h2>
      <p className="mb-4">If you have questions about this policy or our data practices, please contact us at:</p>
      <div className="bg-gray-100 p-4 rounded-lg mb-4">
        <p>Muua Co., Ltd.</p>
        <p>Blk 160, Hougang Street 11, #01-101, Singapore 530160</p>
        <p>contact@singmesong.com</p>
        <p>+65 8783 7006</p>
      </div>

      <p className="text-sm text-gray-600">Last updated: 23rd October 2024</p>
    </div>
  );
};

export default PrivacyPolicy;