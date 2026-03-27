import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('managerToken');
  return { Authorization: `Bearer ${token}` };
};

export default function Complaints() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [empSearch, setEmpSearch] = useState('');
  const [showEmpDrop, setShowEmpDrop] = useState(false);
  const [updateForm, setUpdateForm] = useState({ status: '', assignedTechnician: '', resolutionNotes: '', priority: '' });

  useEffect(() => { 
    fetchComplaints(); 
    fetchEmployees();
    const interval = setInterval(fetchComplaints, 30000); // auto-refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/admin/complaints`, { headers: getAuthHeader() });
      setComplaints(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch complaints error:', err);
      setComplaints([]);
    } finally { setLoading(false); }
  };

  const fetchEmployees = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/employees`, { headers: getAuthHeader() });
      setEmployees((data || []).filter(e => e.role !== 'Manager'));
    } catch (err) { console.error(err); }
  };

  const openModal = (c) => {
    setSelectedComplaint(c);
    setEmpSearch(c.assignedTechnician || '');
    setUpdateForm({ status: c.status || 'Open', assignedTechnician: c.assignedTechnician || '', resolutionNotes: c.resolutionNotes || '', priority: c.priority || 'Medium' });
    setIsModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/admin/complaints/${selectedComplaint.complaintId}`, updateForm, { headers: getAuthHeader() });
      Swal.fire('Updated!', 'Complaint updated.', 'success');
      setIsModalOpen(false);
      fetchComplaints();
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Update failed', 'error');
    }
  };

  const handleAssignTicket = (c) => {
    navigate('/assign-ticket', { state: { fromComplaint: true, complaint: c } });
  };

  const filtered = complaints.filter(c => {
    const matchSearch = c.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.complaintId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.type?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchPriority = priorityFilter === 'All' || c.priority === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
  });

  const stats = {
    total: complaints.length,
    open: complaints.filter(c => c.status === 'Open').length,
    inProgress: complaints.filter(c => c.status === 'In Progress').length,
    resolved: complaints.filter(c => c.status === 'Resolved').length,
  };

  const statusColor = (s) => {
    switch (s) {
      case 'Open': return 'bg-red-100 text-red-700';
      case 'In Progress': return 'bg-yellow-100 text-yellow-700';
      case 'Resolved': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-500';
    }
  };

  const priorityColor = (p) => {
    switch (p) {
      case 'High': return 'bg-red-50 text-red-600';
      case 'Medium': return 'bg-orange-50 text-orange-600';
      default: return 'bg-blue-50 text-blue-600';
    }
  };

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">⚠️ Complaints</h1>
          <p className="text-gray-600 text-sm">Manage & track customer complaints</p>
        </div>
        <button onClick={fetchComplaints} className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          🔄 Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: stats.total, color: 'text-gray-800' },
          { label: 'Open', value: stats.open, color: 'text-red-600' },
          { label: 'In Progress', value: stats.inProgress, color: 'text-yellow-600' },
          { label: 'Resolved', value: stats.resolved, color: 'text-green-600' },
        ].map(s => (
          <div key={s.label} className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border">
            <div className="text-xs sm:text-sm text-gray-600">{s.label}</div>
            <div className={`text-xl sm:text-2xl font-bold ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          {['All', 'Open', 'In Progress', 'Resolved', 'Cancelled'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${statusFilter === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {s}
            </button>
          ))}
          <div className="w-px bg-gray-200 mx-1" />
          {['All', 'High', 'Medium', 'Low'].map(p => (
            <button key={p} onClick={() => setPriorityFilter(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${priorityFilter === p ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {p}
            </button>
          ))}
        </div>
        <input type="text" placeholder="Search by ID, customer, type..."
          value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
          className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
      </div>

      {/* Table - desktop */}
      <div className="hidden sm:block bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['Complaint ID', 'Customer', 'Type', 'Priority', 'Status', 'Date', 'Technician', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan="8" className="px-6 py-8 text-center text-gray-500">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="8" className="px-6 py-8 text-center text-gray-500">No complaints found</td></tr>
              ) : (
                filtered.map((c, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3"><span className="font-mono text-sm font-bold text-gray-800">{c.complaintId}</span></td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-800 text-sm">{c.customerName}</div>
                      <div className="text-xs text-gray-500">{c.customerPhone}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-700">{c.type}</div>
                      {c.relatedItemName && <div className="text-xs text-gray-400">{c.relatedItemName}</div>}
                    </td>
                    <td className="px-4 py-3"><span className={`px-2 py-1 rounded text-xs font-bold ${priorityColor(c.priority)}`}>{c.priority}</span></td>
                    <td className="px-4 py-3"><span className={`px-2 py-1 rounded text-xs font-bold ${statusColor(c.status)}`}>{c.status}</span></td>
                    <td className="px-4 py-3 text-sm text-gray-600">{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{c.assignedTechnician || <span className="italic text-gray-400">Unassigned</span>}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => handleAssignTicket(c)}
                          disabled={c.isAssigned}
                          className={`px-2 py-1 rounded text-xs font-bold transition ${
                            c.isAssigned
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
                          }`}>
                          {c.isAssigned ? '✓ Assigned' : '🎫 Assign'}
                        </button>
                        <button onClick={() => openModal(c)}
                          className="px-2 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded text-xs font-bold transition">
                          Update
                        </button>
                      </div>
                    </td>
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
        ) : filtered.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No complaints found</div>
        ) : (
          filtered.map((c, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow-sm border p-4 space-y-2">
              <div className="flex justify-between items-start">
                <span className="font-mono text-sm font-bold text-gray-800">{c.complaintId}</span>
                <span className={`px-2 py-1 rounded text-xs font-bold ${statusColor(c.status)}`}>{c.status}</span>
              </div>
              <div>
                <div className="font-semibold text-gray-800 text-sm">{c.customerName}</div>
                <div className="text-xs text-gray-500">{c.customerPhone}</div>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="text-gray-600">{c.type}</span>
                <span className={`px-2 py-0.5 rounded font-bold ${priorityColor(c.priority)}`}>{c.priority}</span>
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={() => handleAssignTicket(c)}
                  disabled={c.isAssigned}
                  className={`flex-1 py-1.5 rounded text-xs font-bold transition ${
                    c.isAssigned
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
                  }`}>
                  {c.isAssigned ? '✓ Assigned' : '🎫 Assign'}
                </button>
                <button onClick={() => openModal(c)} className="flex-1 py-1.5 bg-blue-50 text-blue-600 rounded text-xs font-bold">Update</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Update Modal */}
      {isModalOpen && selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h2 className="text-lg font-bold text-gray-800">Update: {selectedComplaint.complaintId}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            <div className="p-3 bg-orange-50 rounded-lg text-sm mb-4 border border-orange-100">
              <p className="font-bold text-orange-800">{selectedComplaint.type}</p>
              <p className="text-orange-700 mt-1">{selectedComplaint.description}</p>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Status</label>
                  <select value={updateForm.status} onChange={e => setUpdateForm({ ...updateForm, status: e.target.value })}
                    className="w-full p-2.5 rounded-lg border outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                    <option>Open</option><option>In Progress</option><option>Resolved</option><option>Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Priority</label>
                  <select value={updateForm.priority} onChange={e => setUpdateForm({ ...updateForm, priority: e.target.value })}
                    className="w-full p-2.5 rounded-lg border outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                    <option>Low</option><option>Medium</option><option>High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Assign Technician</label>
                <div className="relative">
                  <input type="text" value={empSearch}
                    onChange={e => { setEmpSearch(e.target.value); setShowEmpDrop(true); }}
                    onFocus={() => setShowEmpDrop(true)}
                    placeholder="Search employee..."
                    className="w-full p-2.5 rounded-lg border outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                  {showEmpDrop && (
                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-40 overflow-y-auto">
                      {employees.filter(e => e.name.toLowerCase().includes(empSearch.toLowerCase())).map((emp, i) => (
                        <div key={emp._id || i} onClick={() => { setEmpSearch(emp.name); setUpdateForm({ ...updateForm, assignedTechnician: emp.name }); setShowEmpDrop(false); }}
                          className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm font-medium">
                          {emp.name} <span className="text-xs text-gray-400">({emp.designation || emp.role})</span>
                        </div>
                      ))}
                      {employees.filter(e => e.name.toLowerCase().includes(empSearch.toLowerCase())).length === 0 && (
                        <div className="px-4 py-2 text-center text-xs text-gray-400">No employees found</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Resolution Notes</label>
                <textarea value={updateForm.resolutionNotes} onChange={e => setUpdateForm({ ...updateForm, resolutionNotes: e.target.value })}
                  placeholder="Add resolution notes..." rows="3"
                  className="w-full p-2.5 rounded-lg border outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none" />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 font-medium text-sm transition">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition">Save Updates</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
