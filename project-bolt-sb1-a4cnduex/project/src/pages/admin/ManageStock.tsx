import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import AdminLayout from '../../components/layout/AdminLayout';
import { stockService } from '../../utils/localStorage';
import { BloodStock, BloodGroup } from '../../types/models';

const ManageStock: React.FC = () => {
  const [bloodStock, setBloodStock] = useState<BloodStock[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Record<string, number>>({});
  
  useEffect(() => {
    loadBloodStock();
  }, []);
  
  const loadBloodStock = () => {
    const stock = stockService.getAll().sort((a, b) => {
      // Sort blood groups: first by letter (A, B, AB, O), then by sign (+ before -)
      const letterOrder = { 'A': 1, 'B': 2, 'AB': 3, 'O': 4 };
      const aLetter = a.bloodGroup.replace(/[+-]/, '');
      const bLetter = b.bloodGroup.replace(/[+-]/, '');
      
      if (letterOrder[aLetter as keyof typeof letterOrder] !== letterOrder[bLetter as keyof typeof letterOrder]) {
        return letterOrder[aLetter as keyof typeof letterOrder] - letterOrder[bLetter as keyof typeof letterOrder];
      }
      
      // Same letter, sort by sign (+ before -)
      return a.bloodGroup.includes('-') ? 1 : -1;
    });
    
    setBloodStock(stock);
    
    // Initialize form data
    const initialData: Record<string, number> = {};
    stock.forEach(item => {
      initialData[item.bloodGroup] = item.quantity;
    });
    setFormData(initialData);
  };
  
  const handleInputChange = (bloodGroup: string, value: string) => {
    const quantity = parseInt(value, 10);
    if (isNaN(quantity) || quantity < 0) return;
    
    setFormData(prev => ({
      ...prev,
      [bloodGroup]: quantity
    }));
  };
  
  const handleSaveChanges = () => {
    // Update stock quantities
    bloodStock.forEach(stock => {
      if (formData[stock.bloodGroup] !== stock.quantity) {
        stockService.updateQuantity(
          stock.bloodGroup, 
          formData[stock.bloodGroup] - stock.quantity
        );
      }
    });
    
    setEditMode(false);
    loadBloodStock(); // Reload updated data
  };
  
  // Colors for blood groups
  const BLOOD_COLORS = {
    'A+': '#e53e3e',
    'A-': '#fc8181',
    'B+': '#dd6b20',
    'B-': '#f6ad55',
    'AB+': '#805ad5',
    'AB-': '#b794f4',
    'O+': '#38a169',
    'O-': '#68d391'
  };
  
  // Format blood stock for pie chart
  const bloodStockForChart = bloodStock.map(stock => ({
    name: stock.bloodGroup,
    value: stock.quantity
  }));
  
  // Calculate total units
  const totalUnits = bloodStock.reduce((sum, stock) => sum + stock.quantity, 0);
  
  // Get critical levels (less than 5 units)
  const criticalLevels = bloodStock.filter(stock => stock.quantity < 5);
  
  return (
    <AdminLayout title="Blood Stock Management">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-red-100 rounded-md p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Blood Units</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">{totalUnits}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Critical Levels</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">{criticalLevels.length}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Last Updated</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">
                        {bloodStock.length > 0 
                          ? format(new Date(bloodStock[0].lastUpdated), 'MMM dd, yyyy')
                          : 'N/A'}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Blood Stock Visual */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">Blood Stock</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">Current blood inventory by group</p>
              </div>
              <button
                onClick={() => setEditMode(!editMode)}
                className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  editMode ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              >
                {editMode ? 'Save Changes' : 'Update Stock'}
              </button>
            </div>
            <div className="border-t border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Blood Group
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Available Units
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bloodStock.map((stock) => (
                    <tr key={stock.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{ backgroundColor: BLOOD_COLORS[stock.bloodGroup] + '20' }}>
                            <span className="text-sm font-semibold" style={{ color: BLOOD_COLORS[stock.bloodGroup] }}>{stock.bloodGroup}</span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{stock.bloodGroup}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editMode ? (
                          <input
                            type="number"
                            value={formData[stock.bloodGroup]}
                            onChange={(e) => handleInputChange(stock.bloodGroup, e.target.value)}
                            min="0"
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-20 sm:text-sm border-gray-300 rounded-md"
                          />
                        ) : (
                          <div className="text-sm text-gray-900 font-semibold">{stock.quantity} unit(s)</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {stock.quantity < 5 ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            Critical
                          </span>
                        ) : stock.quantity < 10 ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Low
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Sufficient
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {editMode && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex justify-end">
                    <button
                      onClick={() => setEditMode(false)}
                      className="mr-3 px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveChanges}
                      className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Blood Distribution</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Visual representation of blood stock</p>
            </div>
            <div className="border-t border-gray-200 h-80 p-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={bloodStockForChart}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {bloodStockForChart.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={BLOOD_COLORS[entry.name] || '#000000'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} units`, 'Quantity']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        {/* Critical Levels Alert */}
        {criticalLevels.length > 0 && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Critical Blood Stock Levels
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <ul className="list-disc pl-5 space-y-1">
                    {criticalLevels.map(stock => (
                      <li key={stock.id}>
                        {stock.bloodGroup}: Only {stock.quantity} unit(s) available
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ManageStock;