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
  Heart
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
import { getAllUsers, getUserLogs } from '../../../firebaseUtils';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const getBMI = (user) => {
  if (user.bmi) return user.bmi;
  if (!user.weight || !user.height) return null;
  const h = user.height / 100;
  return (user.weight / (h * h)).toFixed(1);
};

const UserJourneyPanel = React.memo(({ users, loading, showNotification, loadUsers }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userLogs, setUserLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [filterGoal, setFilterGoal] = useState('all');

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
      <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
        <button 
          onClick={() => setSelectedUser(null)}
          className="flex items-center gap-2 text-gray-600 hover:text-green-700 font-medium transition-colors"
        >
          <ArrowLeft size={20} /> Back to Overview
        </button>

        <div className="bg-white rounded-2xl shadow-lg border border-green-100 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white">
            <div className="flex items-center gap-4">
              {selectedUser.photoURL ? (
                <SafeImage 
                  src={selectedUser.photoURL} 
                  alt="" 
                  className="w-16 h-16 rounded-2xl border-2 border-white/20" 
                  wrapperClassName="w-16 h-16"
                />
              ) : (
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-2xl font-bold">
                  {selectedUser.displayName?.charAt(0) || '?'}
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold">{selectedUser.displayName}</h2>
                <p className="text-green-50 opacity-90">{selectedUser.email}</p>
              </div>
            </div>
          </div>

          <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Profile Info */}
            <div className="space-y-6">
              <h3 className="font-bold text-gray-800 border-b pb-2">Profile Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-yellow-700 bg-yellow-50 px-2 py-1 rounded-lg">
                  <span className="text-xs font-bold uppercase">Health Profile</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Gender</span>
                  <span className="font-bold text-gray-900 capitalize">{selectedUser.gender || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Age</span>
                  <span className="font-bold text-gray-900">{selectedUser.age || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Goal</span>
                  <span className="font-bold text-gray-900 capitalize">{selectedUser.goal || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Activity</span>
                  <span className="font-bold text-gray-900 capitalize">{selectedUser.activityLevel || 'N/A'}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-100">
                  <span className="text-gray-600 font-medium">Current BMI</span>
                  <span className="font-black text-green-700">{getBMI(selectedUser) || 'N/A'}</span>
                </div>
              </div>

              <div className="bg-orange-50 rounded-xl p-4 mt-4 border border-orange-100">
                <p className="text-xs text-orange-700 font-bold uppercase tracking-wider mb-2">Conditions / Concerns</p>
                <p className="text-gray-900 font-bold">{selectedUser.healthConditions || 'None reported'}</p>
              </div>

              <div className="bg-green-50 rounded-xl p-4 mt-4">
                <p className="text-xs text-green-700 font-bold uppercase tracking-wider mb-2">Dietary Restrictions</p>
                <p className="text-gray-900 font-bold">{selectedUser.dietaryRestrictions || 'None specified'}</p>
              </div>
            </div>

            {/* Log History */}
            <div className="md:col-span-2 space-y-6">
              <h3 className="font-bold text-gray-800 border-b pb-2">Weight Log History</h3>
              {loadingLogs ? (
                <div className="flex justify-center py-10">
                  <Loader className="animate-spin text-green-600" />
                </div>
              ) : userLogs.length === 0 ? (
                <p className="text-center py-10 text-gray-500">No log history found.</p>
              ) : (
                <div className="overflow-hidden border border-gray-100 rounded-xl">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Weight (kg)</th>
                        <th className="px-4 py-3">BMI</th>
                        <th className="px-4 py-3">Goal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                      {userLogs.map(log => (
                        <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-gray-600">
                            {new Date(log.loggedAt || log.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 font-bold text-gray-800">{log.weight}</td>
                          <td className="px-4 py-3 text-gray-600">
                            {log.weight && selectedUser.height ? 
                              (log.weight / Math.pow(selectedUser.height/100, 2)).toFixed(1) : 'N/A'}
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 bg-green-50 text-green-700 rounded-md text-xs capitalize">
                              {log.goal || 'N/A'}
                            </span>
                          </td>
                        </tr>
                      ))}
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
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
              <Users size={20} />
            </div>
            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">+12%</span>
          </div>
          <p className="text-2xl font-black text-gray-800">{stats?.total || 0}</p>
          <p className="text-sm text-gray-500 font-medium">Total Registered</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
              <Activity size={20} />
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">DAU</span>
          </div>
          <p className="text-2xl font-black text-gray-800">{stats?.activeLast24h || 0}</p>
          <p className="text-sm text-gray-500 font-medium">Active in last 24h</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
              <TrendingUp size={20} />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-800">{stats?.avgBmi || 'N/A'}</p>
          <p className="text-sm text-gray-500 font-medium">Average BMI</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center text-red-600">
              <Heart size={20} />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-800">{stats?.highRiskCount || 0}</p>
          <p className="text-sm text-gray-500 font-medium">High Risk (Diabetes/BP)</p>
        </div>
      </div>

      {/* Growth and Engagement Charts */}
      <div className="grid grid-cols-1 gap-8">
        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-blue-600" /> Registration Growth (Last 30 Days)
          </h3>
          <div className="h-72">
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
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Demographics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Users size={20} className="text-purple-600" /> Age Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.ageData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" fontSize={12} tickLine={false} axisLine={false} width={80} />
                <Tooltip />
                <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-pink-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Users size={20} className="text-pink-600" /> Gender Breakdown
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.genderData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-green-600" /> BMI Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.bmiData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" fill="#10b981" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Target size={20} className="text-emerald-600" /> Goal Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.goalData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
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
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h3 className="text-xl font-bold text-gray-800">User Management</h3>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm transition-all"
              />
            </div>
            <button 
              onClick={() => loadUsers(true)}
              disabled={loading}
              className="p-2 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 hover:text-blue-600 transition-all flex items-center gap-2 disabled:opacity-50"
              title="Refresh Data"
            >
              <RotateCcw size={20} className={loading ? 'animate-spin' : ''} />
              <span className="hidden md:inline font-bold text-sm">Refresh</span>
            </button>
            <button 
              onClick={exportToCSV}
              className="p-2 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 hover:text-green-600 transition-all flex items-center gap-2"
              title="Export to CSV"
            >
              <Download size={20} />
              <span className="hidden md:inline font-bold text-sm">Export</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          <button 
            onClick={() => setFilterGoal('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${filterGoal === 'all' ? 'bg-green-600 text-white shadow-md' : 'bg-white text-gray-500 border border-gray-100 hover:border-green-200'}`}
          >
            All Users
          </button>
          <button 
            onClick={() => setFilterGoal('lose')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${filterGoal === 'lose' ? 'bg-green-600 text-white shadow-md' : 'bg-white text-gray-500 border border-gray-100 hover:border-green-200'}`}
          >
            Weight Loss
          </button>
          <button 
            onClick={() => setFilterGoal('gain')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${filterGoal === 'gain' ? 'bg-green-600 text-white shadow-md' : 'bg-white text-gray-500 border border-gray-100 hover:border-green-200'}`}
          >
            Muscle Gain
          </button>
          <button 
            onClick={() => setFilterGoal('maintain')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${filterGoal === 'maintain' ? 'bg-green-600 text-white shadow-md' : 'bg-white text-gray-500 border border-gray-100 hover:border-green-200'}`}
          >
            Maintenance
          </button>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-xs font-black uppercase tracking-widest border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Current BMI</th>
                  <th className="px-6 py-4">Goal</th>
                  <th className="px-6 py-4">Health Status</th>
                  <th className="px-6 py-4">Last Activity</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      No users found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(user => (
                    <tr key={user.uid} className="hover:bg-green-50/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-green-700 font-bold overflow-hidden shadow-sm">
                            {user.photoURL ? (
                              <SafeImage 
                                src={user.photoURL} 
                                alt="" 
                                className="w-full h-full object-cover" 
                                wrapperClassName="w-full h-full"
                              />
                             ) : (user.displayName?.charAt(0) || '?')}
                          </div>
                          <div>
                            <p className="font-bold text-gray-800 text-sm">{user.displayName || 'Unnamed User'}</p>
                            <p className="text-xs text-gray-500 truncate max-w-[150px]">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${getBMI(user) ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                          <span className="font-bold text-gray-800">{getBMI(user) || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md ${
                          user.goal === 'lose' ? 'bg-orange-100 text-orange-700' : 
                          user.goal === 'gain' ? 'bg-blue-100 text-blue-700' : 
                          'bg-green-100 text-green-700'
                        }`}>
                          {user.goal || 'No Goal'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {user.healthConditions?.toLowerCase().includes('diabetes') && (
                            <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-[10px] font-bold">DIABETES</span>
                          )}
                          {user.healthConditions?.toLowerCase().includes('pressure') && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-bold">BP</span>
                          )}
                          {!user.healthConditions?.toLowerCase().includes('diabetes') && !user.healthConditions?.toLowerCase().includes('pressure') && (
                             <span className="text-gray-400 text-xs italic">{user.healthConditions ? 'Other' : 'None'}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-gray-600 font-medium">
                          {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'N/A'}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleUserClick(user)}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                        >
                          <ChevronRight size={20} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
});

export default UserJourneyPanel;
