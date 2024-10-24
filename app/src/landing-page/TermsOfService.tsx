import React from 'react';

const TermsOfService: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 leading-relaxed">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white border-b-2 border-gray-800 dark:border-white pb-2 mb-6">Terms of Service</h1>
      <p className="mb-6">
        Effective Date: 23rd October 2024
      </p>
      <p className="mb-6">
        Welcome to SingMeSong, an AI-powered music generation service provided by Muua Co., Ltd. ("Company," "we," "us," or "our"). By accessing or using our services ("Services") through our website, you ("User," "you," or "your") agree to be bound by the following terms and conditions ("Terms of Service" or "Agreement"). If you do not agree to these terms, please do not use the Services.
      </p>

      <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mt-8 mb-4">1. Acceptance of Terms</h2>
      <p className="mb-4">
        By accessing and using the Services, you accept and agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these Terms of Service, you must not access or use the Services.
      </p>

      <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mt-8 mb-4">2. Changes to Terms</h2>
      <p className="mb-4">
        We may modify these Terms of Service from time to time. Any changes will be effective immediately upon posting the revised Terms of Service on the Site. Your continued use of the Services following the posting of changes constitutes your acceptance of such changes.
      </p>

      <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mt-8 mb-4">3. Use of Services</h2>
      <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mt-6 mb-2">Eligibility</h3>
      <p className="mb-4">
        You must be at least 18 years old to use the Services. By using the Services, you represent and warrant that you meet this eligibility requirement.
      </p>
      <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mt-6 mb-2">Account Registration</h3>
      <p className="mb-4">
        To use certain features of the Services, you may need to register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
      </p>
      <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mt-6 mb-2">Account Security</h3>
      <p className="mb-4">
        You are responsible for maintaining the confidentiality of your account information, including your username and password, and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account or any other breach of security.
      </p>

      <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mt-8 mb-4">4. Service Description</h2>
      <p className="mb-4">
        SingMeSong offers an AI-powered tool for generating music. While we strive to provide high-quality results, the actual quality and suitability of the generated music may vary based on various factors.
      </p>

      {/* Continue with other sections, rephrasing and adapting the content as needed */}

      <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mt-8 mb-4">5. Contact Information</h2>
      <p className="mb-4">
        If you have any questions about these Terms of Service, please contact us at:
      </p>
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-4">
        <p>Muua Co., Ltd.</p>
        <p>Blk 160, Hougang Street 11, #01-101, Singapore 530160</p>
        <p>contact@singmesong.com</p>
        <p>+65 8783 7006</p>
      </div>

      <p className="mb-4">
        By using our Services, you acknowledge that you have read and understand these Terms of Service and agree to be bound by them.
      </p>

      <p className="text-sm text-gray-600 dark:text-gray-400">Last updated: 23rd October 2024</p>
    </div>
  );
};

export default TermsOfService;
