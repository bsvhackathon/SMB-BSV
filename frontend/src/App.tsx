import React, { useState } from 'react';
import { GithubIcon, ShieldCheck, Server, BookOpen, ArrowRight, Sparkles } from 'lucide-react';
import { WalletClient } from '@bsv/sdk';
import { Buffer } from 'buffer';

function App() {
  const [serverUrl, setServerUrl] = useState('http://localhost:3002');
  const [isLoading, setIsLoading] = useState(false);
  const [certsJSON, showCerts] = useState<string | null>(null);
  
 const fetchAndDisplayCertificates = async () => {
  const walletClient = new WalletClient('json-api');
  const certs = await walletClient.listCertificates({
    certifiers: [],
    types: [],
  });
  const filterCerts = certs.certificates.filter(cert => cert.fields.store_id && cert.fields.product_id && cert.fields.product_name && cert.fields.identity_key_purchaser && cert.fields.date_of_purchase);
  
  const decrypted: Record<string, string> = {}
  
  const certFields = filterCerts.map(async (cert) => {
    for (const fieldName of Object.keys(cert.fields)) {
      const kenc = cert.keyring[fieldName];
      const venc = cert.fields[fieldName];
      
      try {
        const vdec = await walletClient.decrypt({kenc, protocolID:[0,'AES256'],keyID:kenc})
        decrypted[fieldName] = vdec.toString('utf-8')
      } catch (err) {
        console.log(err)
        decrypted[fieldName] = '[corrupted]'
      }
    }
      
    return decrypted;
  });
  showCerts(JSON.stringify(certFields, null, 2));
};
 
  ///

  const handleGetCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    const walletClient = new WalletClient('json-api')
    const result = await walletClient.acquireCertificate({
      certifier: '021268b14006a905d76c68a10974fe49ee068cbad955f74f1e3ded354b6dfb54d7',
      certifierUrl: serverUrl,
      type: 'AGfk/WrT1eBDXpz3mcw386Zww2HmqcIn3uY6x4Af1eo=',
      acquisitionProtocol: 'issuance',
      fields: {
          store_id: 'store_id',
          product_id: 'product_id',
          product_name: 'product_name',
          date_of_purchase: 'date_of_purchase',
          identity_key_purchaser: 'identity_key_purchaser',
      }
    })
    console.log(result)
    setIsLoading(false)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <button
        type="button"
        onClick={fetchAndDisplayCertificates}
        className="w-full mt-4 bg-gray-700 text-white py-2 px-4 rounded hover:bg-gray-800 transition-colors"
      >Load Certificates</button>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {certsJSON && (
          <div className="max-w-4xl mx-auto px-4 py-4 mb-4 bg-gray-100 rounded shadow">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Purchase Certificates:</h2>
            <pre className="text-sm overflow-auto whitespace-pre-wrap">{certsJSON}</pre>
          </div>
        )}
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <ShieldCheck className="w-12 h-12 text-blue-600" />
            <Sparkles className="w-8 h-8 text-yellow-500 animate-pulse" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">CoolCert Identity Certificate</h1>
          <p className="text-xl text-gray-600">Get certified as officially cool! 😎</p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">What is CoolCert?</h2>
            <p className="text-gray-600 mb-4">
              CoolCert is a playful example of an identity certificate system. It's designed to help you understand
              how identity certificates work in a fun and approachable way. While this certificate only proves
              you're "cool" (which you definitely are! 🌟), the underlying technology is similar to real-world
              identity verification systems.
            </p>
          </div>

          {/* Certificate Form */}
          <form onSubmit={handleGetCertificate} className="mb-8">
            <div className="mb-6">
              <label htmlFor="serverUrl" className="block text-sm font-medium text-gray-700 mb-2">
                CoolCert Server URL
              </label>
              <div className="flex items-center">
                <Server className="w-5 h-5 text-gray-400 mr-2" />
                <input
                  type="url"
                  id="serverUrl"
                  value={serverUrl}
                  onChange={(e) => setServerUrl(e.target.value)}
                  className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter server URL"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                'Getting your certificate...'
              ) : (
                <>
                  Get Your Cool Certificate
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Documentation */}
          <div className="border-t pt-8">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-semibold text-gray-800">Quick Guide</h3>
            </div>
            <div className="space-y-4 text-gray-600">
              <p>
                1. Identity certificates are digital documents that prove who you are online.
              </p>
              <p>
                2. They work like a digital ID card, helping services verify your identity.
              </p>
              <p>
                3. CoolCert is a simple example to help you understand the basics.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="flex justify-center items-center gap-6 text-gray-600">
          <a
            href="https://github.com/p2ppsr/coolcert"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-blue-600 transition-colors"
          >
            <GithubIcon className="w-5 h-5" />
            GitHub Repository
          </a>
          <a
            href="https://docs.babbage.systems"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-blue-600 transition-colors"
          >
            <BookOpen className="w-5 h-5" />
            Documentation
          </a>
        </div>
      </div>
    </div>
  );
}

export default App;
