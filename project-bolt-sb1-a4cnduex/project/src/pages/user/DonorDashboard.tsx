import React from 'react';
import { format } from 'date-fns';
import { 
  DropletIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  CalendarIcon, 
  BarChart3Icon 
} from 'lucide-react';
import { Donation } from '../../types/models';

interface DonorDashboardProps {
  donations: Donation[];
  canDonate: boolean;
  daysUntilNextDonation: number;
  nextDonationDate: Date | null;
}

const DonorDashboard: React.FC<DonorDashboardProps> = ({ 
  donations, 
  canDonate, 
  daysUntilNextDonation,
  nextDonationDate
}) => {
  // Calculate total donations
  const totalDonations = donations.reduce((sum, donation) => sum + donation.quantity, 0);
  
  // Group donations by collection center
  const donationsByCenter = donations.reduce((acc, donation) => {
    const center = donation.collectionCenter;
    if (!acc[center]) {
      acc[center] = 0;
    }
    acc[center] += donation.quantity;
    return acc;
  }, {} as Record<string, number>);
  
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-red-100 rounded-md p-3">
                <DropletIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Donations</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{totalDonations} unit(s)</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className={`flex-shrink-0 ${canDonate ? 'bg-green-100' : 'bg-yellow-100'} rounded-md p-3`}>
                {canDonate ? (
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                ) : (
                  <ClockIcon className="h-6 w-6 text-yellow-600" />
                )}
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Donation Status</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {canDonate ? 'Eligible to Donate' : `${daysUntilNextDonation} days remaining`}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                <CalendarIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Next Eligible Date</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {nextDonationDate 
                        ? format(nextDonationDate, 'MMM dd, yyyy')
                        : 'Eligible Now'}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Donation History */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Donation History</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Your past blood donations</p>
          </div>
          <div className="bg-red-100 rounded-full p-2">
            <BarChart3Icon className="h-5 w-5 text-red-600" />
          </div>
        </div>
        <div className="border-t border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
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
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {donations.map((donation) => (
                  <tr key={donation.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(donation.date), 'MMM dd, yyyy')}
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
                  </tr>
                ))}
                {donations.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                      No donations recorded yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Donation Centers */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Collection Centers</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Centers where you have donated</p>
        </div>
        <div className="border-t border-gray-200">
          <ul className="divide-y divide-gray-200">
            {Object.entries(donationsByCenter).map(([center, count]) => (
              <li key={center} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">{center}</p>
                  <div className="ml-2 flex-shrink-0 flex">
                    <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {count} donation(s)
                    </p>
                  </div>
                </div>
              </li>
            ))}
            {Object.keys(donationsByCenter).length === 0 && (
              <li className="px-4 py-4 sm:px-6 text-center text-sm text-gray-500">
                No donation centers recorded
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DonorDashboard;