import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { CheckCircle, XCircle, ClipboardList, Download, Search } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import AdminLayout from '../../components/layout/AdminLayout';
import { 
  requestService, 
  userService, 
  stockService,
  supplyService,
  notificationService
} from '../../utils/localStorage';
import { BloodRequest, BloodGroup, User, BloodSupply, Notification } from '../../types/models';

const ManageRequests: React.FC = () => {
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [showSupplyForm, setShowSupplyForm] = useState(false);
  const [currentRequest, setCurrentRequest] = useState<BloodRequest | null>(null);
  
  const [formData, setFormData] = useState({
    collectionCenter: '',
    supplyDate: format(new Date(), 'yyyy-MM-dd'),
    notes: ''
  });
  
  useEffect(() => {
    loadRequests();
    loadUsers();
  }, []);
  
  const loadRequests = () => {
    const allRequests = requestService.getAll();
    setRequests(allRequests.sort((a, b) => 
      new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime()
    ));
  };
  
  const loadUsers = () => {
    const allUsers = userService.getAll();
    setUsers(allUsers);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleApproveRequest = (request: BloodRequest) => {
    if (request.status !== 'Pending') return;
    
    // Check if enough stock available
    const stock = stockService.getByBloodGroup(request.bloodGroup);
    if (!stock || stock.quantity < request.quantity) {
      alert(`Not enough ${request.bloodGroup} blood in stock. Available: ${stock?.quantity || 0} units`);
      return;
    }
    
    // Update request status
    const updatedRequest: BloodRequest = {
      ...request,
      status: 'Approved'
    };
    
    requestService.update(updatedRequest);
    
    // Create notification for user
    const notification: Notification = {
      id: uuidv4(),
      userId: request.userId,
      title: 'Blood Request Approved',
      message: `Your request for ${request.quantity} unit(s) of ${request.bloodGroup} blood has been approved.`,
      type: 'success',
      read: false,
      createdAt: new Date().toISOString()
    };
    
    notificationService.add(notification);
    
    // Show supply form
    setCurrentRequest(updatedRequest);
    setShowSupplyForm(true);
    
    loadRequests();
  };
  
  const handleRejectRequest = (request: BloodRequest) => {
    if (request.status !== 'Pending') return;
    
    if (window.confirm('Are you sure you want to reject this request?')) {
      // Update request status
      const updatedRequest: BloodRequest = {
        ...request,
        status: 'Rejected'
      };
      
      requestService.update(updatedRequest);
      
      // Create notification for user
      const notification: Notification = {
        id: uuidv4(),
        userId: request.userId,
        title: 'Blood Request Rejected',
        message: `Your request for ${request.quantity} unit(s) of ${request.bloodGroup} blood has been rejected.`,
        type: 'error',
        read: false,
        createdAt: new Date().toISOString()
      };
      
      notificationService.add(notification);
      
      loadRequests();
    }
  };
  
  const handleSupplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentRequest) return;
    
    if (!formData.collectionCenter) {
      alert('Please enter a collection center');
      return;
    }
    
    // Create blood supply record
    const supplyData: BloodSupply = {
      id: uuidv4(),
      requestId: currentRequest.id,
      userId: currentRequest.userId,
      quantity: currentRequest.quantity,
      bloodGroup: currentRequest.bloodGroup,
      collectionCenter: formData.collectionCenter,
      supplyDate: new Date(formData.supplyDate).toISOString(),
      notes: formData.notes
    };
    
    supplyService.add(supplyData);
    
    // Update blood stock
    stockService.updateQuantity(currentRequest.bloodGroup, -currentRequest.quantity);
    
    // Update request status to Fulfilled
    const updatedRequest: BloodRequest = {
      ...currentRequest,
      status: 'Fulfilled',
      deliveryDate: new Date(formData.supplyDate).toISOString()
    };
    
    requestService.update(updatedRequest);
    
    // Create notification for user
    const notification: Notification = {
      id: uuidv4(),
      userId: currentRequest.userId,
      title: 'Blood Supply Ready',
      message: `Your requested ${currentRequest.quantity} unit(s) of ${currentRequest.bloodGroup} blood is ready for collection from ${formData.collectionCenter}.`,
      type: 'info',
      read: false,
      createdAt: new Date().toISOString()
    };
    
    notificationService.add(notification);
    
    resetForm();
    loadRequests();
  };
  
  const resetForm = () => {
    setFormData({
      collectionCenter: '',
      supplyDate: format(new Date(), 'yyyy-MM-dd'),
      notes: ''
    });
    setCurrentRequest(null);
    setShowSupplyForm(false);
  };
  
  const exportToCSV = () => {
    if (requests.length === 0) return;
    
    const headers = ['Request Date', 'Requester', 'Blood Group', 'Quantity', 'Status', 'Urgency', 'Hospital', 'Reason'];
    
    const csvRows = [];
    csvRows.push(headers.join(','));
    
    for (const request of requests) {
      const user = userService.getById(request.userId);
      const row = [
        format(new Date(request.requestDate), 'yyyy-MM-dd'),
        user?.name || 'Unknown',
        request.bloodGroup,
        request.quantity,
        request.status,
        request.urgency,
        request.hospitalName || '',
        request.reason || ''
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
    link.setAttribute('download', `blood_requests_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const filteredRequests = requests.filter(request => {
    const user = userService.getById(request.userId);
    const userName = user?.name || '';
    
    const statusMatch = statusFilter === 'all' || request.status === statusFilter;
    
    return statusMatch && (
      userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.bloodGroup.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.hospitalName || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  });
  
  // Helper functions for UI
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      case 'Fulfilled':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };
  
  const getUrgencyBadgeColor = (urgency: string) => {
    switch (urgency) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <AdminLayout title="Manage Blood Requests">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Blood Requests</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Manage blood requests from receivers</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-2 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Fulfilled">Fulfilled</option>
            </select>
            <button
              onClick={exportToCSV}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Download className="mr-2 h-5 w-5" />
              Export CSV
            </button>
          </div>
        </div>
        
        {showSupplyForm && currentRequest && (
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Create Blood Supply</h3>
            <form onSubmit={handleSupplySubmit}>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Requester
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      value={users.find(u => u.id === currentRequest.userId)?.name || ''}
                      disabled
                      className="shadow-sm block w-full sm:text-sm border-gray-300 rounded-md bg-gray-50"
                    />
                  </div>
                </div>
                
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Blood Group
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      value={currentRequest.bloodGroup}
                      disabled
                      className="shadow-sm block w-full sm:text-sm border-gray-300 rounded-md bg-gray-50"
                    />
                  </div>
                </div>
                
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Quantity
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      value={`${currentRequest.quantity} unit(s)`}
                      disabled
                      className="shadow-sm block w-full sm:text-sm border-gray-300 rounded-md bg-gray-50"
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
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                
                <div className="sm:col-span-3">
                  <label htmlFor="supplyDate" className="block text-sm font-medium text-gray-700">
                    Supply Date *
                  </label>
                  <div className="mt-1">
                    <input
                      type="date"
                      id="supplyDate"
                      name="supplyDate"
                      value={formData.supplyDate}
                      onChange={handleInputChange}
                      min={format(new Date(), 'yyyy-MM-dd')}
                      required
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
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
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    ></textarea>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Create Supply
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
                  Request Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Requester
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Blood Group
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Urgency
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hospital
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRequests.map((request) => {
                const requester = userService.getById(request.userId);
                return (
                  <tr key={request.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(request.requestDate), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {requester?.name || 'Unknown'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        {request.bloodGroup}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {request.quantity} unit(s)
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(request.status)}`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getUrgencyBadgeColor(request.urgency)}`}>
                        {request.urgency}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {request.hospitalName || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {request.status === 'Pending' && (
                        <>
                          <button
                            onClick={() => handleApproveRequest(request)}
                            className="text-green-600 hover:text-green-900 mr-4"
                            title="Approve Request"
                          >
                            <CheckCircle className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleRejectRequest(request)}
                            className="text-red-600 hover:text-red-900"
                            title="Reject Request"
                          >
                            <XCircle className="h-5 w-5" />
                          </button>
                        </>
                      )}
                      {request.status === 'Approved' && (
                        <button
                          onClick={() => {
                            setCurrentRequest(request);
                            setShowSupplyForm(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="Create Supply"
                        >
                          <ClipboardList className="h-5 w-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredRequests.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                    No requests found
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

export default ManageRequests;