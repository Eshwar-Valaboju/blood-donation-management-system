import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Download, Search } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import { 
  supplyService, 
  userService, 
  requestService 
} from '../../utils/localStorage';
import { BloodSupply, User, BloodRequest } from '../../types/models';

const ManageSupplies: React.FC = () => {
  const [supplies, setSupplies] = useState<BloodSupply[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    loadSupplies();
  }, []);
  
  const loadSupplies = () => {
    const allSupplies = supplyService.getAll();
    setSupplies(allSupplies.sort((a, b) => 
      new Date(b.supplyDate).getTime() - new Date(a.supplyDate).getTime()
    ));
  };
  
  const exportToCSV = () => {
    if (supplies.length === 0) return;
    
    const headers = ['Supply Date', 'Receiver', 'Blood Group', 'Quantity', 'Collection Center', 'Notes'];
    
    const csvRows = [];
    csvRows.push(headers.join(','));
    
    for (const supply of supplies) {
      const user = userService.getById(supply.userId);
      const row = [
        format(new Date(supply.supplyDate), 'yyyy-MM-dd'),
        user?.name || 'Unknown',
        supply.bloodGroup,
        supply.quantity,
        supply.collectionCenter,
        supply.notes || ''
      ];
      
      // Escape commas and quotes
      const escapedRow = row.map(field => {
        if (field.includes(',') || field.includes('"')) {
          return `"${field.replace(/"/g, '""')}"`;
        }
        return field;
      });
      
      csvRows.push(escapedRow.join(','));
    }
    
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `blood_supplies_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const filteredSupplies = supplies.filter(supply => {
    const user = userService.getById(supply.userId);
    const userName = user?.name || '';
    const request = requestService.getById(supply.requestId);
    
    return (
      userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supply.bloodGroup.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supply.collectionCenter.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request?.hospitalName || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  });
  
  return (
    <AdminLayout title="Blood Supplies">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Blood Supplies</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Track blood supplied to recipients</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search supplies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              onClick={exportToCSV}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Download className="mr-2 h-5 w-5" />
              Export CSV
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supply Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Receiver
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Blood Group
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Collection Center
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hospital
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSupplies.map((supply) => {
                const receiver = userService.getById(supply.userId);
                const request = requestService.getById(supply.requestId);
                return (
                  <tr key={supply.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(supply.supplyDate), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {receiver?.name || 'Unknown'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        {supply.bloodGroup}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {supply.quantity} unit(s)
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {supply.collectionCenter}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {request?.hospitalName || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {supply.notes || '-'}
                    </td>
                  </tr>
                );
              })}
              {filteredSupplies.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    No supplies found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ManageSupplies;