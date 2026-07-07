import React, { useState, useEffect } from 'react';
import { 
  Users, 
  IndianRupee, 
  TrendingUp, 
  Search, 
  Filter, 
  Trash2, 
  Edit, 
  Eye, 
  Download, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw,
  Loader2,
  AlertCircle,
  FileSpreadsheet,
  FileDown,
  Calendar,
  Check
} from 'lucide-react';
import { Registration, YEARS, DEPARTMENTS, PAYMENT_METHODS } from '../types';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface AdminDashboardProps {
  setCurrentTab: (tab: 'home' | 'register' | 'admin-login' | 'admin-dashboard') => void;
  events?: any[];
  eventDate?: string;
  onConfigUpdate?: () => void;
}

export default function AdminDashboard({ 
  setCurrentTab, 
  events = [], 
  eventDate = '2026-10-24T09:00:00', 
  onConfigUpdate 
}: AdminDashboardProps) {
  // Navigation Tabs for Admin
  const [activeAdminTab, setActiveAdminTab] = useState<'roster' | 'events'>('roster');

  // Dynamic Event and Countdown State
  const [savingConfig, setSavingConfig] = useState(false);
  const [saveConfigSuccess, setSaveConfigSuccess] = useState(false);
  const [configDaysLeft, setConfigDaysLeft] = useState<number>(0);
  const [localEvents, setLocalEvents] = useState<any[]>([]);

  useEffect(() => {
    setLocalEvents(JSON.parse(JSON.stringify(events))); // deep copy
    const diff = new Date(eventDate).getTime() - Date.now();
    const days = diff <= 0 ? 0 : Math.ceil(diff / (1000 * 60 * 60 * 24));
    setConfigDaysLeft(days);
  }, [events, eventDate]);

  const handleSaveConfig = async () => {
    setSavingConfig(true);
    try {
      // Calculate the new target eventDate if days left has changed
      const newEventDate = new Date(Date.now() + configDaysLeft * 24 * 60 * 60 * 1000).toISOString();
      const res = await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventDate: newEventDate,
          events: localEvents
        })
      });
      if (res.ok) {
        setSaveConfigSuccess(true);
        if (onConfigUpdate) onConfigUpdate();
        setTimeout(() => setSaveConfigSuccess(false), 3000);
      } else {
        alert('Failed to save configuration');
      }
    } catch (err) {
      console.error('Error saving config:', err);
    } finally {
      setSavingConfig(false);
    }
  };

  // Data States
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Search States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEvent, setFilterEvent] = useState('');
  const [filterCollege, setFilterCollege] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterYear, setFilterYear] = useState('');

  // Extract unique colleges from data for dynamic dropdown filtering
  const [uniqueColleges, setUniqueColleges] = useState<string[]>([]);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals / Selection States
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);
  const [previewDocType, setPreviewDocType] = useState<'photo' | 'screenshot' | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [regToDelete, setRegToDelete] = useState<number | null>(null);

  // Edit Form Fields State
  const [editName, setEditName] = useState('');
  const [editYear, setEditYear] = useState('');
  const [editDept, setEditDept] = useState('');
  const [editCollege, setEditCollege] = useState('');
  const [editRegisterNum, setEditRegisterNum] = useState('');
  const [editMobile, setEditMobile] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editEvent, setEditEvent] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editMethod, setEditMethod] = useState('');
  const [editTxId, setEditTxId] = useState('');
  const [editError, setEditError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch registrations on mount
  const fetchRegistrations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/registrations');
      if (!res.ok) {
        throw new Error('Failed to retrieve registrations from server.');
      }
      const data = await res.json();
      setRegistrations(data);
      
      // Extract unique colleges
      const colleges: string[] = Array.from(new Set(data.map((r: Registration) => r.college_name)));
      setUniqueColleges(colleges);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred while loading data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  // Filter logic (runs whenever search, dropdown filters, or base registrations change)
  useEffect(() => {
    let result = [...registrations];

    // Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (r) =>
          r.register_number.toLowerCase().includes(q) ||
          r.student_name.toLowerCase().includes(q) ||
          r.college_name.toLowerCase().includes(q)
      );
    }

    // Dropdown filters
    if (filterEvent) result = result.filter((r) => r.event_name === filterEvent);
    if (filterCollege) result = result.filter((r) => r.college_name === filterCollege);
    if (filterDept) result = result.filter((r) => r.department === filterDept);
    if (filterYear) result = result.filter((r) => r.year === filterYear);

    setFilteredRegistrations(result);
    setCurrentPage(1); // Reset to page 1 on filter
  }, [searchTerm, filterEvent, filterCollege, filterDept, filterYear, registrations]);

  // Statistics calculations
  const totalRegistrations = filteredRegistrations.length;
  const totalCollected = filteredRegistrations.reduce((sum, r) => sum + r.amount_paid, 0);
  
  // Calculate top/most-registered event
  const getTopEvent = () => {
    if (filteredRegistrations.length === 0) return 'None';
    const counts: { [key: string]: number } = {};
    filteredRegistrations.forEach((r) => {
      counts[r.event_name] = (counts[r.event_name] || 0) + 1;
    });
    let top = 'None';
    let max = 0;
    Object.entries(counts).forEach(([event, count]) => {
      if (count > max) {
        max = count;
        top = event.split(' (')[0]; // Shorten name
      }
    });
    return `${top} (${max} entries)`;
  };

  // Pagination Logic
  const totalPages = Math.ceil(totalRegistrations / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRegistrations.slice(indexOfFirstItem, indexOfLastItem);

  // Trigger Edit Form Pre-population
  const handleOpenEdit = (reg: Registration) => {
    setSelectedReg(reg);
    setEditName(reg.student_name);
    setEditYear(reg.year);
    setEditDept(reg.department);
    setEditCollege(reg.college_name);
    setEditRegisterNum(reg.register_number);
    setEditMobile(reg.mobile_number);
    setEditEmail(reg.email);
    setEditEvent(reg.event_name);
    setEditAmount(reg.amount_paid.toString());
    setEditMethod(reg.payment_method);
    setEditTxId(reg.transaction_id);
    setEditError(null);
    setShowEditModal(true);
  };

  // Submit Edit API
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReg) return;

    if (
      !editName.trim() ||
      !editYear ||
      !editDept ||
      !editCollege.trim() ||
      !editRegisterNum.trim() ||
      !editMobile.trim() ||
      !editEmail.trim() ||
      !editEvent ||
      !editAmount ||
      !editMethod ||
      !editTxId.trim()
    ) {
      setEditError('All fields are required.');
      return;
    }

    setIsUpdating(true);
    setEditError(null);

    try {
      const res = await fetch(`/api/registrations/${selectedReg.registration_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_name: editName.trim(),
          year: editYear,
          department: editDept,
          college_name: editCollege.trim(),
          register_number: editRegisterNum.trim(),
          mobile_number: editMobile,
          email: editEmail.trim(),
          event_name: editEvent,
          amount_paid: editAmount,
          payment_method: editMethod,
          transaction_id: editTxId.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update record.');
      }

      setShowEditModal(false);
      fetchRegistrations(); // Refetch
    } catch (err: any) {
      setEditError(err.message || 'Error saving changes.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Trigger Delete API
  const handleOpenDelete = (regId: number) => {
    setRegToDelete(regId);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!regToDelete) return;
    try {
      const res = await fetch(`/api/registrations/${regToDelete}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        throw new Error('Failed to delete registration from database.');
      }
      setShowDeleteConfirm(false);
      setRegToDelete(null);
      fetchRegistrations(); // Refetch
    } catch (err: any) {
      alert(err.message || 'Deletion failed.');
    }
  };

  // Export as Excel (CSV format)
  const handleExportExcel = () => {
    if (filteredRegistrations.length === 0) {
      alert('No registrations available to export.');
      return;
    }

    const headers = [
      'Registration ID',
      'Student Name',
      'Year',
      'Department',
      'College Name',
      'Register Number',
      'Mobile Number',
      'Email Address',
      'Event Name',
      'Amount Paid (₹)',
      'Payment Method',
      'Transaction ID',
      'Registration Date'
    ];

    const rows = filteredRegistrations.map((r) => [
      `PIN${r.registration_id}`,
      r.student_name,
      r.year,
      r.department,
      r.college_name,
      r.register_number,
      r.mobile_number,
      r.email,
      r.event_name,
      r.amount_paid,
      r.payment_method,
      r.transaction_id,
      new Date(r.registration_date).toLocaleString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Pinnacle_Registrations_Export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export as PDF (using jsPDF & AutoTable)
  const handleExportPDF = () => {
    if (filteredRegistrations.length === 0) {
      alert('No registrations available to export.');
      return;
    }

    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Add Header
    doc.setFontSize(18);
    doc.setTextColor(30, 41, 59); // slate-800
    doc.text('Apex Institute of Technology - Pinnacle 2026', 14, 15);
    
    doc.setFontSize(11);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(`Official Event Roster • Generated on: ${new Date().toLocaleString()}`, 14, 21);
    doc.text(`Total Registrations: ${totalRegistrations} | Total Collected: Rs. ${totalCollected}`, 14, 26);

    const headers = [['Reg ID', 'Student Name', 'College Name', 'Register No', 'Department', 'Event Domain', 'Fee', 'Method', 'Tx ID']];
    
    const data = filteredRegistrations.map((r) => [
      `PIN${r.registration_id}`,
      r.student_name,
      r.college_name.length > 25 ? r.college_name.substring(0, 23) + '..' : r.college_name,
      r.register_number,
      r.department.split(' (')[0], // CSE/IT/ECE only
      r.event_name.split(' (')[0], // Short name
      `Rs. ${r.amount_paid}`,
      r.payment_method,
      r.transaction_id
    ]);

    autoTable(doc, {
      head: headers,
      body: data,
      startY: 32,
      theme: 'striped',
      headStyles: { fillColor: [29, 78, 216], textColor: [255, 255, 255], fontStyle: 'bold' }, // blue-700
      styles: { fontSize: 8, cellPadding: 2.5 },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 30 },
        2: { cellWidth: 40 },
        3: { cellWidth: 25 },
        4: { cellWidth: 30 },
        5: { cellWidth: 45 },
        6: { cellWidth: 15 },
        7: { cellWidth: 18 },
        8: { cellWidth: 30 }
      }
    });

    doc.save(`Pinnacle_Roster_${Date.now()}.pdf`);
  };

  // Reset Edit Form Amount based on Event Selection
  useEffect(() => {
    const matched = events.find(e => e.name === editEvent);
    if (matched) {
      setEditAmount(matched.fee.toString());
    }
  }, [editEvent, events]);

  return (
    <div className="bg-slate-50 min-h-screen py-4 px-3 sm:px-4 lg:px-6">
      <div className="max-w-7xl mx-auto space-y-4">
        
        {/* Header Title */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-slate-200 pb-3">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Admin Console</h1>
            <p className="text-[10px] text-slate-500 mt-0.5">Audit, search, verify and export records of incoming student registrations in real-time.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={fetchRegistrations}
              className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
              title="Refresh database records"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs cursor-pointer"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              <span>Export Excel</span>
            </button>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-blue-700 hover:bg-blue-600 text-white font-bold text-xs cursor-pointer"
            >
              <FileDown className="h-3.5 w-3.5" />
              <span>Export PDF</span>
            </button>
          </div>
        </div>

        {/* Top Stats Panel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-white rounded p-3 border border-slate-200 shadow-sm flex items-center gap-3.5">
            <div className="flex h-9 w-9 items-center justify-center rounded bg-blue-50 text-blue-700 border border-blue-100">
              <Users className="h-4.5 w-4.5" />
            </div>
            <div>
              <span className="block text-[9px] uppercase font-bold tracking-wider text-slate-400">Total Entries</span>
              <span className="text-base font-extrabold text-slate-950 mt-0.5 block">{totalRegistrations}</span>
            </div>
          </div>
          <div className="bg-white rounded p-3 border border-slate-200 shadow-sm flex items-center gap-3.5">
            <div className="flex h-9 w-9 items-center justify-center rounded bg-emerald-50 text-emerald-700 border border-emerald-100">
              <IndianRupee className="h-4.5 w-4.5" />
            </div>
            <div>
              <span className="block text-[9px] uppercase font-bold tracking-wider text-slate-400">Total Funds Collected</span>
              <span className="text-base font-extrabold text-slate-950 mt-0.5 block">₹{totalCollected.toLocaleString()}</span>
            </div>
          </div>
          <div className="bg-white rounded p-3 border border-slate-200 shadow-sm flex items-center gap-3.5 col-span-1 md:col-span-1">
            <div className="flex h-9 w-9 items-center justify-center rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
              <TrendingUp className="h-4.5 w-4.5" />
            </div>
            <div className="truncate">
              <span className="block text-[9px] uppercase font-bold tracking-wider text-slate-400">Most Popular Event</span>
              <span className="text-xs font-bold text-slate-900 mt-0.5 block truncate" title={getTopEvent()}>{getTopEvent()}</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs for Admin */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveAdminTab('roster')}
            className={`px-4 py-2 text-xs font-bold border-b-2 cursor-pointer transition-all ${
              activeAdminTab === 'roster'
                ? 'border-blue-700 text-blue-700 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Student Registrations Roster
          </button>
          <button
            onClick={() => setActiveAdminTab('events')}
            className={`px-4 py-2 text-xs font-bold border-b-2 cursor-pointer transition-all ${
              activeAdminTab === 'events'
                ? 'border-blue-700 text-blue-700 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Events & Countdown Settings Manager
          </button>
        </div>

        {activeAdminTab === 'roster' && (
          <>
            {/* Search and Filters Section */}
            <div className="bg-white p-3 rounded border border-slate-200 shadow-sm space-y-2.5">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 border-b border-slate-100 pb-1.5 text-xs">
                <Filter className="h-3.5 w-3.5 text-blue-700" />
                <span>Search & Filter Console</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5">
                {/* Live Search */}
                <div className="relative">
                  <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Name, roll, or college..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded outline-none focus:border-blue-600 focus:ring-0"
                  />
                </div>

                {/* Event Filter */}
                <select
                  value={filterEvent}
                  onChange={(e) => setFilterEvent(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded outline-none cursor-pointer"
                >
                  <option value="">All Events</option>
                  {events.map(ev => <option key={ev.name} value={ev.name}>{ev.name.split(' (')[0]}</option>)}
                </select>

            {/* College Filter */}
            <select
              value={filterCollege}
              onChange={(e) => setFilterCollege(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded outline-none cursor-pointer"
            >
              <option value="">All Colleges</option>
              {uniqueColleges.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            {/* Department Filter */}
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded outline-none cursor-pointer"
            >
              <option value="">All Departments</option>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d.split(' (')[0]}</option>)}
            </select>

            {/* Year Filter */}
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded outline-none cursor-pointer"
            >
              <option value="">All Years</option>
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        {/* Database Registrations Table */}
        <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
          
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
              <span className="text-xs font-semibold text-slate-500">Querying records from secure server storage...</span>
            </div>
          ) : error ? (
            <div className="py-16 text-center max-w-md mx-auto space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
                <AlertCircle className="h-6 w-6" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Roster Fetch Failed</h4>
              <p className="text-xs text-red-600">{error}</p>
              <button
                onClick={fetchRegistrations}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs"
              >
                Retry Request
              </button>
            </div>
          ) : filteredRegistrations.length === 0 ? (
            <div className="py-20 text-center text-slate-400">
              <Users className="h-12 w-12 text-slate-200 mx-auto mb-3" />
              <h4 className="font-bold text-slate-600 text-sm">No Records Match Query</h4>
              <p className="text-xs text-slate-400 mt-1">Adjust your search parameters or check dynamic dropdown filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse" id="admin-table">
                <thead>
                  <tr className="bg-slate-950 text-slate-100 border-b border-slate-800 text-[10px] font-bold tracking-wider uppercase">
                    <th className="py-2.5 px-3 font-bold">ID</th>
                    <th className="py-2.5 px-3 font-bold">Student Name</th>
                    <th className="py-2.5 px-3 font-bold">College & Dept</th>
                    <th className="py-2.5 px-3 font-bold">Register No</th>
                    <th className="py-2.5 px-3 font-bold">Domain Registered</th>
                    <th className="py-2.5 px-3 font-bold text-center">Receipts / ID</th>
                    <th className="py-2.5 px-3 text-center font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs">
                  {currentItems.map((reg) => (
                    <tr key={reg.registration_id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2 px-3 font-bold text-blue-700">PIN{reg.registration_id}</td>
                      <td className="py-2 px-3">
                        <span className="font-semibold block text-slate-900">{reg.student_name}</span>
                        <span className="text-[9px] text-slate-400 font-mono block">{reg.email}</span>
                      </td>
                      <td className="py-2 px-3">
                        <span className="font-semibold text-slate-800 block truncate max-w-[200px]" title={reg.college_name}>{reg.college_name}</span>
                        <span className="text-[9px] text-slate-500 block mt-0.5 truncate max-w-[200px]" title={reg.department}>{reg.department.split(' (')[0]} • {reg.year}</span>
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-600">{reg.register_number}</td>
                      <td className="py-2 px-3">
                        <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[9px] border border-blue-100 inline-block truncate max-w-[180px]" title={reg.event_name}>
                          {reg.event_name.split(' (')[0]}
                        </span>
                        <span className="text-[9px] text-slate-500 block font-mono mt-0.5">₹{reg.amount_paid} ({reg.payment_method})</span>
                      </td>
                      <td className="py-2 px-3 text-center space-x-1">
                        {/* Student Portrait Preview Link */}
                        <button
                          onClick={() => {
                            setSelectedReg(reg);
                            setPreviewDocType('photo');
                          }}
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 text-[10px] font-bold cursor-pointer transition-colors"
                          title="View Student Portrait"
                        >
                          <Users className="h-3 w-3 text-blue-600" />
                          <span>Photo</span>
                        </button>
                        
                        {/* Payment Invoice Preview Link */}
                        <button
                          onClick={() => {
                            setSelectedReg(reg);
                            setPreviewDocType('screenshot');
                          }}
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 text-[10px] font-bold cursor-pointer transition-colors"
                          title="View Payment Screenshot/Receipt"
                        >
                          <IndianRupee className="h-3 w-3 text-emerald-600" />
                          <span>Receipt</span>
                        </button>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <div className="flex justify-center items-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(reg)}
                            className="p-1 rounded hover:bg-slate-100 text-blue-600 transition-colors cursor-pointer"
                            title="Edit Student Registration Log"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenDelete(reg.registration_id)}
                            className="p-1 rounded hover:bg-slate-100 text-red-500 transition-colors cursor-pointer"
                            title="Delete Student Registration"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Table Footer with Pagination */}
              {totalPages > 1 && (
                <div className="px-3 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500">
                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, totalRegistrations)} of {totalRegistrations} logs
                  </span>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pgNum) => (
                      <button
                        key={pgNum}
                        onClick={() => setCurrentPage(pgNum)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          currentPage === pgNum
                            ? 'bg-blue-700 text-white font-bold'
                            : 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        {pgNum}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="p-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40"
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
        </>
        )}

        {activeAdminTab === 'events' && (
          <div className="bg-white p-4 sm:p-6 rounded border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-3 gap-2">
              <div>
                <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-blue-700" />
                  <span>Events & Countdown Configuration</span>
                </h2>
                <p className="text-[10px] text-slate-500 mt-0.5">Change event names, days left (countdown target), entry fees, and prize pools instantly.</p>
              </div>
              <div>
                <button
                  type="button"
                  onClick={handleSaveConfig}
                  disabled={savingConfig}
                  className="w-full sm:w-auto px-4 py-1.5 bg-blue-700 hover:bg-blue-600 text-white text-xs font-bold rounded shadow flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-55"
                >
                  {savingConfig ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <span>Save Configuration</span>
                  )}
                </button>
              </div>
            </div>

            {saveConfigSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded p-3 flex gap-2 items-center">
                <Check className="h-4 w-4 text-emerald-600 stroke-[3]" />
                <span className="text-xs font-semibold">Symposium configuration updated successfully and pushed live!</span>
              </div>
            )}

            {/* Countdown Settings Card */}
            <div className="bg-slate-50 p-4 rounded border border-slate-200 space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span>Symposium Countdown Timer Settings</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Days Left until Symposium *</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      value={configDaysLeft}
                      onChange={(e) => setConfigDaysLeft(parseInt(e.target.value) || 0)}
                      className="w-24 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded outline-none font-bold"
                    />
                    <span className="text-[10px] text-slate-500 font-medium">
                      (Converts to target ISO Date: {new Date(Date.now() + configDaysLeft * 24 * 60 * 60 * 1000).toLocaleDateString()})
                    </span>
                  </div>
                </div>
                <div className="text-[10px] text-slate-500 leading-relaxed flex items-center bg-white p-2.5 rounded border border-slate-100">
                  <p>
                    💡 Adjusting the **Days Left** updates the countdown timer on the main symposium landing page in real-time. The server will calculate and persist the correct target event date automatically.
                  </p>
                </div>
              </div>
            </div>

            {/* Event Lists Grid */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <IndianRupee className="h-4 w-4 text-emerald-600" />
                <span>Symposium Events & Financial Configuration</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {localEvents.map((ev, index) => (
                  <div key={ev.id || index} className="p-4 rounded border border-slate-200 bg-white shadow-sm hover:border-slate-300 transition-colors space-y-3">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 rounded text-[10px] font-mono font-bold">
                        Code: {ev.id || 'EVNT'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">Domain Arena #{index + 1}</span>
                    </div>

                    <div className="space-y-2.5">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">Event Title Name</label>
                        <input
                          type="text"
                          value={ev.name}
                          onChange={(e) => {
                            const updated = [...localEvents];
                            updated[index].name = e.target.value;
                            setLocalEvents(updated);
                          }}
                          className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded outline-none font-semibold text-slate-800 focus:bg-white focus:border-blue-600"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">Entry Fee (₹ Rupees)</label>
                          <div className="relative">
                            <IndianRupee className="absolute left-2 top-2 h-3 w-3 text-slate-400" />
                            <input
                              type="number"
                              min="0"
                              value={ev.fee}
                              onChange={(e) => {
                                const updated = [...localEvents];
                                updated[index].fee = parseInt(e.target.value) || 0;
                                setLocalEvents(updated);
                              }}
                              className="w-full pl-6 pr-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded outline-none font-mono focus:bg-white focus:border-emerald-600"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">Prize Pool (₹ Rupees)</label>
                          <div className="relative">
                            <IndianRupee className="absolute left-2 top-2 h-3 w-3 text-slate-400" />
                            <input
                              type="number"
                              min="0"
                              value={ev.prizePool || 0}
                              onChange={(e) => {
                                const updated = [...localEvents];
                                updated[index].prizePool = parseInt(e.target.value) || 0;
                                setLocalEvents(updated);
                              }}
                              className="w-full pl-6 pr-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded outline-none font-mono focus:bg-white focus:border-emerald-600"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">Short Description</label>
                        <textarea
                          rows={2}
                          value={ev.description || ''}
                          onChange={(e) => {
                            const updated = [...localEvents];
                            updated[index].description = e.target.value;
                            setLocalEvents(updated);
                          }}
                          className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded outline-none text-slate-600 focus:bg-white focus:border-blue-600 leading-normal resize-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleSaveConfig}
                disabled={savingConfig}
                className="px-6 py-2 bg-blue-700 hover:bg-blue-600 text-white text-xs font-bold rounded shadow flex items-center gap-2 cursor-pointer disabled:opacity-55"
              >
                {savingConfig ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Saving Symposium Config...</span>
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Save & Push Config Live</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </div>

      {/* MODAL 1: Document/Receipt Previews */}
      {previewDocType && selectedReg && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded max-w-lg w-full overflow-hidden shadow-xl border border-slate-200">
            <div className="px-4 py-3 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  {previewDocType === 'photo' ? 'Student Portrait' : 'Payment Document'}
                </h3>
                <p className="text-[9px] text-slate-500 mt-0.5">PIN{selectedReg.registration_id} • {selectedReg.student_name}</p>
              </div>
              <button
                onClick={() => {
                  setPreviewDocType(null);
                  setSelectedReg(null);
                }}
                className="p-1 rounded text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="p-4 flex flex-col items-center justify-center bg-slate-950 min-h-[250px]">
              {previewDocType === 'photo' ? (
                <img
                  src={selectedReg.student_photo}
                  alt="Student Portrait"
                  className="max-h-[300px] max-w-full rounded shadow-md object-contain"
                  referrerPolicy="no-referrer"
                />
              ) : selectedReg.payment_screenshot.endsWith('.pdf') ? (
                <div className="text-center text-white space-y-3">
                  <X className="h-12 w-12 text-red-500 mx-auto" />
                  <div>
                    <h4 className="font-bold text-xs">PDF Invoice Attached</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">This transaction record was uploaded as a PDF file.</p>
                  </div>
                  <a
                    href={selectedReg.payment_screenshot}
                    download
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-600 text-white text-[10px] font-bold rounded shadow"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download PDF Invoice</span>
                  </a>
                </div>
              ) : (
                <img
                  src={selectedReg.payment_screenshot}
                  alt="Payment Receipt"
                  className="max-h-[300px] max-w-full rounded shadow-md object-contain"
                  referrerPolicy="no-referrer"
                />
              )}
            </div>

            <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-[9px] text-slate-500">
              <span>Date: {new Date(selectedReg.registration_date).toLocaleString()}</span>
              {previewDocType === 'screenshot' && (
                <span className="font-mono">TX_ID: {selectedReg.transaction_id}</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Edit Registration Drawer Form */}
      {showEditModal && selectedReg && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded max-w-lg w-full shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Edit Roster Record</h3>
                <p className="text-[9px] text-slate-500 mt-0.5">Edit entry logs for PIN{selectedReg.registration_id}</p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 rounded text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-4 space-y-4">
              
              {editError && (
                <div className="bg-red-50 border border-red-200 text-red-800 rounded p-2 flex gap-1.5 items-start">
                  <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <span className="text-[10px] font-semibold leading-tight">{editError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Student Name */}
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase mb-0.5">Student Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded outline-none"
                  />
                </div>

                {/* College */}
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase mb-0.5">College Name</label>
                  <input
                    type="text"
                    value={editCollege}
                    onChange={(e) => setEditCollege(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded outline-none"
                  />
                </div>

                {/* Year */}
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase mb-0.5">Year</label>
                  <select
                    value={editYear}
                    onChange={(e) => setEditYear(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded outline-none"
                  >
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>

                {/* Dept */}
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase mb-0.5">Department</label>
                  <select
                    value={editDept}
                    onChange={(e) => setEditDept(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded outline-none"
                  >
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                {/* Register Number */}
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase mb-0.5">Register Number</label>
                  <input
                    type="text"
                    value={editRegisterNum}
                    onChange={(e) => setEditRegisterNum(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded outline-none"
                  />
                </div>

                {/* Mobile */}
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase mb-0.5">Mobile Number</label>
                  <input
                    type="text"
                    value={editMobile}
                    onChange={(e) => setEditMobile(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded outline-none"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase mb-0.5">Email</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded outline-none"
                  />
                </div>

                {/* Event */}
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase mb-0.5">Registered Event</label>
                  <select
                    value={editEvent}
                    onChange={(e) => setEditEvent(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded outline-none"
                  >
                    {events.map(ev => <option key={ev.name} value={ev.name}>{ev.name}</option>)}
                  </select>
                </div>

                {/* Amount Paid */}
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase mb-0.5">Amount Paid (₹)</label>
                  <input
                    type="text"
                    readOnly
                    value={editAmount}
                    className="w-full px-2 py-1.5 text-xs bg-slate-100 text-slate-500 border border-slate-200 rounded outline-none"
                  />
                </div>

                {/* Method */}
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase mb-0.5">Payment Method</label>
                  <select
                    value={editMethod}
                    onChange={(e) => setEditMethod(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded outline-none"
                  >
                    {PAYMENT_METHODS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                {/* Tx ID */}
                <div className="sm:col-span-2">
                  <label className="block text-[9px] font-bold text-slate-500 uppercase mb-0.5">Transaction Ref ID</label>
                  <input
                    type="text"
                    value={editTxId}
                    onChange={(e) => setEditTxId(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded outline-none"
                  />
                </div>

              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-3 py-1.5 border border-slate-200 text-slate-500 text-xs font-semibold rounded hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-1.5 bg-blue-700 hover:bg-blue-600 text-white text-xs font-bold rounded shadow disabled:opacity-55"
                >
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Double Delete Confirm */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded max-w-xs w-full p-4 text-center space-y-4 shadow-xl border border-slate-200 animate-shake">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-500">
              <Trash2 className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-950">Confirm Record Deletion</h3>
              <p className="text-[10px] text-slate-500 leading-normal">Are you absolutely sure you want to delete this registration? Associated document uploads will be deleted physically.</p>
            </div>
            <div className="flex gap-2.5">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setRegToDelete(null);
                }}
                className="flex-1 py-1.5 border border-slate-200 text-slate-500 font-semibold text-xs rounded hover:bg-slate-50"
              >
                No, Keep
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded shadow"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
