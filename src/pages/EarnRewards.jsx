import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/landing/Navbar";
import { useAuth } from "../contexts/AuthContext";

export default function EarnRewards() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [rewards, setRewards] = useState({
    referralBonus: 200,
    transactionBonus: 50,
    milestoneBonus: 1000,
    totalEarned: 0,
    pendingAmount: 0
  });
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load rewards data from API
    const loadRewardsData = async () => {
      try {
        // TODO: Replace with actual API calls
        // const rewardsResponse = await apiService.getRewardsData();
        // const milestonesResponse = await apiService.getMilestones();
        
        // For now, initialize with default reward structure and empty data
        // Show reward structure to all users, but only load user-specific data if authenticated
        setRewards({
          referralBonus: 200,
          transactionBonus: 50,
          milestoneBonus: 1000,
          totalEarned: isAuthenticated && user?.id ? 0 : 0, // Load from API if authenticated
          pendingAmount: isAuthenticated && user?.id ? 0 : 0 // Load from API if authenticated
        });
        
        setMilestones([
          { id: 1, target: 5, current: isAuthenticated && user?.id ? 0 : 0, reward: 500, achieved: false, title: 'First 5 Referrals' },
          { id: 2, target: 10, current: isAuthenticated && user?.id ? 0 : 0, reward: 1000, achieved: false, title: '10 Referrals Milestone' },
          { id: 3, target: 25, current: isAuthenticated && user?.id ? 0 : 0, reward: 2500, achieved: false, title: '25 Referrals Milestone' },
          { id: 4, target: 50, current: isAuthenticated && user?.id ? 0 : 0, reward: 5000, achieved: false, title: '50 Referrals Milestone' }
        ]);
      } catch (error) {
        console.error('Error loading rewards data:', error);
        // Set default values on error
        setRewards({
          referralBonus: 200,
          transactionBonus: 50,
          milestoneBonus: 1000,
          totalEarned: 0,
          pendingAmount: 0
        });
        setMilestones([]);
      } finally {
        setLoading(false);
      }
    };

    loadRewardsData();
  }, [isAuthenticated, user]);

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#F9FAFC' }}>
        <Navbar />
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading rewards information...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9FAFC' }}>
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4" style={{ color: '#1E65AD', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
            Earn Rewards
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto" style={{ fontFamily: 'Roboto, sans-serif' }}>
            Discover all the ways you can earn money by referring friends to सलहाकार. 
            The more you refer, the more you earn!
          </p>
        </div>

        {/* Earnings Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-8 text-white">
            <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
              Total Earnings
            </h2>
            <p className="text-4xl font-bold mb-2">₹{rewards.totalEarned}</p>
            <p className="text-blue-100" style={{ fontFamily: 'Roboto, sans-serif' }}>
              Earned from referrals and transactions
            </p>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-8 text-white">
            <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
              Pending Rewards
            </h2>
            <p className="text-4xl font-bold mb-2">₹{rewards.pendingAmount}</p>
            <p className="text-green-100" style={{ fontFamily: 'Roboto, sans-serif' }}>
              Will be credited within 24-48 hours
            </p>
          </div>
        </div>

        {/* Reward Structure */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6" style={{ color: '#1E65AD', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
            Reward Structure
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-center p-4 bg-blue-50 rounded-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                    Referral Bonus
                  </h3>
                  <p className="text-2xl font-bold text-blue-600">₹{rewards.referralBonus}</p>
                  <p className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    For each successful referral
                  </p>
                </div>
              </div>

              <div className="flex items-center p-4 bg-green-50 rounded-lg">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                    Transaction Bonus
                  </h3>
                  <p className="text-2xl font-bold text-green-600">₹{rewards.transactionBonus}</p>
                  <p className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    For each transaction by your referrals
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center p-4 bg-yellow-50 rounded-lg">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                    Milestone Bonus
                  </h3>
                  <p className="text-2xl font-bold text-yellow-600">₹{rewards.milestoneBonus}+</p>
                  <p className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Bonus rewards for reaching milestones
                  </p>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-2" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                  Payment Schedule
                </h3>
                <ul className="text-sm text-gray-600 space-y-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  <li>• Referral bonuses: Paid within 24 hours</li>
                  <li>• Transaction bonuses: Paid weekly</li>
                  <li>• Milestone bonuses: Paid immediately</li>
                  <li>• Minimum withdrawal: ₹500</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Milestones */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6" style={{ color: '#1E65AD', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
            Milestone Rewards
          </h2>
          
          <div className="space-y-4">
            {milestones.map((milestone) => (
              <div key={milestone.id} className={`p-6 rounded-lg border-2 ${
                milestone.achieved 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-gray-200 bg-gray-50'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                      {milestone.title}
                    </h3>
                    <p className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      {milestone.current} / {milestone.target} referrals
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">₹{milestone.reward}</p>
                    {milestone.achieved && (
                      <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        Achieved
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full ${
                      milestone.achieved ? 'bg-green-500' : 'bg-blue-500'
                    }`}
                    style={{ 
                      width: `${Math.min((milestone.current / milestone.target) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How to Maximize Earnings */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-bold mb-6" style={{ color: '#1E65AD', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
            How to Maximize Your Earnings
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4 mt-1">
                  <span className="text-blue-600 font-bold text-sm">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                    Share on Social Media
                  </h3>
                  <p className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Post about सलहाकार on your social media accounts to reach more people
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4 mt-1">
                  <span className="text-blue-600 font-bold text-sm">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                    Personal Recommendations
                  </h3>
                  <p className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Recommend to friends who need legal services or advice
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4 mt-1">
                  <span className="text-blue-600 font-bold text-sm">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                    Follow Up
                  </h3>
                  <p className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Follow up with your referrals to ensure they complete their registration
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-4 mt-1">
                  <span className="text-green-600 font-bold text-sm">4</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                    Professional Networks
                  </h3>
                  <p className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Share with colleagues and professional contacts who might benefit
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-4 mt-1">
                  <span className="text-green-600 font-bold text-sm">5</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                    Community Groups
                  </h3>
                  <p className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Share in community groups, forums, and online communities
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-4 mt-1">
                  <span className="text-green-600 font-bold text-sm">6</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                    Track Progress
                  </h3>
                  <p className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Monitor your referral progress and earnings regularly
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/referral')}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            style={{ fontFamily: 'Roboto, sans-serif' }}
          >
            Back to Referral Program
          </button>
        </div>
      </div>
    </div>
  );
}
