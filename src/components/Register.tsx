import React, { useState, useRef, useEffect } from 'react';
import { 
  User, 
  BookOpen, 
  School, 
  Hash, 
  Phone, 
  Mail, 
  Calendar, 
  CreditCard, 
  Key, 
  Upload, 
  FileText, 
  CheckCircle, 
  X, 
  AlertCircle,
  Clock,
  Loader2,
  Trash2,
  Check,
  IndianRupee
} from 'lucide-react';
import { YEARS, DEPARTMENTS, PAYMENT_METHODS } from '../types';

interface RegisterProps {
  setCurrentTab: (tab: 'home' | 'register' | 'admin-login' | 'admin-dashboard') => void;
  events?: any[];
}

export default function Register({ setCurrentTab, events = [] }: RegisterProps) {
  // Form States
  const [studentName, setStudentName] = useState('');
  const [year, setYear] = useState('');
  const [department, setDepartment] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [registerNumber, setRegisterNumber] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  // File states & previews
  const [studentPhoto, setStudentPhoto] = useState<File | null>(null);
  const [studentPhotoPreview, setStudentPhotoPreview] = useState<string | null>(null);
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  const [paymentScreenshotPreview, setPaymentScreenshotPreview] = useState<string | null>(null);
  const [isPdfScreenshot, setIsPdfScreenshot] = useState(false);

  // Error States
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [serverError, setServerError] = useState<string | null>(null);

  // UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [generatedRegId, setGeneratedRegId] = useState<number | null>(null);

  // File Input Refs
  const photoInputRef = useRef<HTMLInputElement>(null);
  const screenshotInputRef = useRef<HTMLInputElement>(null);

  // Automatically update the amount paid when the event selection changes
  useEffect(() => {
    const matched = events.find(e => e.name === selectedEvent);
    if (matched) {
      setAmountPaid(matched.fee.toString());
      // Clear event error if present
      setErrors(prev => {
        const copy = { ...prev };
        delete copy.selectedEvent;
        delete copy.amountPaid;
        return copy;
      });
    } else {
      setAmountPaid('');
    }
  }, [selectedEvent, events]);

  // Handle Photo Upload
  const handlePhotoChange = (file: File | null) => {
    if (!file) {
      setStudentPhoto(null);
      setStudentPhotoPreview(null);
      return;
    }

    // Validation
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!['.jpg', '.jpeg', '.png'].includes(ext)) {
      setErrors(prev => ({ ...prev, studentPhoto: 'Student photo must be in JPG, JPEG, or PNG format.' }));
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, studentPhoto: 'Student photo size must not exceed 2 MB.' }));
      return;
    }

    // Clear error & set file
    setErrors(prev => {
      const copy = { ...prev };
      delete copy.studentPhoto;
      return copy;
    });

    setStudentPhoto(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setStudentPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle Payment Screenshot Upload
  const handleScreenshotChange = (file: File | null) => {
    if (!file) {
      setPaymentScreenshot(null);
      setPaymentScreenshotPreview(null);
      setIsPdfScreenshot(false);
      return;
    }

    // Validation
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!['.jpg', '.jpeg', '.png', '.pdf'].includes(ext)) {
      setErrors(prev => ({ ...prev, paymentScreenshot: 'Payment screenshot must be in JPG, JPEG, PNG, or PDF format.' }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, paymentScreenshot: 'Payment screenshot size must not exceed 5 MB.' }));
      return;
    }

    // Clear error & set file
    setErrors(prev => {
      const copy = { ...prev };
      delete copy.paymentScreenshot;
      return copy;
    });

    setPaymentScreenshot(file);
    if (ext === '.pdf') {
      setIsPdfScreenshot(true);
      setPaymentScreenshotPreview(null);
    } else {
      setIsPdfScreenshot(false);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentScreenshotPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Validate full form client-side
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!studentName.trim()) newErrors.studentName = 'Student name is required.';
    if (!year) newErrors.year = 'Please select your academic year.';
    if (!department) newErrors.department = 'Please select your department.';
    if (!collegeName.trim()) newErrors.collegeName = 'College name is required.';
    if (!registerNumber.trim()) newErrors.registerNumber = 'A unique Register Number is required.';
    
    // Mobile Validation
    const rawMobile = mobileNumber.replace(/\D/g, '');
    if (!rawMobile) {
      newErrors.mobileNumber = 'Mobile number is required.';
    } else if (rawMobile.length !== 10) {
      newErrors.mobileNumber = 'Mobile number must contain exactly 10 digits.';
    }

    // Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Please provide a valid email format.';
    }

    if (!selectedEvent) newErrors.selectedEvent = 'Please select a technical event.';
    if (!amountPaid) newErrors.amountPaid = 'Payment amount is required.';
    if (!paymentMethod) newErrors.paymentMethod = 'Please select your payment method.';
    if (!transactionId.trim()) newErrors.transactionId = 'Transaction Reference ID is required.';

    if (!studentPhoto) newErrors.studentPhoto = 'Please upload a student photo.';
    if (!paymentScreenshot) newErrors.paymentScreenshot = 'Please upload your payment receipt/screenshot.';

    if (!termsAccepted) newErrors.termsAccepted = 'You must accept the terms and conditions to proceed.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Reset all states
  const handleReset = () => {
    setStudentName('');
    setYear('');
    setDepartment('');
    setCollegeName('');
    setRegisterNumber('');
    setMobileNumber('');
    setEmail('');
    setSelectedEvent('');
    setAmountPaid('');
    setPaymentMethod('');
    setTransactionId('');
    setTermsAccepted(false);
    setStudentPhoto(null);
    setStudentPhotoPreview(null);
    setPaymentScreenshot(null);
    setPaymentScreenshotPreview(null);
    setIsPdfScreenshot(false);
    setErrors({});
    setServerError(null);
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validateForm()) {
      // Scroll to the first error
      const firstErrorField = document.querySelector('.text-red-500');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('student_name', studentName.trim());
      formData.append('year', year);
      formData.append('department', department);
      formData.append('college_name', collegeName.trim());
      formData.append('register_number', registerNumber.trim());
      formData.append('mobile_number', mobileNumber.replace(/\D/g, ''));
      formData.append('email', email.trim());
      formData.append('event_name', selectedEvent);
      formData.append('amount_paid', amountPaid);
      formData.append('payment_method', paymentMethod);
      formData.append('transaction_id', transactionId.trim());
      
      if (studentPhoto) {
        formData.append('student_photo', studentPhoto);
      }
      if (paymentScreenshot) {
        formData.append('payment_screenshot', paymentScreenshot);
      }

      const res = await fetch('/api/register', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Server validation failed.');
      }

      // Success!
      setGeneratedRegId(data.registration_id);
      setShowSuccessModal(true);
      handleReset();
    } catch (err: any) {
      console.error(err);
      setServerError(err.message || 'An unexpected error occurred during registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 py-4 px-3 sm:px-4 lg:px-6">
      <div className="max-w-3xl mx-auto bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Registration Header Banner */}
        <div className="bg-slate-950 text-white px-4 py-3 border-b border-slate-800">
          <div>
            <h2 className="text-[9px] font-bold text-slate-400 tracking-wider uppercase">PINNACLE 2026 REGISTRATION</h2>
            <h1 className="text-base font-black mt-0.5">Student Entry Form</h1>
            <p className="text-slate-400 text-[10px] mt-1 leading-normal">
              Please provide complete accurate details. All uploads are validated against official university criteria. Duplicate register numbers will be auto-flagged and rejected.
            </p>
          </div>
        </div>

        {/* Server-Side Top Alert */}
        {serverError && (
          <div className="mx-4 mt-3 bg-red-50 border border-red-200 text-red-800 rounded p-2.5 flex gap-2 items-start animate-shake">
            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-xs">Registration Failed</h4>
              <p className="text-[10px] text-red-600 mt-0.5">{serverError}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-4 space-y-6" id="registration-form">
          
          {/* section 1: Student Details */}
          <div className="space-y-4">
            <div className="flex items-center space-x-1.5 border-b border-slate-200 pb-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-950 text-slate-100 font-bold text-[10px]">1</span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Student Profile Information</h3>
            </div>

            {/* Photo upload block */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-3 flex flex-col items-center">
                <span className="block text-[9px] font-bold text-slate-500 mb-1">Student Photo</span>
                {studentPhotoPreview ? (
                  <div className="relative h-24 w-24 rounded border border-blue-500 overflow-hidden group shadow-sm">
                    <img 
                      src={studentPhotoPreview} 
                      alt="Student Preview" 
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <button
                      type="button"
                      onClick={() => handlePhotoChange(null)}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    className="h-24 w-24 rounded border border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center hover:border-blue-500 transition-colors cursor-pointer group"
                  >
                    <Upload className="h-4 w-4 text-slate-400 group-hover:text-blue-500 mb-0.5 transition-colors" />
                    <span className="text-[9px] text-slate-400 font-bold">Upload Photo</span>
                    <span className="text-[8px] text-slate-400">Max 2 MB</span>
                  </button>
                )}
                <input 
                  type="file" 
                  ref={photoInputRef}
                  onChange={(e) => handlePhotoChange(e.target.files?.[0] || null)}
                  className="hidden" 
                  accept=".jpg,.jpeg,.png"
                />
                {errors.studentPhoto && (
                  <p className="text-[11px] text-red-500 font-semibold mt-2 text-center leading-tight">{errors.studentPhoto}</p>
                )}
              </div>

              {/* Text Fields */}
              <div className="md:col-span-9 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Student Name */}
                <div>
                  <label htmlFor="student-name" className="block text-[9px] font-bold text-slate-500 mb-0.5 uppercase tracking-wider">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-2.5 top-1.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      id="student-name"
                      type="text"
                      value={studentName}
                      onChange={(e) => {
                        setStudentName(e.target.value);
                        if (e.target.value.trim()) setErrors(prev => { const c = {...prev}; delete c.studentName; return c; });
                      }}
                      placeholder="Enter full name"
                      className={`w-full pl-8 pr-3 py-1 text-xs bg-slate-50 hover:bg-slate-100/50 focus:bg-white border ${
                        errors.studentName ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-blue-600 focus:ring-0'
                      } rounded outline-none transition-all`}
                    />
                  </div>
                  {errors.studentName && <p className="text-[10px] text-red-500 font-semibold mt-0.5 leading-tight">{errors.studentName}</p>}
                </div>

                {/* College Name */}
                <div>
                  <label htmlFor="college-name" className="block text-[9px] font-bold text-slate-500 mb-0.5 uppercase tracking-wider">College Name *</label>
                  <div className="relative">
                    <School className="absolute left-2.5 top-1.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      id="college-name"
                      type="text"
                      value={collegeName}
                      onChange={(e) => {
                        setCollegeName(e.target.value);
                        if (e.target.value.trim()) setErrors(prev => { const c = {...prev}; delete c.collegeName; return c; });
                      }}
                      placeholder="e.g. State Tech University"
                      className={`w-full pl-8 pr-3 py-1 text-xs bg-slate-50 hover:bg-slate-100/50 focus:bg-white border ${
                        errors.collegeName ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-blue-600 focus:ring-0'
                      } rounded outline-none transition-all`}
                    />
                  </div>
                  {errors.collegeName && <p className="text-[10px] text-red-500 font-semibold mt-0.5 leading-tight">{errors.collegeName}</p>}
                </div>

                {/* Academic Year */}
                <div>
                  <label htmlFor="academic-year" className="block text-[9px] font-bold text-slate-500 mb-0.5 uppercase tracking-wider">Academic Year *</label>
                  <select
                    id="academic-year"
                    value={year}
                    onChange={(e) => {
                      setYear(e.target.value);
                      if (e.target.value) setErrors(prev => { const c = {...prev}; delete c.year; return c; });
                    }}
                    className={`w-full px-2 py-1 text-xs bg-slate-50 hover:bg-slate-100/50 focus:bg-white border ${
                      errors.year ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-blue-600 focus:ring-0'
                    } rounded outline-none transition-all cursor-pointer`}
                  >
                    <option value="">Select Year</option>
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                  {errors.year && <p className="text-[10px] text-red-500 font-semibold mt-0.5 leading-tight">{errors.year}</p>}
                </div>

                {/* Department */}
                <div>
                  <label htmlFor="department" className="block text-[9px] font-bold text-slate-500 mb-0.5 uppercase tracking-wider">Department *</label>
                  <select
                    id="department"
                    value={department}
                    onChange={(e) => {
                      setDepartment(e.target.value);
                      if (e.target.value) setErrors(prev => { const c = {...prev}; delete c.department; return c; });
                    }}
                    className={`w-full px-2 py-1 text-xs bg-slate-50 hover:bg-slate-100/50 focus:bg-white border ${
                      errors.department ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-blue-600 focus:ring-0'
                    } rounded outline-none transition-all cursor-pointer`}
                  >
                    <option value="">Select Department</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  {errors.department && <p className="text-[10px] text-red-500 font-semibold mt-0.5 leading-tight">{errors.department}</p>}
                </div>
              </div>
            </div>

            {/* Technical IDs and Coordinates */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Register Number */}
              <div>
                <label htmlFor="register-number" className="block text-[9px] font-bold text-slate-500 mb-0.5 uppercase tracking-wider">Register Number *</label>
                <div className="relative">
                  <Hash className="absolute left-2.5 top-1.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    id="register-number"
                    type="text"
                    value={registerNumber}
                    onChange={(e) => {
                      setRegisterNumber(e.target.value);
                      if (e.target.value.trim()) setErrors(prev => { const c = {...prev}; delete c.registerNumber; return c; });
                    }}
                    placeholder="University ID / Roll No"
                    className={`w-full pl-8 pr-3 py-1 text-xs bg-slate-50 hover:bg-slate-100/50 focus:bg-white border ${
                      errors.registerNumber ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-blue-600 focus:ring-0'
                    } rounded outline-none transition-all`}
                  />
                </div>
                {errors.registerNumber && <p className="text-[10px] text-red-500 font-semibold mt-0.5 leading-tight">{errors.registerNumber}</p>}
              </div>

              {/* Mobile Number */}
              <div>
                <label htmlFor="mobile-number" className="block text-[9px] font-bold text-slate-500 mb-0.5 uppercase tracking-wider">Mobile Number *</label>
                <div className="relative">
                  <Phone className="absolute left-2.5 top-1.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    id="mobile-number"
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => {
                      setMobileNumber(e.target.value);
                      const raw = e.target.value.replace(/\D/g, '');
                      if (raw.length === 10) setErrors(prev => { const c = {...prev}; delete c.mobileNumber; return c; });
                    }}
                    placeholder="10-digit mobile number"
                    className={`w-full pl-8 pr-3 py-1 text-xs bg-slate-50 hover:bg-slate-100/50 focus:bg-white border ${
                      errors.mobileNumber ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-blue-600 focus:ring-0'
                    } rounded outline-none transition-all`}
                  />
                </div>
                {errors.mobileNumber && <p className="text-[10px] text-red-500 font-semibold mt-0.5 leading-tight">{errors.mobileNumber}</p>}
              </div>

              {/* Email Address */}
              <div>
                <label htmlFor="email-address" className="block text-[9px] font-bold text-slate-500 mb-0.5 uppercase tracking-wider">Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-2.5 top-1.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    id="email-address"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                      if (emailRegex.test(e.target.value)) setErrors(prev => { const c = {...prev}; delete c.email; return c; });
                    }}
                    placeholder="e.g. name@domain.com"
                    className={`w-full pl-8 pr-3 py-1 text-xs bg-slate-50 hover:bg-slate-100/50 focus:bg-white border ${
                      errors.email ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-blue-600 focus:ring-0'
                    } rounded outline-none transition-all`}
                  />
                </div>
                {errors.email && <p className="text-[10px] text-red-500 font-semibold mt-0.5 leading-tight">{errors.email}</p>}
              </div>
            </div>

          </div>

          {/* section 2: Event Details & Payment */}
          <div className="space-y-4">
            <div className="flex items-center space-x-1.5 border-b border-slate-200 pb-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-950 text-slate-100 font-bold text-[10px]">2</span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Event & Financial Logs</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Left Column: Details */}
              <div className="space-y-3">
                 {/* Event Name */}
                <div>
                  <label htmlFor="event-selection" className="block text-[9px] font-bold text-slate-500 mb-0.5 uppercase tracking-wider">Choose Technical Event *</label>
                  <select
                    id="event-selection"
                    value={selectedEvent}
                    onChange={(e) => setSelectedEvent(e.target.value)}
                    className={`w-full px-2 py-1 text-xs bg-slate-50 hover:bg-slate-100/50 focus:bg-white border ${
                      errors.selectedEvent ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-blue-600 focus:ring-0'
                    } rounded outline-none transition-all cursor-pointer`}
                  >
                    <option value="">Select Event</option>
                    {events.map(ev => <option key={ev.name} value={ev.name}>{ev.name} (₹{ev.fee})</option>)}
                  </select>
                  {errors.selectedEvent && <p className="text-[10px] text-red-500 font-semibold mt-0.5 leading-tight">{errors.selectedEvent}</p>}
                </div>

                {/* Amount Paid (Predefined and locked) */}
                <div>
                  <label htmlFor="amount-paid" className="block text-[9px] font-bold text-slate-500 mb-0.5 uppercase tracking-wider">Amount Paid (₹) *</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-2.5 top-1.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      id="amount-paid"
                      type="text"
                      readOnly
                      value={amountPaid ? `₹${amountPaid}` : ''}
                      placeholder="Select event to calculate fee"
                      className="w-full pl-8 pr-3 py-1 text-xs bg-slate-100 text-slate-500 border border-slate-200 rounded outline-none"
                    />
                  </div>
                  <p className="text-[9px] text-slate-400 mt-0.5">Registration fee is flat and auto-linked to the technical event category.</p>
                </div>

                {/* Payment Method */}
                <div>
                  <label htmlFor="payment-method" className="block text-[9px] font-bold text-slate-500 mb-0.5 uppercase tracking-wider">Payment Method *</label>
                  <select
                    id="payment-method"
                    value={paymentMethod}
                    onChange={(e) => {
                      setPaymentMethod(e.target.value);
                      if (e.target.value) setErrors(prev => { const c = {...prev}; delete c.paymentMethod; return c; });
                    }}
                    className={`w-full px-2 py-1 text-xs bg-slate-50 hover:bg-slate-100/50 focus:bg-white border ${
                      errors.paymentMethod ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-blue-600 focus:ring-0'
                    } rounded outline-none transition-all cursor-pointer`}
                  >
                    <option value="">Select Method</option>
                    {PAYMENT_METHODS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  {errors.paymentMethod && <p className="text-[10px] text-red-500 font-semibold mt-0.5 leading-tight">{errors.paymentMethod}</p>}
                </div>

                {/* Transaction ID */}
                <div>
                  <label htmlFor="transaction-id" className="block text-[9px] font-bold text-slate-500 mb-0.5 uppercase tracking-wider">Transaction Reference ID *</label>
                  <div className="relative">
                    <Key className="absolute left-2.5 top-1.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      id="transaction-id"
                      type="text"
                      value={transactionId}
                      onChange={(e) => {
                        setTransactionId(e.target.value);
                        if (e.target.value.trim()) setErrors(prev => { const c = {...prev}; delete c.transactionId; return c; });
                      }}
                      placeholder="UPI Ref / Bank Tx ID"
                      className={`w-full pl-8 pr-3 py-1 text-xs bg-slate-50 hover:bg-slate-100/50 focus:bg-white border ${
                        errors.transactionId ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-blue-600 focus:ring-0'
                      } rounded outline-none transition-all`}
                    />
                  </div>
                  {errors.transactionId && <p className="text-[10px] text-red-500 font-semibold mt-0.5 leading-tight">{errors.transactionId}</p>}
                </div>

              </div>

              {/* Right Column: Screenshot upload block */}
              <div className="flex flex-col h-full justify-between">
                <span className="block text-[9px] font-bold text-slate-500 mb-0.5 uppercase tracking-wider">Upload Payment Screenshot *</span>
                
                {paymentScreenshotPreview ? (
                  <div className="flex-grow border border-dashed border-blue-200 rounded p-2.5 bg-slate-50 flex flex-col items-center justify-center relative group min-h-[140px]">
                    <img 
                      src={paymentScreenshotPreview} 
                      alt="Payment Preview" 
                      className="max-h-24 rounded object-contain mb-1 border"
                      referrerPolicy="no-referrer"
                    />
                    <span className="text-[9px] font-mono text-slate-500 truncate max-w-[200px]">{paymentScreenshot?.name}</span>
                    <button
                      type="button"
                      onClick={() => handleScreenshotChange(null)}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded text-white transition-opacity cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </button>
                  </div>
                ) : isPdfScreenshot ? (
                  <div className="flex-grow border border-dashed border-blue-200 rounded p-2.5 bg-slate-50 flex flex-col items-center justify-center relative group min-h-[140px]">
                    <FileText className="h-10 w-10 text-red-500 mb-1" />
                    <span className="text-[10px] font-bold text-slate-700">PDF Document Loaded</span>
                    <span className="text-[9px] font-mono text-slate-500 truncate max-w-[200px] mt-0.5">{paymentScreenshot?.name}</span>
                    <button
                      type="button"
                      onClick={() => handleScreenshotChange(null)}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded text-white transition-opacity cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => screenshotInputRef.current?.click()}
                    className={`flex-grow border border-dashed ${
                      errors.paymentScreenshot ? 'border-red-400 bg-red-50/20' : 'border-slate-200 bg-slate-50'
                    } rounded p-3 flex flex-col items-center justify-center hover:border-blue-500 transition-colors cursor-pointer group min-h-[140px]`}
                  >
                    <Upload className="h-6 w-6 text-slate-400 group-hover:text-blue-500 mb-1 transition-colors" />
                    <p className="text-[10px] font-bold text-slate-700">Drag & Drop or Click to Upload</p>
                    <p className="text-[9px] text-slate-400 mt-0.5 text-center">Allowed formats: JPG, JPEG, PNG, PDF</p>
                    <p className="text-[9px] text-slate-400 font-mono mt-0.5">Maximum size: 5 MB</p>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={screenshotInputRef}
                  onChange={(e) => handleScreenshotChange(e.target.files?.[0] || null)}
                  className="hidden" 
                  accept=".jpg,.jpeg,.png,.pdf"
                />
                {errors.paymentScreenshot && (
                  <p className="text-[10px] text-red-500 font-semibold mt-1 leading-tight">{errors.paymentScreenshot}</p>
                )}
              </div>

            </div>

          </div>

          {/* section 3: Terms and actions */}
          <div className="pt-4 border-t border-slate-200 space-y-4">
            
            {/* T&C Checkbox */}
            <div className="flex items-start gap-2">
              <input
                id="terms-conditions"
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => {
                  setTermsAccepted(e.target.checked);
                  if (e.target.checked) setErrors(prev => { const c = {...prev}; delete c.termsAccepted; return c; });
                }}
                className="h-3.5 w-3.5 text-blue-600 border-slate-300 rounded focus:ring-blue-600 mt-0.5 cursor-pointer"
              />
              <label htmlFor="terms-conditions" className="text-[10px] text-slate-500 leading-normal cursor-pointer select-none">
                I hereby verify that all details provided in this form are authentic and consistent with my college registration records. I agree that in case of any duplicate logs, payment errors, or transaction spoofing, my registration will be unilaterally cancelled without a refund.
              </label>
            </div>
            {errors.termsAccepted && <p className="text-[10px] text-red-500 font-semibold leading-tight">{errors.termsAccepted}</p>}

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row justify-end items-center gap-2 pt-2">
              <button
                id="reset-form-btn"
                type="button"
                onClick={handleReset}
                className="w-full sm:w-auto px-4 py-1.5 border border-slate-200 text-slate-500 font-bold rounded hover:bg-slate-50 hover:text-slate-700 transition-colors cursor-pointer text-center text-xs"
              >
                Reset Form
              </button>
              <button
                id="submit-form-btn"
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-5 py-1.5 bg-blue-700 hover:bg-blue-600 text-white font-bold rounded shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-55 text-xs"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Processing Registration...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-3.5 w-3.5" />
                    <span>Submit & Confirm</span>
                  </>
                )}
              </button>
            </div>

          </div>

        </form>
      </div>

      {/* Success Modal Overlay */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded max-w-sm w-full shadow-xl border border-slate-200 p-4 transform transition-all text-center space-y-4 animate-shake">
            
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 shadow-inner">
              <Check className="h-5 w-5 stroke-[3]" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-slate-900">Registration Confirmed!</h3>
              <p className="text-[10px] text-slate-500">Your technical entry has been logged into our secure databases.</p>
            </div>

            {/* Registration ID Banner */}
            <div className="bg-blue-50 border border-blue-100 rounded p-2.5">
              <span className="block text-[8px] uppercase tracking-wider font-mono text-slate-500">YOUR REGISTRATION ID</span>
              <span className="block text-lg font-black text-blue-900 tracking-wider mt-0.5">#PIN{generatedRegId}</span>
            </div>

            <div className="text-[9px] text-slate-500 leading-normal text-left bg-slate-50 p-2.5 rounded border border-slate-100 space-y-0.5">
              <p>• A confirmation email has been dispatched to your address.</p>
              <p>• Please print or save this screen for reference during event check-in.</p>
              <p>• Verification of payments typically takes up to 24 hours.</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  setCurrentTab('home');
                }}
                className="w-full py-1.5 bg-blue-700 hover:bg-blue-600 text-white font-bold rounded transition-colors shadow text-xs cursor-pointer"
              >
                Return to Homepage
              </button>
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  setCurrentTab('register');
                }}
                className="w-full py-1.5 text-slate-500 hover:text-slate-800 font-semibold text-[10px] cursor-pointer"
              >
                Register for Another Event
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
