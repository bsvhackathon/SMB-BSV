import React, { useState } from 'react';
import { GithubIcon, ShieldCheck, Server, BookOpen, ArrowRight, Sparkles } from 'lucide-react';
import { WalletClient, AuthFetch } from '@bsv/sdk'
import { Buffer } from 'buffer';

function App() {
  const [serverUrl, setServerUrl] = useState('http://127.0.0.1:3002');
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [certificates, setCertificates] = useState([]);
  const [certsJSON, showCerts] = useState<string | null>(null);
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const walletClient = new WalletClient('json-api');
      const authFetch = new AuthFetch(walletClient);
      const response = await authFetch.fetch(`http://127.0.0.1:3002/getProducts`, {
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const productsDB = await response.json();
      console.log('Products:', productsDB);
       // Assuming `getProducts` fetches products from productsDB
      setProducts(productsDB.products);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchProducts();
  }, []);
  
  
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


  const sampleCertificates = [
    {
      "product_id": "L7J24ZaY6OH3XkiV2CEIHueiw7zZ5vtAo9xRyMecXI2Vfft5o8NcIZbHVTt2/Czji0mSE6H7S2vfuQ==",
      "product_name": "TYdvfzoSrUZOyYzFSW7jk4lsaKmmKbqZnvDjeHfCbxA6AlXhw22stN1AA+WWKeXBq0/gyh19NylbJP/d",
      "date_of_purchase": "l3Nn1AAj5HOQtwpbYGswnKBnvojyW+njVkDGFX/tY0c9GpnBHh/qiBg4nd7blJVTRei6+qJA8WgLGw3jVme/Sw==",
      "identity_key_purchaser": "iJk1X7gTEEPp7T8UOzV9AQ2qHSMSkaeBOmmFixK5/kzFGaE/LXIbRIeopumyhhbI3qcVXdMNA8TXBYxx+6Uh1AzZMpInBw=="
    },
    {
      "product_id": "0x9DrO3IEQgBZVL4/Qf3ncWRIFfL56iINh9tUbgPmeCb4DUlecYmfOhWaTmxsgLg5wlGYdRIr6XA8g==",
      "product_name": "uXV6dED0slSwJIX6tMdB608gf2fQLY8T+WOgdXMs1QHfzhA5pCr2kZovICCDzGYtWt3+BmwFYzN/qJ5R",
      "date_of_purchase": "tlREY1K7j+Ehbegv5dco4Ki/GFd+vM/4WfYKCOfli3RcZ+8B1tbrAh/5BVLdXWRVzlF0YhRJqih6h2ugB9ZMCQ==",
      "identity_key_purchaser": "TbeNNUh6TWuSTkIthEWPjsH6qc8fZImyPV4d/hV/5jlpXl8j8eD3bpf10BXcH1OOugyD1+xZL7seozAxd/Bj0muoXaFc+g=="
    }
  ];

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
//       <button
//         type="button"
//         onClick={fetchAndDisplayCertificates}
//         className="w-full mt-4 bg-gray-700 text-white py-2 px-4 rounded hover:bg-gray-800 transition-colors"
//       >Load Certificates</button>

//       <div className="max-w-4xl mx-auto px-4 py-12">
//         {certsJSON && (
//           <div className="max-w-4xl mx-auto px-4 py-4 mb-4 bg-gray-100 rounded shadow">
//             <h2 className="text-lg font-semibold text-gray-700 mb-2">Purchase Certificates:</h2>
//             <pre className="text-sm overflow-auto whitespace-pre-wrap">{certsJSON}</pre>
//           </div>
//         )}
//         {/* Header */}
//         <div className="text-center mb-12">
//           <div className="flex items-center justify-center gap-2 mb-4">
//             <ShieldCheck className="w-12 h-12 text-blue-600" />
//             <Sparkles className="w-8 h-8 text-yellow-500 animate-pulse" />
//           </div>
//           <h1 className="text-4xl font-bold text-gray-900 mb-4">CoolCert Identity Certificate</h1>
//           <p className="text-xl text-gray-600">Get certified as officially cool! 😎</p>
//         </div>


  const handleCheckout = async () => {
    setIsLoading(true);
    console.log('Checkout initiated');
    console.log('Cart:', cart);
    console.log(JSON.stringify({ cart }));
    try {
      // Simulate API call to process the checkout
      const walletClient = new WalletClient('auto');
      const authFetch = new AuthFetch(walletClient);
      const response = await authFetch.fetch(`http://127.0.0.1:3002/checkoutCart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cart }),
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const result = await response.json();
      console.log('Checkout result:', result);
    } catch (error) {
      console.error('Error during checkout:', error);
    } finally {
      setIsLoading(false);
    }
    // Clear the cart after checkout
    setCart([]);
    setCertificates(sampleCertificates); // Set the sample certificates
    // Optionally, you can redirect to a confirmation page or show a success message
    setShowModal(true);

  };

  const handlePurchase = (productId) => {
    const product = products.find(p => p.product_id === productId);
    
    if (product) {
      setCart([...cart, product]);
      // In a real app, you might update stock here or call an API
    }
  };

  const CertificateModal = ({ show, onClose, certificates }) => {
    if (!show) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-screen overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Purchase Certificates</h2>
              <button 
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-6">
              {certificates.map((cert, index) => (
                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between mb-2">
                    <span className="font-semibold">Certificate #{index + 1}</span>
                    <span className="text-green-600 font-bold">Verified ✓</span>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-3 gap-2">
                      <span className="font-medium">Product ID:</span>
                      <span className="col-span-2 font-mono truncate">{cert.product_id}</span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <span className="font-medium">Product Name:</span>
                      <span className="col-span-2 font-mono truncate">{cert.product_name}</span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <span className="font-medium">Purchase Date:</span>
                      <span className="col-span-2 font-mono truncate">{cert.date_of_purchase}</span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <span className="font-medium">Identity Key:</span>
                      <span className="col-span-2 font-mono truncate">{cert.identity_key_purchaser}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 flex justify-center">
              <button
                onClick={onClose}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Available Products</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {products.map((product) => (
          <div key={product.product_id} className="border rounded-lg shadow-md p-4">
            <div className="flex justify-center mb-4">
              <img 
                src={`/api/placeholder/200/150`} 
                alt={product.name} 
                className="rounded-md"
              />
            </div>
            <h2 className="text-xl font-semibold">{product.name}</h2>
            <p className="text-gray-600 mt-2">${product.price.toFixed(2)}</p>
            <p className="text-sm text-gray-500 mt-1">In stock: {product.stock}</p>
            
            <button 
              onClick={() => handlePurchase(product.product_id)}
              className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
      
      {cart.length > 0 && (
        <div className="mt-8 p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Cart ({cart.length})</h2>
          <ul className="divide-y">
            {cart.map((item, index) => (
              <li key={index} className="py-2 flex justify-between">
                <span>{item.name}</span>
                <span>${item.price.toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 text-right font-bold">
            Total: ${cart.reduce((sum, item) => sum + item.price, 0).toFixed(2)}
          </div>
            <button 
            onClick={() =>handleCheckout()}
            className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md transition-colors"
            >
            Checkout
            </button>
        </div>
      )}
      <CertificateModal 
        show={showModal} 
        onClose={() => setShowModal(false)} 
        certificates={certificates} 
      />
    </div>
  );
};




export default App;
