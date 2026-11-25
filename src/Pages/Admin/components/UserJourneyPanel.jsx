import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  TrendingUp, 
  Target, 
  Search, 
  FileText, 
  ChevronRight, 
  ArrowLeft,
  Loader,
  Calendar,
  Activity,
  Award,
  Filter,
  Download,
  RotateCcw,
  Heart,
  Trash2
} from 'lucide-react';
import SafeImage from '../../../Components/SafeImage';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { getAllUsers, getUserLogs, deleteUserAccount } from '../../../firebaseUtils';
import DeleteConfirmationModal from './DeleteConfirmationModal';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const getBMI = (user) => {
  if (user.bmi) return user.bmi;
  if (!user.weight || !user.height) return null;
  const h = user.height / 100;
  return (user.weight / (h * h)).toFixed(1);
};

const UserJourneyPanel = React.memo(({ users, loading, showNotification, loadUsers, hasMore }) => {

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userLogs, setUserLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [filterGoal, setFilterGoal] = useState('all');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleUserClick = async (user) => {
    setSelectedUser(user);
    setLoadingLogs(true);
    const result = await getUserLogs(user.uid);
    if (result.success) {
      setUserLogs(result.data);
    } else {
      showNotification('error', 'Failed to load user logs');
    }
    setLoadingLogs(false);
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    setIsDeleting(true);
    try {
      const result = await deleteUserAccount(selectedUser.uid, selectedUser.email);
      if (result.success) {
        showNotification('success', 'User and all associated data deleted successfully.');
        setSelectedUser(null);
        loadUsers(true); // Refresh the list
      } else {
        showNotification('error', result.error || 'Failed to delete user.');
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      showNotification('error', 'An unexpected error occurred.');
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  // --- Analytics Computations ---

  const stats = useMemo(() => {
    if (!users.length) return null;

    const total = users.length;
    
    // Growth Trend (Last 30 Days)
    const now = new Date();
    const registrationsByDay = {};
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      registrationsByDay[dateStr] = 0;
    }

    let activeLast24h = 0;
    let totalBmi = 0;
    let usersWithBmi = 0;

    // Age Buckets
    const ageData = [
      { name: '< 20', value: 0 },
      { name: '20-30', value: 0 },
      { name: '31-45', value: 0 },
      { name: '46-60', value: 0 },
      { name: '60+', value: 0 },
    ];

    // Gender Map
    const genderMap = {};
    
    users.forEach(u => {
      // Registration Trend
      const created = u.createdAt?.toDate ? u.createdAt.toDate() : new Date(u.createdAt);
      if (created) {
        const dateStr = created.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        if (registrationsByDay[dateStr] !== undefined) {
          registrationsByDay[dateStr]++;
        }
      }

      // DAU (Active last 24h)
      const updated = u.updatedAt?.toDate ? u.updatedAt.toDate() : new Date(u.updatedAt);
      if (updated && (now - updated) < (24 * 60 * 60 * 1000)) {
        activeLast24h++;
      }

      // BMI Stats
      const bmi = getBMI(u);
      if (bmi) {
        totalBmi += parseFloat(bmi);
        usersWithBmi++;
      }

      // Gender
      const gender = u.gender ? u.gender.charAt(0).toUpperCase() + u.gender.slice(1) : 'Not Specified';
      genderMap[gender] = (genderMap[gender] || 0) + 1;

      // Age Buckets
      if (u.age) {
        const age = parseInt(u.age);
        if (age < 20) ageData[0].value++;
        else if (age <= 30) ageData[1].value++;
        else if (age <= 45) ageData[2].value++;
        else if (age <= 60) ageData[3].value++;
        else ageData[4].value++;
      }
    });

    const growthData = Object.keys(registrationsByDay).map(day => ({
      date: day,
      count: registrationsByDay[day]
    }));

    const genderData = Object.keys(genderMap).map(key => ({
      name: key,
      value: genderMap[key]
    }));

    const avgBmi = usersWithBmi > 0 ? (totalBmi / usersWithBmi).toFixed(1) : 'N/A';

    // Existing BMI & Goal Logic
    const bmiDistribution = [
      { name: 'Underweight', value: 0 },
      { name: 'Normal', value: 0 },
      { name: 'Overweight', value: 0 },
      { name: 'Obese', value: 0 },
    ];
    const goalMap = {};

    users.forEach(u => {
      const bmi = getBMI(u);
      if (bmi) {
        if (bmi < 18.5) bmiDistribution[0].value++;
        else if (bmi < 25) bmiDistribution[1].value++;
        else if (bmi < 30) bmiDistribution[2].value++;
        else bmiDistribution[3].value++;
      }
      const goal = u.goal || 'Not set';
      const label = goal === 'lose' ? 'Weight Loss' : 
                    goal === 'gain' ? 'Muscle Gain' : 
                    goal === 'maintain' ? 'Maintenance' : 'Not set';
      goalMap[label] = (goalMap[label] || 0) + 1;
    });

    // High Risk Users (Diabetes/BP)
    const highRiskCount = users.filter(u => 
      u.healthConditions?.toLowerCase().includes('diabetes') || 
      u.healthConditions?.toLowerCase().includes('pressure')
    ).length;

    const goalData = Object.keys(goalMap).map(key => ({
      name: key,
      value: goalMap[key]
    }));

    return { 
      total, 
      activeLast24h, 
      avgBmi,
      highRiskCount,
      growthData, 
      bmiData: bmiDistribution, 
      goalData,
      ageData,
      genderData 
    };
  }, [users]);

  // --- Filtering ---

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch = 
        u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesGoal = filterGoal === 'all' || u.goal === filterGoal;
      
      return matchesSearch && matchesGoal;
    });
  }, [users, searchTerm, filterGoal]);

  const exportToCSV = () => {
    if (!users.length) return;
    
    const headers = ['Name', 'Email', 'Goal', 'BMI', 'Weight', 'Health Conditions', 'Dietary Restrictions', 'Activity', 'Last Active'];
    const rows = users.map(u => [
      u.displayName || 'N/A',
      u.email || 'N/A',
      u.goal || 'N/A',
      u.bmi || 'N/A',
      u.weight || 'N/A',
      u.healthConditions || 'None',
      u.dietaryRestrictions || 'None',
      u.activityLevel || 'N/A',
      u.updatedAt ? new Date(u.updatedAt).toLocaleDateString() : 'N/A'
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `dietwithdee_users_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader className="animate-spin text-green-600 mb-4" size={48} />
        <p className="text-gray-600 font-medium">Analyzing User Journeys...</p>
      </div>
    );
  }

  if (selectedUser) {
    return (
      <div className="space-y-4 animate-in fade-in duration-200">
        <button 
          onClick={() => setSelectedUser(null)}
          className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors p-1"
        >
          <ArrowLeft size={16} /> Back to all clients
        </button>

        <div className="bg-white rounded-2xl shadow-xs border border-stone-200 overflow-hidden">
          <div className="bg-stone-900 p-5 text-white">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {selectedUser.photoURL ? (
                  <SafeImage 
                    src={selectedUser.photoURL} 
                    alt="" 
                    className="w-12 h-12 rounded-2xl border border-stone-700 object-cover" 
                    wrapperClassName="w-12 h-12"
                  />
                ) : (
                  <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center text-lg font-bold">
                    {selectedUser.displayName?.charAt(0) || '?'}
                  </div>
                )}
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-white">{selectedUser.displayName || 'Client Profile'}</h2>
                  <p className="text-xs text-stone-400">{selectedUser.email}</p>
                </div>
              </div>
              <div className="w-full sm:w-auto">
                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  disabled={isDeleting}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold text-xs transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? (
                    <Loader size={14} className="animate-spin" />
                  ) : (
                    <Trash2 size={14} />
                  )}
                  <span>{isDeleting ? 'Deleting...' : 'Remove User'}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Profile Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-stone-800 text-xs uppercase tracking-wider border-b border-stone-100 pb-2">Profile Details</h3>
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-stone-500 font-medium">Gender</span>
                  <span className="font-semibold text-stone-900 capitalize">{selectedUser.gender || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500 font-medium">Age</span>
                  <span className="font-semibold text-stone-900">{selectedUser.age || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500 font-medium">Goal</span>
                  <span className="font-semibold text-stone-900 capitalize">{selectedUser.goal || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500 font-medium">Activity</span>
                  <span className="font-semibold text-stone-900 capitalize">{selectedUser.activityLevel || 'N/A'}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-stone-100">
                  <span className="text-stone-500 font-medium">Current BMI</span>
                  <span className="font-semibold text-emerald-700">{getBMI(selectedUser) || 'N/A'}</span>
                </div>
              </div>

              <div className="bg-amber-50/70 rounded-xl p-3 border border-amber-200/60 text-xs">
                <p className="text-[10px] text-amber-800 font-semibold uppercase tracking-wider mb-1">Conditions / Concerns</p>
                <p className="text-stone-900 font-medium">{selectedUser.healthConditions || 'None reported'}</p>
              </div>

              <div className="bg-emerald-50/70 rounded-xl p-3 border border-emerald-200/60 text-xs">
                <p className="text-[10px] text-emerald-800 font-semibold uppercase tracking-wider mb-1">Dietary Restrictions</p>
                <p className="text-stone-900 font-medium">{selectedUser.dietaryRestrictions || 'None specified'}</p>
              </div>
            </div>

            {/* Assessment History */}
            <div className="md:col-span-2 space-y-4">
              <h3 className="font-semibold text-stone-800 text-xs uppercase tracking-wider border-b border-stone-100 pb-2">KnowYourBody Assessment History</h3>
              {loadingLogs ? (
                <div className="flex justify-center py-10">
                  <Loader className="animate-spin text-emerald-600" size={24} />
                </div>
              ) : userLogs.length === 0 ? (
                <p className="text-center py-8 text-stone-400 text-xs">No saved assessment history found.</p>
              ) : (
                <div className="overflow-x-auto border border-stone-100 rounded-xl">
                  <table className="w-full text-left">
                    <thead className="bg-stone-50 text-stone-500 text-[10px] font-semibold uppercase tracking-wider">
                      <tr>
                        <th className="px-3.5 py-2.5">Date</th>
                        <th className="px-3.5 py-2.5">Weight (kg)</th>
                        <th className="px-3.5 py-2.5">BMI</th>
                        <th className="px-3.5 py-2.5">Calories</th>
                        <th className="px-3.5 py-2.5">Goal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 text-xs">
                      {userLogs.map(log => {
                        const computedBmi = log.bmi || (log.weight && (log.height || selectedUser.height)
                          ? (log.weight / Math.pow((log.height || selectedUser.height) / 100, 2)).toFixed(1)
                          : 'N/A');
                        return (
                          <tr key={log.id} className="hover:bg-stone-50/50 transition-colors">
                            <td className="px-3.5 py-2.5 text-stone-600">
                              {new Date(log.createdAt || log.loggedAt).toLocaleDateString()}
                            </td>
                            <td className="px-3.5 py-2.5 font-semibold text-stone-800">{log.weight || 'N/A'}</td>
                            <td className="px-3.5 py-2.5 text-stone-600">{computedBmi}</td>
                            <td className="px-3.5 py-2.5 text-stone-600">
                              {log.dailyCalories ? `${log.dailyCalories} kcal` : '—'}
                            </td>
                            <td className="px-3.5 py-2.5">
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-semibold capitalize border border-emerald-100">
                                {log.goal || 'N/A'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl shadow-xs border border-stone-200/80 p-4 sm:p-5">
          <div className="flex justify-between items-start mb-2 sm:mb-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
              <Users size={18} />
            </div>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full">Active</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-stone-900">{stats?.total || 0}</p>
          <p className="text-xs text-stone-500 font-medium mt-0.5">Total Registered</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xs border border-stone-200/80 p-4 sm:p-5">
          <div className="flex justify-between items-start mb-2 sm:mb-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600">
              <Activity size={18} />
            </div>
            <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 border border-teal-200/60 px-2 py-0.5 rounded-full">24h</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-stone-900">{stats?.activeLast24h || 0}</p>
          <p className="text-xs text-stone-500 font-medium mt-0.5">Active in last 24h</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xs border border-stone-200/80 p-4 sm:p-5">
          <div className="flex justify-between items-start mb-2 sm:mb-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
              <TrendingUp size={18} />
            </div>
            <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded-full">Metric</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-stone-900">{stats?.avgBmi || 'N/A'}</p>
          <p className="text-xs text-stone-500 font-medium mt-0.5">Average BMI</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xs border border-stone-200/80 p-4 sm:p-5">
          <div className="flex justify-between items-start mb-2 sm:mb-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600">
              <Heart size={18} />
            </div>
            <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 border border-rose-200/60 px-2 py-0.5 rounded-full">Care</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-stone-900">{stats?.highRiskCount || 0}</p>
          <p className="text-xs text-stone-500 font-medium mt-0.5">Special Care (BP/Sugar)</p>
        </div>
      </div>

      {/* Growth and Engagement Charts */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-2xl shadow-xs border border-stone-200/80 p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-stone-800 mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-blue-600" />
            <span>Registration Growth (Last 30 Days)</span>
          </h3>
          <div className="h-60 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.growthData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  interval={4}
                />
                <YAxis fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                />
                <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Demographics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl shadow-xs border border-stone-200/80 p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-stone-800 mb-4 flex items-center gap-2">
            <Users size={16} className="text-purple-600" />
            <span>Age Distribution</span>
          </h3>
          <div className="h-56 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.ageData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" fontSize={11} tickLine={false} axisLine={false} width={65} />
                <Tooltip />
                <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xs border border-stone-200/80 p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-stone-800 mb-4 flex items-center gap-2">
            <Users size={16} className="text-pink-600" />
            <span>Gender Breakdown</span>
          </h3>
          <div className="h-56 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.genderData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {stats?.genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Existing BMI Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl shadow-xs border border-stone-200/80 p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-stone-800 mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-emerald-600" />
            <span>BMI Distribution</span>
          </h3>
          <div className="h-56 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.bmiData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                />
                <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xs border border-stone-200/80 p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-stone-800 mb-4 flex items-center gap-2">
            <Target size={16} className="text-teal-600" />
            <span>Goal Distribution</span>
          </h3>
          <div className="h-56 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.goalData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {stats?.goalData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend layout="vertical" align="right" verticalAlign="middle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* User Table Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-stone-900">User Management</h3>
            <p className="text-xs text-stone-500 font-medium">Browse client directory and health status</p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={15} />
              <input 
                type="text" 
                placeholder="Search name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-stone-200 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-xs transition-all"
              />
            </div>
            <button 
              onClick={() => loadUsers(true)}
              disabled={loading}
              className="p-1.5 sm:px-3 sm:py-1.5 bg-white border border-stone-200 text-stone-600 rounded-xl hover:bg-stone-50 hover:text-emerald-700 transition-all flex items-center gap-1.5 disabled:opacity-50 flex-shrink-0"
              title="Refresh Data"
            >
              <RotateCcw size={15} className={loading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline font-semibold text-xs">Refresh</span>
            </button>
            <button 
              onClick={exportToCSV}
              className="p-1.5 sm:px-3 sm:py-1.5 bg-white border border-stone-200 text-stone-600 rounded-xl hover:bg-stone-50 hover:text-emerald-700 transition-all flex items-center gap-1.5 flex-shrink-0"
              title="Export to CSV"
            >
              <Download size={15} />
              <span className="hidden sm:inline font-semibold text-xs">Export</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button 
            onClick={() => setFilterGoal('all')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${filterGoal === 'all' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white text-stone-600 border border-stone-200 hover:border-emerald-300'}`}
          >
            All Users ({users.length})
          </button>
          <button 
            onClick={() => setFilterGoal('lose')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${filterGoal === 'lose' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white text-stone-600 border border-stone-200 hover:border-emerald-300'}`}
          >
            Weight Loss
          </button>
          <button 
            onClick={() => setFilterGoal('gain')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${filterGoal === 'gain' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white text-stone-600 border border-stone-200 hover:border-emerald-300'}`}
          >
            Muscle Gain
          </button>
          <button 
            onClick={() => setFilterGoal('maintain')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${filterGoal === 'maintain' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white text-stone-600 border border-stone-200 hover:border-emerald-300'}`}
          >
            Maintenance
          </button>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl shadow-xs border border-stone-200/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-stone-50/80 text-stone-500 text-[11px] font-semibold uppercase tracking-wider border-b border-stone-200/60">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Current BMI</th>
                  <th className="px-4 py-3">Goal</th>
                  <th className="px-4 py-3">Health Status</th>
                  <th className="px-4 py-3">Last Activity</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-10 text-center text-xs text-stone-500">
                      No users found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(user => (
                    <tr key={user.uid} className="hover:bg-stone-50/60 transition-colors group">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-100 flex items-center justify-center font-semibold text-xs overflow-hidden flex-shrink-0">
                            {user.photoURL ? (
                              <SafeImage 
                                src={user.photoURL} 
                                alt="" 
                                className="w-full h-full object-cover" 
                                wrapperClassName="w-full h-full"
                              />
                             ) : (user.displayName?.charAt(0) || '?')}
                          </div>
                          <div className="overflow-hidden">
                            <p className="font-semibold text-stone-900 text-xs truncate max-w-[140px] sm:max-w-none">{user.displayName || 'Unnamed User'}</p>
                            <p className="text-[11px] text-stone-400 truncate max-w-[140px] sm:max-w-none">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${getBMI(user) ? 'bg-emerald-500' : 'bg-stone-300'}`}></span>
                          <span className="font-semibold text-stone-800 text-xs">{getBMI(user) || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          user.goal === 'lose' ? 'bg-orange-50 text-orange-700 border border-orange-200/60' : 
                          user.goal === 'gain' ? 'bg-blue-50 text-blue-700 border border-blue-200/60' : 
                          'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                        }`}>
                          {user.goal || 'No Goal'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {user.healthConditions?.toLowerCase().includes('diabetes') && (
                            <span className="px-1.5 py-0.5 bg-rose-50 text-rose-700 border border-rose-200/60 rounded text-[10px] font-medium">DIABETES</span>
                          )}
                          {user.healthConditions?.toLowerCase().includes('pressure') && (
                            <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200/60 rounded text-[10px] font-medium">BP</span>
                          )}
                          {!user.healthConditions?.toLowerCase().includes('diabetes') && !user.healthConditions?.toLowerCase().includes('pressure') && (
                             <span className="text-stone-400 text-xs italic">{user.healthConditions ? 'Other' : 'None'}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs text-stone-500 font-medium">
                          {user.updatedAt ? (user.updatedAt.toDate ? user.updatedAt.toDate().toLocaleDateString() : new Date(user.updatedAt).toLocaleDateString()) : 'N/A'}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button 
                          onClick={() => handleUserClick(user)}
                          className="p-1.5 text-stone-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {hasMore && (
            <div className="p-4 border-t border-stone-100 flex justify-center">
              <button
                onClick={() => loadUsers(false, true)}
                disabled={loading}
                className="px-4 py-1.5 bg-white border border-emerald-600 text-emerald-700 font-semibold text-xs rounded-xl hover:bg-emerald-50 transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                {loading ? <Loader size={14} className="animate-spin" /> : null}
                <span>Load More Users</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteUser}
        title="Delete User Account"
        message={`Are you absolutely sure you want to delete this user? This will permanently remove their account, active logs, nutrition plans, and subscriptions. This action cannot be undone.`}
        itemName={selectedUser?.displayName || selectedUser?.email}
        isLoading={isDeleting}
      />
    </div>

  );
});

export default UserJourneyPanel;
