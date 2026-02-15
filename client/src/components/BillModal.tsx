import React from 'react';
import { X, Printer, CheckCircle } from 'lucide-react';
import { Bill, Customer } from '../types';

interface BillModalProps {
  isOpen: boolean;
  onClose: () => void;
  bill: Bill | null;
  customer: Customer | null;
}

const BillModal: React.FC<BillModalProps> = ({ isOpen, onClose, bill, customer }) => {
  if (!isOpen || !bill || !customer) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black/50 backdrop-blur-sm p-4 print:p-0 print:bg-white">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl print:shadow-none print:w-full print:max-w-none">
        
        {/* Header - Hidden in Print */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 print:hidden">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
            Bill Generated Successfully
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors focus:outline-none"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Bill Content - Printable Area */}
        <div className="p-8 print:p-0" id="printable-bill">
          <div className="border-2 border-gray-800 p-6 rounded-lg print:border-2 print:border-black">
            
            {/* Bill Header */}
            <div className="text-center border-b-2 border-gray-800 pb-4 mb-6">
              <h1 className="text-3xl font-bold text-gray-900 uppercase tracking-widest">Water Bill</h1>
              <p className="text-sm text-gray-600 mt-1">Water Supply Management System</p>
              <p className="text-xs text-gray-500">123 Water Works Lane, City, Country</p>
            </div>

            {/* Bill Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Customer Details</h4>
                <div className="bg-gray-50 p-3 rounded-lg print:bg-transparent print:p-0">
                  <p className="font-bold text-lg text-gray-900">{customer.full_name}</p>
                  <p className="text-sm text-gray-600">{customer.address}</p>
                  <div className="mt-2 text-sm">
                    <span className="font-medium text-gray-500">Account #: </span>
                    <span className="text-gray-900">{customer.account_number || 'N/A'}</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium text-gray-500">Meter #: </span>
                    <span className="text-gray-900">{customer.meter_number}</span>
                  </div>
                </div>
              </div>

              <div className="text-left md:text-right">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Bill Info</h4>
                <div className="bg-gray-50 p-3 rounded-lg print:bg-transparent print:p-0">
                  <div className="mb-2">
                    <p className="text-xs text-gray-500 uppercase">Bill Month</p>
                    <p className="font-bold text-lg text-gray-900">
                      {new Date(bill.bill_month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Bill No.</p>
                    <p className="font-mono text-gray-900">#{bill.id.toString().padStart(6, '0')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Usage Details */}
            <div className="mb-8">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Consumption Details</h4>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100 text-gray-600 print:bg-gray-100">
                    <th className="px-4 py-2 text-left rounded-l-md">Description</th>
                    <th className="px-4 py-2 text-right rounded-r-md">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="px-4 py-3 text-gray-900">Units Consumed</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">{bill.units} Units</td>
                  </tr>
                  
                  {/* Current Month Charge Calculation (Estimated) */}
                  <tr>
                    <td className="px-4 py-3 text-gray-900">Current Month Charge</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">
                       ${(Number(bill.total_amount) - Number(bill.arrears || 0)).toFixed(2)}
                    </td>
                  </tr>

                  {/* Arrears Breakdown */}
                  {(bill.arrears || 0) > 0 && (
                    <>
                      <tr className="bg-red-50/50">
                        <td className="px-4 py-3 text-red-800 font-semibold" colSpan={2}>Arrears (Unpaid Dues)</td>
                      </tr>
                      {bill.arrears_breakdown?.map((item, index) => (
                        <tr key={index}>
                          <td className="px-8 py-2 text-gray-600">
                             {new Date(item.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                          </td>
                          <td className="px-4 py-2 text-right text-gray-600">
                            ${Number(item.amount).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                      {(!bill.arrears_breakdown || bill.arrears_breakdown.length === 0) && (
                         <tr>
                           <td className="px-8 py-2 text-gray-600">Previous Balance</td>
                           <td className="px-4 py-2 text-right text-gray-600">${Number(bill.arrears || 0).toFixed(2)}</td>
                         </tr>
                      )}
                      <tr className="bg-gray-50 font-medium">
                        <td className="px-4 py-2 text-gray-900">Total Arrears</td>
                        <td className="px-4 py-2 text-right text-gray-900">${Number(bill.arrears || 0).toFixed(2)}</td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>

            {/* Total Amount */}
            <div className="flex justify-end border-t-2 border-gray-800 pt-4">
              <div className="text-right">
                <p className="text-sm text-gray-500 uppercase font-bold mb-1">Total Amount Due</p>
                <p className="text-4xl font-extrabold text-blue-600 print:text-black">
                  ${Number(bill.total_amount).toFixed(2)}
                </p>
                <p className="text-xs text-red-500 mt-1 font-medium uppercase">{bill.status}</p>
              </div>
            </div>
            
            {/* Footer */}
            <div className="mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-400">
              <p>Thank you for your timely payment.</p>
              <p>For any queries, please contact support.</p>
            </div>

          </div>
        </div>

        {/* Footer Actions - Hidden in Print */}
        <div className="p-4 border-t border-gray-100 flex justify-end space-x-3 bg-gray-50 rounded-b-2xl print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print Bill
          </button>
        </div>
      </div>
    </div>
  );
};

export default BillModal;
