import React, { useState, useEffect } from 'react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { 
  UserIcon, 
  DropletIcon, 
  ClipboardListIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  XCircleIcon 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import UserLayout from '../../components/layout/UserLayout';
import { 
  donationService, 
  requestService, 
  stockService, 
  notificationService,
  supplyService
} from '../../utils/localStorage';
import { Donation, BloodRequest, BloodGroup, BloodSupply } from '../../types/models';
import DonorDashboard from './DonorDashboard';
import ReceiverDashboard from './ReceiverDashboard';

const UserDashboard: React.FC = () => {
  const { authState } = useAuth();
  const [activeTab, setActiveTab] = useState<'donor' | 'receiver'>(
    authState.user?.isDonor ? 'donor' : 'receiver'
  );
  const [donations, setDonations] = useState<Donation[]>([]);
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [supplies, setSupplies] = useState<BloodSupply[]>([]);
  const [nextDonationDate, setNextDonationDate] = useState<Date | null>(null);
  
  useEffect(() => {
    if (authState.user) {
      const userDonations = donationService.getByUserId(authState.user.id);
      const userRequests = requestService.getByUserId(authState.user.id);
      const userSupplies = supplyService.getByUserId(authState.user.id);
      
      setDonations(userDonations);
      setRequests(userRequests);
      setSupplies(userSupplies);
      
      // Calculate next eligible donation date (3 months after last donation)
      if (userDonations.length > 0) {
        const sortedDonations = [...userDonations].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        const lastDonationDate = parseISO(sortedDonations[0].date);
        const nextDate = new Date(lastDonationDate);
        nextDate.setMonth(nextDate.getMonth() + 3);
        setNextDonationDate(nextDate);
      }
      
      // Set default active tab based on user role and history
      if (authState.user.isDonor && authState.user.isReceiver) {
        // If user is both donor and receiver, show the tab with most recent activity
        const lastDonationDate = userDonations.length > 0 
          ? Math.max(...userDonations.map(d => new Date(d.date).getTime()))
          : 0;
          
        const lastRequestDate = userRequests.length > 0
          ? Math.max(...userRequests.map(r => new Date(r.requestDate).getTime()))
          : 0;
          
        setActiveTab(lastRequestDate > lastDonationDate ? 'receiver' : 'donor');
      } else if (authState.user.isDonor) {
        setActiveTab('donor');
      } else if (authState.user.isReceiver) {
        setActiveTab('receiver');
      }
    }
  }, [authState.user]);
  
  // Check if user can donate based on last donation date
  const canDonate = !nextDonationDate || nextDonationDate <= new Date();
  
  const daysUntilNextDonation = nextDonationDate 
    ? Math.max(0, differenceInDays(nextDonationDate, new Date()))
    : 0;
    
  return (
    <UserLayout title="My Dashboard">
      {/* Tab selection */}
      {authState.user?.isDonor && authState.user?.isReceiver && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('donor')}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === 'donor'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                `}
              >
                <div className="flex items-center">
                  <DropletIcon className="mr-2 h-5 w-5" />
                  Donor Dashboard
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('receiver')}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === 'receiver'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                `}
              >
                <div className="flex items-center">
                  <ClipboardListIcon className="mr-2 h-5 w-5" />
                  Receiver Dashboard
                </div>
              </button>
            </nav>
          </div>
        </div>
      )}
      
      {/* User info card */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">User Information</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Personal details and role</p>
          </div>
          <div className="bg-gray-100 rounded-full p-3">
            <UserIcon className="h-6 w-6 text-gray-600" />
          </div>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Full name</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{authState.user?.name}</dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Blood group</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                  {authState.user?.bloodGroup}
                </span>
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Email address</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{authState.user?.email}</dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Phone number</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{authState.user?.phone}</dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Roles</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <div className="flex space-x-2">
                  {authState.user?.isDonor && (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Donor
                    </span>
                  )}
                  {authState.user?.isReceiver && (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      Receiver
                    </span>
                  )}
                </div>
              </dd>
            </div>
          </dl>
        </div>
      </div>
      
      {/* Show active dashboard */}
      {activeTab === 'donor' && authState.user?.isDonor ? (
        <DonorDashboard 
          donations={donations} 
          canDonate={canDonate} 
          daysUntilNextDonation={daysUntilNextDonation} 
          nextDonationDate={nextDonationDate}
        />
      ) : (
        <ReceiverDashboard 
          requests={requests}
          supplies={supplies}
        />
      )}
    </UserLayout>
  );
};

export default UserDashboard;