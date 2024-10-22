import React, { useState } from 'react';

const ContactPage: React.FC = () => {
  const [copySuccess, setCopySuccess] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">Contact Us</h1>
      <p className="mb-8">Got a question? We've got answers. For additional inquiries, feel free to contact us.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-2">Company Name</h2>
          <p>Muua Co Ltd</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Email</h2>
          <div className="flex items-center space-x-2">
            <p><a href="mailto:son@singmesong.com" className="text-blue-600 hover:underline">son@singmesong.com</a></p>
            <button
              onClick={() => copyToClipboard('son@singmesong.com')}
              className="px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              {copySuccess ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
        <div className="md:col-span-2">
          <h2 className="text-xl font-semibold mb-2">Address</h2>
          <p>#14-41, Blk 160, Hougang Street 11, Singapore 530160</p>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
