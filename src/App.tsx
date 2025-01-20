import { useState } from 'react';

interface Item {
  quantity: string;
  rate: string;
}

function App() {
  const [items, setItems] = useState<Item[]>([{ quantity: '', rate: '' }]);
  const [packing, setPacking] = useState<string>('');
  const [gstRate, setGstRate] = useState<string>('18');
  const [gstType, setGstType] = useState<'igst' | 'cgst_sgst'>('igst');

  const addNewItem = () => {
    setItems([...items, { quantity: '', rate: '' }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof Item, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  // Calculate totals
  const itemAmounts = items.map(item => {
    const qty = parseFloat(item.quantity) || 0;
    const rate = parseFloat(item.rate) || 0;
    return qty * rate;
  });

  const basicAmount = itemAmounts.reduce((sum, amount) => sum + amount, 0);
  const packingAmount = parseFloat(packing) || 0;
  const amountWithPacking = basicAmount + packingAmount;
  const gstRateDecimal = (parseFloat(gstRate) || 0) / 100;
  const rawGstAmount = amountWithPacking * gstRateDecimal;
  
  // Handle IGST rounding (round to nearest whole number)
  const igst = gstType === 'igst' ? Math.round(rawGstAmount) : 0;

  // Handle CGST/SGST rounding (round down below 0.5, round up >= 0.5)
  const rawHalfGst = gstType === 'cgst_sgst' ? rawGstAmount / 2 : 0;
  const cgst = gstType === 'cgst_sgst' ? 
    (rawHalfGst % 1 < 0.5 ? Math.floor(rawHalfGst) : Math.ceil(rawHalfGst)) : 0;
  const sgst = cgst; // SGST is always equal to CGST

  // Calculate grand total based on GST type
  const gstTotal = gstType === 'igst' ? igst : (cgst + sgst);
  const grandTotal = amountWithPacking + gstTotal;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Invoice Calculator</h1>
          <p className="text-gray-600 mt-2">Calculate your invoice with GST</p>
        </div>
        
        <div className="space-y-8">
          {/* Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Items</h2>
              <button
                onClick={addNewItem}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Add Item
              </button>
            </div>
            
            {items.map((item, index) => (
              <div key={index} className="flex gap-4 items-start p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">Quantity {index + 1}</label>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="Enter quantity"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">Rate {index + 1}</label>
                  <input
                    type="number"
                    value={item.rate}
                    onChange={(e) => updateItem(index, 'rate', e.target.value)}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="Enter rate"
                  />
                </div>
                <div className="pt-6">
                  <button
                    onClick={() => removeItem(index)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                    disabled={items.length === 1}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Packing Charges */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-700">Packing Charges</label>
            <input
              type="number"
              value={packing}
              onChange={(e) => setPacking(e.target.value)}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Enter packing charges"
            />
          </div>

          {/* GST Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-700">GST Rate (%)</label>
              <input
                type="number"
                value={gstRate}
                onChange={(e) => setGstRate(e.target.value)}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Enter GST rate"
              />
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-700">GST Type</label>
              <select
                value={gstType}
                onChange={(e) => setGstType(e.target.value as 'igst' | 'cgst_sgst')}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="igst">IGST</option>
                <option value="cgst_sgst">CGST + SGST</option>
              </select>
            </div>
          </div>

          {/* Calculations */}
          <div className="mt-8 space-y-4 bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Summary</h2>
            
            {items.map((item, index) => {
              const amount = (parseFloat(item.quantity) || 0) * (parseFloat(item.rate) || 0);
              if (amount > 0) {
                return (
                  <div key={index} className="flex justify-between text-sm">
                    <span>Item {index + 1} Amount (Qty × Rate):</span>
                    <span>₹{amount.toFixed(2)}</span>
                  </div>
                );
              }
              return null;
            })}
            
            <div className="flex justify-between font-medium pt-4 border-t border-gray-200">
              <span>Basic Amount:</span>
              <span>₹{basicAmount.toFixed(2)}</span>
            </div>
            
            {packingAmount > 0 && (
              <div className="flex justify-between bg-indigo-50 p-2 rounded-lg font-medium">
                <span>Amount with Packing:</span>
                <span>₹{amountWithPacking.toFixed(2)}</span>
              </div>
            )}

            {gstType === 'igst' ? (
              <div className="flex justify-between">
                <span>IGST ({gstRate}%):</span>
                <span>₹{igst.toFixed(2)}</span>
              </div>
            ) : (
              <>
                <div className="flex justify-between">
                  <span>CGST ({(parseFloat(gstRate) / 2).toFixed(1)}%):</span>
                  <span>₹{cgst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>SGST ({(parseFloat(gstRate) / 2).toFixed(1)}%):</span>
                  <span>₹{sgst.toFixed(2)}</span>
                </div>
              </>
            )}

            <div className="flex justify-between pt-4 border-t border-gray-200 text-lg font-bold text-indigo-700">
              <span>Grand Total:</span>
              <span>₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;