import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export default function ServiceRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('managerToken');
      const { data } = await axios.get(`${API_URL}/admin/service-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Fetch error:', error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = Array.isArray(requests) ? requests.filter(req => {
    const matchesSearch =
      req.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.ticketId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.type?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) : [];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return 'bg-red-100 text-red-700';
      case 'In Progress': return 'bg-yellow-100 text-yellow-700';
      case 'Resolved': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Service Requests</h1>
          <p className="text-gray-600 text-sm">Manage customer service requests</p>
        </div>
        <button
          onClick={fetchRequests}
          className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          🔄 Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border">
          <div className="text-xs sm:text-sm text-gray-600">Total Requests</div>
          <div className="text-xl sm:text-2xl font-bold text-gray-800">{requests.length}</div>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border">
          <div className="text-xs sm:text-sm text-gray-600">Open</div>
          <div className="text-xl sm:text-2xl font-bold text-red-600">
            {requests.filter(r => r.status === 'Open').length}
          </div>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border">
          <div className="text-xs sm:text-sm text-gray-600">In Progress</div>
          <div className="text-xl sm:text-2xl font-bold text-yellow-600">
            {requests.filter(r => r.status === 'In Progress').length}
          </div>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border">
          <div className="text-xs sm:text-sm text-gray-600">Resolved</div>
          <div className="text-xl sm:text-2xl font-bold text-green-600">
            {requests.filter(r => r.status === 'Resolved').length}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border flex flex-col sm:flex-row gap-3">
        <div className="flex flex-wrap gap-2">
          {['All', 'Open', 'In Progress', 'Resolved'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition ${statusFilter === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              {status}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search by ticket ID, customer name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
        />
      </div>

      {/* Table - desktop */}
      <div className="hidden sm:block bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Ticket ID</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Technician</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan="7" className="px-6 py-8 text-center text-gray-500">Loading...</td></tr>
              ) : filteredRequests.length === 0 ? (
                <tr><td colSpan="7" className="px-6 py-8 text-center text-gray-500">No requests found</td></tr>
              ) : (
                filteredRequests.map((req, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4"><span className="font-mono text-sm font-bold text-gray-800">{req.ticketId || req.complaintId || 'N/A'}</span></td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-800">{req.customerName}</div>
                      <div className="text-xs text-gray-500">{req.customerMobile}</div>
                    </td>
                    <td className="px-6 py-4"><span className="text-sm font-medium text-gray-700">{req.type}</span></td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${req.priority === 'High' ? 'bg-red-100 text-red-700' : req.priority === 'Medium' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>{req.priority}</span>
                    </td>
                    <td className="px-6 py-4"><span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(req.status)}`}>{req.status}</span></td>
                    <td className="px-6 py-4"><span className="text-sm text-gray-600">{new Date(req.date).toLocaleDateString()}</span></td>
                    <td className="px-6 py-4"><span className="text-sm text-gray-600">{req.assignedTechnician || <span className="italic text-gray-400">Unassigned</span>}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cards - mobile */}
      <div className="sm:hidden space-y-3">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No requests found</div>
        ) : (
          filteredRequests.map((req, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow-sm border p-4 space-y-2">
              <div className="flex justify-between items-start">
                <span className="font-mono text-sm font-bold text-gray-800">{req.ticketId || req.complaintId || 'N/A'}</span>
                <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(req.status)}`}>{req.status}</span>
              </div>
              <div>
                <div className="font-semibold text-gray-800 text-sm">{req.customerName}</div>
                <div className="text-xs text-gray-500">{req.customerMobile}</div>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="text-gray-600">{req.type}</span>
                <span className={`px-2 py-0.5 rounded font-bold ${req.priority === 'High' ? 'bg-red-100 text-red-700' : req.priority === 'Medium' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>{req.priority}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>{new Date(req.date).toLocaleDateString()}</span>
                <span>{req.assignedTechnician || <span className="italic">Unassigned</span>}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
