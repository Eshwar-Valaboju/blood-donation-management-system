import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { PlusCircle, Trash2, Download, Search } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import AdminLayout from '../../components/layout/AdminLayout';
import { 
  donationService, 
  userService, 
  stockService 
} from '../../utils/localStorage';
import { Donation, BloodGroup, User } from '../../types/models';

const ManageDonations: React.FC = () => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    userId: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    bloodGroup: '',
    quantity: 1,
    collectionCenter: '',
    notes: ''
  });
  
  useEffect(() => {
    loadDonations();
    loadUsers();
  }, []);
  
  const loadDonations = () => {
    const allDonations = donationService.getAll();
    setDonations(allDonations.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ));
  };
  
  const loadUsers = () => {
    const allUsers = userService.getAll().filter(user => user.isDonor);
    setUsers(allUsers);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'userId' && value) {
      const selectedUser = users.find(user => user.id === value);
      if (selectedUser) {
        setFormData(prev => ({
          ...prev,
          [name]: value,
          bloodGroup: selectedUser.bloodGroup
        }));
        return;
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleDeleteDonation = (donationId: string) => {
    if (window.confirm('Are you sure you want to delete this donation record?')) {
      const donation = donationService.getById(donationId);
      
      if (donation) {
        // Decrement blood stock
        stockService.updateQuantity(donation.bloodGroup, -donation.quantity);
        
        // Delete the donation
        donationService.delete(donationId);
        loadDonations();
      }
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.userId || !formData.date || !formData.bloodGroup || !formData.collectionCenter) {
      alert('Please fill in all required fields');
      return;
    }
    
    const donationData: Donation = {
      id: uuidv4(),
      userId: formData.userId,
      date: new Date(formData.date).toISOString(),
      bloodGroup: formData.bloodGroup as BloodGroup,
      quantity: parseInt(formData.quantity.toString()),
      collectionCenter: formData.collectionCenter,
      notes: formData.notes,
      createdAt: new Date().toISOString()
    };
    
    // Add the donation
    donationService.add(donationData);
    
    // Update blood stock
    stockService.updateQuantity(donationData.bloodGroup, donationData.quantity);
    
    resetForm();
    loadDonations();
  };
  
  const resetForm = () => {
    setFormData({
      userId: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      bloodGroup: '',
      quantity: 1,
      collectionCenter: '',
      notes: ''
    });
    setShowForm(false);
  };
  
  const exportToCSV = () => {
    if (donations.length === 0) return;
    
    const headers = ['Date', 'Donor Name', 'Blood Group', 'Quantity', 'Collection Center', 'Notes'];
    
    const csvRows = [];
    csvRows.push(headers.join(','));
    
    for (const donation of donations) {
      const user = userService.getById(donation.userId);
      const row = [
        format(new Date(donation.date), 'yyyy-MM-dd'),
        user?.name || 'Unknown',
        donation.bloodGroup,
        donation.quantity,
        donation.collectionCenter,
        donation.notes || ''
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
    link.setAttribute('download', `donations_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const filteredDonations = donations.filter(donation => {
    const user = userService.getById(donation.userId);
    const userName = user?.name || '';
    
    return (
      userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donation.bloodGroup.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donation.collectionCenter.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });
  
  return (
    <AdminLayout title="Manage Donations">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Donations</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Manage blood donation records</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search donations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
              />
            </div>
            <button
              onClick={exportToCSV}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <Download className="mr-2 h-5 w-5" />
              Export CSV
            </button>
            <button
              onClick={() => setShowForm(!showForm)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              Add Donation
            </button>
          </div>
        </div>
        
        {showForm && (
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="userId" className="block text-sm font-medium text-gray-700">
                    Donor *
                  </label>
                  <div className="mt-1">
                    <select
                      id="userId"
                      name="userId"
                      value={formData.userId}
                      onChange={handleInputChange}
                      required
                      className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    >
                      <option value="">Select Donor</option>
                      {users.map(user => (
                        <option key={user.id} value={user.id}>
                          {user.name} ({user.bloodGroup})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="sm:col-span-3">
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                    Donation Date *
                  </label>
                  <div className="mt-1">
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      max={format(new Date(), 'yyyy-MM-dd')}
                      required
                      className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                
                <div className="sm:col-span-2">
                  <label htmlFor="bloodGroup" className="block text-sm font-medium text-gray-700">
                    Blood Group *
                  </label>
                  <div className="mt-1">
                    <select
                      id="bloodGroup"
                      name="bloodGroup"
                      value={formData.bloodGroup}
                      onChange={handleInputChange}
                      required
                      disabled={!!formData.userId}
                      className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md disabled:bg-gray-100"
                    >
                      <option value="">Select Blood Group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                </div>
                
                <div className="sm:col-span-1">
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                    Quantity (units) *
                  </label>
                  <div className="mt-1">
                    <input
                      type="number"
                      id="quantity"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      min="1"
                      max="5"
                      required
                      className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                
                <div className="sm:col-span-3">
                  <label htmlFor="collectionCenter" className="block text-sm font-medium text-gray-700">
                    Collection Center *
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="collectionCenter"
                      name="collectionCenter"
                      value={formData.collectionCenter}
                      onChange={handleInputChange}
                      required
                      className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                
                <div className="sm:col-span-6">
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                    Notes
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="notes"
                      name="notes"
                      rows={3}
                      value={formData.notes}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    ></textarea>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Add Donation
                </button>
              </div>
            </form>
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Donor
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
                  Notes
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDonations.map((donation) => {
                const donor = userService.getById(donation.userId);
                return (
                  <tr key={donation.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(donation.date), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {donor?.name || 'Unknown'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        {donation.bloodGroup}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {donation.quantity} unit(s)
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {donation.collectionCenter}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {donation.notes || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDeleteDonation(donation.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredDonations.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    No donations found
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

export default ManageDonations;