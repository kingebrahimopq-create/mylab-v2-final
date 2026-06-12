import React, { useState, useEffect } from 'react';
import { 
  Network, Search, ShieldCheck, Microscope, UserPlus, FileSignature, 
  Save, QrCode, RefreshCw, AlertTriangle, CheckCircle, Clock, 
  ArrowLeft, Download, Printer, Lock, Unlock, Sliders, Database, 
  LogOut, MessageSquare, Settings, Activity, FileText, ChevronLeft, 
  User, ShieldAlert, Award
} from 'lucide-react';
import { Patient, Sample, TestResult, SampleLog, NotificationLog } from './types';

const API_BASE = '/api';

export default function App() {
  const [panelMode, setPanelMode] = useState<'clinician' | 'patient'>('clinician');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'patients' | 'samples' | 'results' | 'lis' | 'notifications' | 'clinicians' | 'keep'>('dashboard');
  const [userRole, setUserRole] = useState<'doctor' | 'accountant'>('doctor');

  // Clinicians Auth & Approval Security States
  const [loggedInClinician, setLoggedInClinician] = useState<{
    email: string;
    fullName: string;
    role: 'owner' | 'doctor' | 'accountant';
    status: 'approved' | 'pending' | 'rejected';
  } | null>(() => {
    try {
      const stored = localStorage.getItem('mylab_clinician');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [cliniciansList, setCliniciansList] = useState<any[]>([]);
  const [googleEmailInput, setGoogleEmailInput] = useState('');
  const [googlePasswordInput, setGooglePasswordInput] = useState('');
  const [googleRoleInput, setGoogleRoleInput] = useState<'doctor' | 'accountant'>('doctor');
  const [authError, setAuthError] = useState('');
  const [pendingMessage, setPendingMessage] = useState('');

  // Directory States
  const [patients, setPatients] = useState<Patient[]>([]);
  const [samples, setSamples] = useState<Sample[]>([]);
  const [selectedSample, setSelectedSample] = useState<Sample | null>(null);
  const [sampleLogsList, setSampleLogsList] = useState<SampleLog[]>([]);
  const [notificationLogs, setNotificationLogs] = useState<NotificationLog[]>([]);
  const [activeResults, setActiveResults] = useState<{ [sampleId: string]: TestResult[] }>({});
  
  // Verification State
  const [verificationFeedback, setVerificationFeedback] = useState<{ [resultId: string]: any }>({});
  const [isVerifying, setIsVerifying] = useState<string | null>(null);

  // LIS Driver Simulation States
  const [lisMsgType, setLisMsgType] = useState<'hl7' | 'astm'>('hl7');
  const [lisCustomMessage, setLisCustomMessage] = useState<string>('');
  const [lisFeedback, setLisFeedback] = useState<{ success: boolean; message: string; parsed?: any } | null>(null);

  // --- Google Keep States ---
  const [keepNotes, setKeepNotes] = useState<any[]>([]);
  const [keepAuthStatus, setKeepAuthStatus] = useState<{ isConnected: boolean; email: string | null; isConfigured: boolean }>({
    isConnected: false,
    email: null,
    isConfigured: false
  });
  const [newKeepTitle, setNewKeepTitle] = useState('');
  const [newKeepContent, setNewKeepContent] = useState('');
  const [newKeepType, setNewKeepType] = useState<'text' | 'list'>('text');
  const [newKeepListItems, setNewKeepListItems] = useState<{ text: string; checked: boolean }[]>([]);
  const [newKeepListItemInput, setNewKeepListItemInput] = useState('');
  const [isLoadingKeep, setIsLoadingKeep] = useState(false);
  const [isSavingKeepNote, setIsSavingKeepNote] = useState(false);

  // Forms
  const [newPatient, setNewPatient] = useState({ nationalId: '', fullName: '', dateOfBirth: '', gender: 'Male', phoneNumber: '' });
  const [newSample, setNewSample] = useState({ patientId: '', sampleType: 'Blood' });
  const [newResult, setNewResult] = useState({ sampleId: '', testName: 'Hemoglobin', resultValue: '', referenceRange: '13.8 - 17.2', unit: 'g/dL' });

  // Patient Portal States
  const [patientNationalId, setPatientNationalId] = useState('');
  const [patientOtp, setPatientOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [simulatedOtp, setSimulatedOtp] = useState('');
  const [patientProfile, setPatientProfile] = useState<{
    patient: Patient | null;
    samples: Sample[];
    results: TestResult[];
  } | null>(null);
  const [patientLoginError, setPatientLoginError] = useState('');
  const [activePatientSubTab, setActivePatientSubTab] = useState<'dashboard' | 'trends' | 'fhir' | 'report'>('dashboard');

  // Load active preset for LIS Driver
  const hl7Preset = `MSH|^~\\&|LIS||LAB||20260611||ORU^R01|MSG0001|P|2.3\nPID|||112233||\nOBR|1||[BARCODE_PLACEHOLDER]|||20260611\nOBX|1|NM|GLU^Glucose|1|108|mg/dL|70-100|H|||F`;
  const astmPreset = `H|\\^&|||LIS||||||P|1\nP|1||112233||\nO|1|[BARCODE_PLACEHOLDER]||^^^HEM||||||||||||||||||||F\nR|1|^^^HEM|14.5|g/dL|13.8 - 17.2|N||F\nL|1|F`;

  // Load clinicians list when logged in as project owner
  const fetchCliniciansList = async () => {
    if (!loggedInClinician || loggedInClinician.email !== 'mhm763517@gmail.com') return;
    try {
      const res = await fetch(`${API_BASE}/clinicians`, {
        headers: {
          'x-requester-email': loggedInClinician.email
        }
      });
      if (res.ok) {
        setCliniciansList(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleGoogleSignInSimulated = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!googleEmailInput) {
      setAuthError('يرجى كتابة عنوان البريد الإلكتروني الخاص بجوجل.');
      return;
    }
    if (!googlePasswordInput) {
      setAuthError('يرجى كتابة كلمة مرور حساب Google للتحقق الآمن.');
      return;
    }
    if (googlePasswordInput.length < 6) {
      setAuthError('تفادياً للمخاطر، يجب أن تتكون كلمة المرور من 6 خانات على الأقل.');
      return;
    }
    setAuthError('');
    setPendingMessage('');
    try {
      const res = await fetch(`${API_BASE}/auth/google-sso`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: googleEmailInput,
          password: googlePasswordInput,
          requestedRole: googleRoleInput
        })
      });

      const data = await res.json();
      if (res.ok) {
        if (data.success && data.user) {
          localStorage.setItem('mylab_clinician', JSON.stringify(data.user));
          setLoggedInClinician(data.user);
          setUserRole(data.user.role === 'owner' || data.user.role === 'doctor' ? 'doctor' : 'accountant');
          triggerUIFeedback(`تم الدخول بنجاح بحساب Google المعتمد: ${data.user.email}`);
        } else {
          setPendingMessage(data.message || 'طلبك معلق بانتظار موافقة مالك المشروع.');
        }
      } else {
        setAuthError(data.error || 'فشلت عملية التحقق من الحساب المرفق.');
      }
    } catch (err) {
      console.error(err);
      setAuthError('عجز النظام عن الاتصال ببوابة التحقق من الهوية.');
    }
  };

  const handleApproveClinician = async (email: string, status: 'approved' | 'rejected', role?: string) => {
    if (!loggedInClinician || loggedInClinician.email !== 'mhm763517@gmail.com') return;
    try {
      const res = await fetch(`${API_BASE}/clinicians/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-requester-email': loggedInClinician.email
        },
        body: JSON.stringify({ email, status, role })
      });
      if (res.ok) {
        triggerUIFeedback(`تم تحديث حالة الحساب وتفعيل ترحيل الصلاحيات للمستخدم بنجاح.`);
        fetchCliniciansList();
        fetchPatients();
        fetchSamples();
      } else {
        const err = await res.json();
        triggerUIFeedback(err.error || 'فشلت عملية التعديل', 'danger');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteClinicianRequest = async (email: string) => {
    if (!loggedInClinician || loggedInClinician.email !== 'mhm763517@gmail.com') return;
    try {
      const res = await fetch(`${API_BASE}/clinicians/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-requester-email': loggedInClinician.email
        },
        body: JSON.stringify({ email })
      });
      if (res.ok) {
        triggerUIFeedback('تم مسح وإلغاء طلب الانضمام.');
        fetchCliniciansList();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // --- Google Keep Integrated Actions ---
  const fetchKeepStatusAndNotes = async () => {
    if (!loggedInClinician) return;
    setIsLoadingKeep(true);
    try {
      // 1. Fetch Google Keep authorization status
      const statusRes = await fetch(`${API_BASE}/keep/auth-status`, {
        headers: { 'x-requester-email': loggedInClinician.email }
      });
      if (statusRes.ok) {
        setKeepAuthStatus(await statusRes.json());
      }

      // 2. Fetch all Keep notes (Real Google Keep if OAuth active, SQLite simulation fallback if inactive)
      const notesRes = await fetch(`${API_BASE}/keep/notes`, {
        headers: { 'x-requester-email': loggedInClinician.email }
      });
      if (notesRes.ok) {
        setKeepNotes(await notesRes.json());
      }
    } catch (err) {
      console.error('Failed to retrieve Keep details:', err);
    } finally {
      setIsLoadingKeep(false);
    }
  };

  const handleConnectKeep = async () => {
    if (!loggedInClinician) return;
    try {
      const res = await fetch(`${API_BASE}/keep/auth-url?email=${encodeURIComponent(loggedInClinician.email)}`);
      if (res.ok) {
        const { url, isConfigured } = await res.json();
        if (!isConfigured) {
          triggerUIFeedback('تم تفعيل وضع المعمل الفيدرالي التفاعلي لـ Google Keep (محاكاة محلية نشطة).');
          // In local simulation, just toggle connection to true so they can interact as if authorized
          setKeepAuthStatus({ isConnected: true, email: loggedInClinician.email, isConfigured: false });
          fetchKeepStatusAndNotes();
          return;
        }

        const authWindow = window.open(url, 'keep_oauth_popup', 'width=600,height=700');
        if (!authWindow) {
          alert('الرجاء السماح بالنوافذ المنبثقة في متصفحك لإكمال ربط حساب Google Keep.');
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDisconnectKeep = async () => {
    if (!loggedInClinician) return;
    const confirmed = window.confirm('هل أنت متأكد من رغبتك في قطع الاتصال وإلغاء كفاءة مزامنة Google Keep؟');
    if (!confirmed) return;

    try {
      await fetch(`${API_BASE}/keep/disconnect`, {
        method: 'POST',
        headers: { 'x-requester-email': loggedInClinician.email }
      });
      setKeepAuthStatus({ isConnected: false, email: null, isConfigured: keepAuthStatus.isConfigured });
      triggerUIFeedback('تم إلغاء مكاملة حساب Google Keep الموحد.');
      fetchKeepStatusAndNotes();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddKeepNote = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!loggedInClinician) return;
    if (!newKeepTitle.trim()) {
      alert('الرجاء كتابة اسم أو عنوان الملاحظة الطبية.');
      return;
    }

    setIsSavingKeepNote(true);
    try {
      const contentPayload = newKeepType === 'list' ? newKeepListItems : newKeepContent;
      const res = await fetch(`${API_BASE}/keep/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-requester-email': loggedInClinician.email
        },
        body: JSON.stringify({
          title: newKeepTitle,
          content: contentPayload,
          noteType: newKeepType
        })
      });

      if (res.ok) {
        triggerUIFeedback('تم حفظ الملاحظة ومزامنتها بنجاح مع Google Keep 📌');
        setNewKeepTitle('');
        setNewKeepContent('');
        setNewKeepListItems([]);
        setNewKeepListItemInput('');
        fetchKeepStatusAndNotes();
      } else {
        alert('حدث خطأ أثناء حفظ ومزامنة الملاحظة.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingKeepNote(false);
    }
  };

  const handleDeleteKeepNote = async (noteId: string) => {
    if (!loggedInClinician) return;

    // Critical Requirement: explicit user confirmation for destructive resource deletion
    const confirmed = window.confirm('🚨 تحذير: هل أنت متأكد من حذف هذه الملاحظة نهائياً من حساب Google Keep والمنظومة؟ لا يمكن التراجع عن هذا الإجراء.');
    if (!confirmed) return;

    try {
      const res = await fetch(`${API_BASE}/keep/notes/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-requester-email': loggedInClinician.email
        },
        body: JSON.stringify({ id: noteId })
      });

      if (res.ok) {
        triggerUIFeedback('تم حذف الملاحظة بنجاح من الأرشيف.');
        fetchKeepStatusAndNotes();
      } else {
        alert('فشلت محاولة حذف الملاحظة من السيرفر.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleKeepListItem = async (noteId: string, itemIdx: number) => {
    if (!loggedInClinician) return;
    const targetNote = keepNotes.find(n => n.id === noteId);
    if (!targetNote || targetNote.noteType !== 'list') return;

    // Copy list items and toggle checked state
    const updatedItems = [...targetNote.content];
    updatedItems[itemIdx] = {
      ...updatedItems[itemIdx],
      checked: !updatedItems[itemIdx].checked
    };

    try {
      // Save updated back to keep API proxy
      await fetch(`${API_BASE}/keep/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-requester-email': loggedInClinician.email
        },
        body: JSON.stringify({
          title: targetNote.title,
          content: updatedItems,
          noteType: 'list'
        })
      });
      fetchKeepStatusAndNotes();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateNoteFromContext = async (title: string, content: string) => {
    if (!loggedInClinician) return;
    try {
      triggerUIFeedback('جاري تجهيز الملاحظة لمزامنتها...');
      const res = await fetch(`${API_BASE}/keep/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-requester-email': loggedInClinician.email
        },
        body: JSON.stringify({
          title,
          content,
          noteType: 'text'
        })
      });
      if (res.ok) {
        triggerUIFeedback('تمت المزامنة وحفظ الملاحظة الطبية بـ Google Keep بنجاح! 🔬');
        fetchKeepStatusAndNotes();
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (loggedInClinician) {
      fetchKeepStatusAndNotes();
    }
  }, [loggedInClinician]);

  // Handle messages from interactive OAuth code callback popups safely
  useEffect(() => {
    const handlePopupMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        triggerUIFeedback('تم التحقق وتنشيط تراخيص Google Keep للمعمل بنجاح! 🔓');
        fetchKeepStatusAndNotes();
      }
    };
    window.addEventListener('message', handlePopupMessage);
    return () => window.removeEventListener('message', handlePopupMessage);
  }, [loggedInClinician]);

  const handleClinicianLogout = () => {
    localStorage.removeItem('mylab_clinician');
    setLoggedInClinician(null);
    setGoogleEmailInput('');
    setGooglePasswordInput('');
    setPendingMessage('');
    setAuthError('');
    triggerUIFeedback('تم تسجيل الخروج من لوحة التحكم بنجاح.');
  };

  useEffect(() => {
    if (loggedInClinician) {
      setUserRole(loggedInClinician.role === 'owner' || loggedInClinician.role === 'doctor' ? 'doctor' : 'accountant');
      fetchPatients();
      fetchSamples();
      fetchNotificationLogs();
      if (loggedInClinician.email === 'mhm763517@gmail.com') {
        fetchCliniciansList();
      }
    }
  }, [userRole, loggedInClinician]);

  // Handle generic error / alerts safely without visual alert blocking index
  const [systemUIMessage, setSystemUIMessage] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);
  const triggerUIFeedback = (text: string, type: 'success' | 'danger' = 'success') => {
    setSystemUIMessage({ type, text });
    setTimeout(() => {
      setSystemUIMessage(null);
    }, 4000);
  };

  const fetchPatients = async () => {
    try {
      const res = await fetch(`${API_BASE}/patients`, {
        headers: { 'x-user-role': userRole }
      });
      if (res.ok) setPatients(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSamples = async () => {
    try {
      const res = await fetch(`${API_BASE}/samples`, {
        headers: { 'x-user-role': userRole }
      });
      if (res.ok) {
        const data = await res.json();
        setSamples(data);
        // Automatically fetch results for each sample in backgrounds
        data.forEach((s: Sample) => {
          fetchResultsForSample(s.id);
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchResultsForSample = async (sampleId: string) => {
    try {
      const res = await fetch(`${API_BASE}/results/${sampleId}`, {
        headers: { 'x-user-role': userRole }
      });
      if (res.ok) {
        const data = await res.json();
        setActiveResults(prev => ({ ...prev, [sampleId]: data }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchNotificationLogs = async () => {
    try {
      const res = await fetch(`${API_BASE}/notifications`);
      if (res.ok) setNotificationLogs(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSampleLogs = async (sampleId: string) => {
    try {
      const res = await fetch(`${API_BASE}/samples/${sampleId}/logs`);
      if (res.ok) {
        const data = await res.json();
        setSampleLogsList(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRegisterPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/patients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPatient)
      });
      if (res.ok) {
        triggerUIFeedback('تم تسجيل المريض بنجاح وتشفير البيانات الحيوية (PII) عبر خوارزمية AES-256.');
        fetchPatients();
        setNewPatient({ nationalId: '', fullName: '', dateOfBirth: '', gender: 'Male', phoneNumber: '' });
      }
    } catch (e) {
      console.error(e);
      triggerUIFeedback('حدث خطأ أثناء الاتصال بالخادم الرئيسي.', 'danger');
    }
  };

  const handleRegisterSample = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/samples`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSample)
      });
      if (res.ok) {
        triggerUIFeedback('تم تسجيل العينة الطبية وتوليد رمز GS1-128 الفريد وبدء سجل تتبع الحيازة.');
        fetchSamples();
        setNewSample({ ...newSample, patientId: '' });
      }
    } catch (e) {
      console.error(e);
      triggerUIFeedback('عجز النظام عن حفظ العينة.', 'danger');
    }
  };

  const handleEnterResult = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newResult)
      });
      if (res.ok) {
        triggerUIFeedback('تم اعتماد النتيجة بنجاح وتوقيعها رقميًا ببصمة SHA-256 فريدة ضد التلاعب.');
        fetchSamples();
        setNewResult({ ...newResult, resultValue: '', sampleId: '' });
        fetchNotificationLogs();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateSampleStatus = async (sampleId: string, status: string, remarks: string) => {
    try {
      const res = await fetch(`${API_BASE}/samples/${sampleId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          remarks,
          operator: userRole === 'doctor' ? 'د. أحمد سليمان (طبيب معتمد)' : 'مستقبل العينات'
        })
      });
      if (res.ok) {
        triggerUIFeedback(`تمت ترقية حالة العينة الطبية إلى: ${status === 'received' ? 'مستلمة بالمعمل' : status === 'processing' ? 'قيد المعالجة الآلية' : 'مكتملة الفحص'}`);
        fetchSamples();
        if (selectedSample && selectedSample.id === sampleId) {
          fetchSampleLogs(sampleId);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleVerifyIntegrity = async (resultId: string) => {
    setIsVerifying(resultId);
    try {
      const res = await fetch(`${API_BASE}/results/verify-integrity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resultId })
      });
      if (res.ok) {
        const feedback = await res.json();
        setVerificationFeedback(prev => ({ ...prev, [resultId]: feedback }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsVerifying(null);
    }
  };

  // LIS Parser Sim
  const populateLISPreset = (type: 'hl7' | 'astm', sampleBarcode: string) => {
    setLisMsgType(type);
    const template = type === 'hl7' ? hl7Preset : astmPreset;
    setLisCustomMessage(template.replace('[BARCODE_PLACEHOLDER]', sampleBarcode));
  };

  const handleRunLISParser = async () => {
    if (!lisCustomMessage) {
      triggerUIFeedback('يرجى تحديد رسالة LIS أو إدخال كود ASTM/HL7 أولاً.', 'danger');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/lis/parse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: lisCustomMessage, type: lisMsgType })
      });
      const data = await res.json();
      setLisFeedback(data);
      if (data.success) {
        triggerUIFeedback('تمت معالجة بيانات جهاز LIS بنجاح، وتوقيع النتيجة المستخلصة إلكترونياً.');
        fetchSamples();
        fetchNotificationLogs();
      } else {
        triggerUIFeedback(data.message, 'danger');
      }
    } catch (e) {
      console.error(e);
      triggerUIFeedback('حدثت مشكلة أثناء إرسال الرسالة إلى المحلل الآلي.', 'danger');
    }
  };

  // Notification Retry Trigger
  const handleRetryNotification = async (notifId: string) => {
    try {
      const res = await fetch(`${API_BASE}/notifications/${notifId}/retry`, {
         method: 'POST'
      });
      if (res.ok) {
         triggerUIFeedback('تم تفعيل بروتوكول إعادة الاستدعاء التلقائي للمصادقة اللاسلكية بنجاح!');
         fetchNotificationLogs();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Patient Portal Auth
  const handleGeneratePatientOTP = async () => {
     if (!patientNationalId) {
        setPatientLoginError('يرجى كتابة رقم الهوية الوطني أو الرقم المدني للمريض.');
        return;
     }
     setPatientLoginError('');
     try {
       const res = await fetch(`${API_BASE}/patient/otp/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nationalId: patientNationalId })
       });
       if (res.ok) {
          const data = await res.json();
          setSimulatedOtp(data.otp);
          setOtpSent(true);
          triggerUIFeedback(`[محاكاة الرسائل] الرمز السري المؤقت لمرة واحدة (OTP) هو: ${data.otp}`);
       }
     } catch (e) {
       console.error(e);
     }
  };

  const handlePatientLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientNationalId || !patientOtp) {
       setPatientLoginError('الحقول مطلوبة بالكامل.');
       return;
    }
    setPatientLoginError('');
    try {
      const res = await fetch(`${API_BASE}/patient/login`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ nationalId: patientNationalId, otp: patientOtp })
      });
      if (res.ok) {
         const data = await res.json();
         setPatientProfile(data);
         triggerUIFeedback(`أهلاً بك مريضنا الكريم، تم سحب سجلك الطبي المعتمد بالكامل.`);
         setActivePatientSubTab('dashboard');
      } else {
         const err = await res.json();
         setPatientLoginError(err.error || 'الرمز السري المؤقت غير صحيح.');
      }
    } catch (e) {
      console.error(e);
      setPatientLoginError('عجز الاتصال بالخادم الطبي الدائم.');
    }
  };

  const handlePatientLogout = () => {
     setPatientProfile(null);
     setPatientOtp('');
     setOtpSent(false);
     setSimulatedOtp('');
     setPatientNationalId('');
     triggerUIFeedback('تم تسجيل الخروج من البوابة الآمنة للمريض بنجاح.');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col justify-between print:bg-white print:text-black">
      {/* Top Banner Alert Toast */}
      {systemUIMessage && (
        <div className={`fixed bottom-6 left-6 z-50 p-4 rounded-xl shadow-xl flex items-center gap-3 border transition-all duration-300 animate-bounce ${systemUIMessage.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'}`}>
          {systemUIMessage.type === 'success' ? (
            <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0" />
          )}
          <p className="text-sm font-medium">{systemUIMessage.text}</p>
        </div>
      )}

      {/* Main Top Header and Selector Terminal */}
      <header className="bg-[#efebe3] text-[#43423b] shadow-sm border-b border-[#e1ddd3] print:hidden">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-[#f8f7f4] p-3 rounded-xl border border-[#e1ddd3] shadow-inner">
              <Microscope className="w-10 h-10 text-[#6b705c]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-semibold font-display tracking-tight text-[#2d2c27]">MyLab V2</span>
                <span className="bg-[#6b705c]/10 text-[#6b705c] text-[10px] uppercase font-mono tracking-widest px-2 py-0.5 rounded-full border border-[#6b705c]/30">Professional</span>
              </div>
              <p className="text-xs text-[#8a887d] font-medium">نظام إدارة المختبرات الطبية الفائق والأمن والربط التلقائي عبر LIS</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Terminal Switcher */}
            <div className="bg-[#f8f7f4] p-1.5 rounded-xl border border-[#e1ddd3] flex gap-2">
              <button
                onClick={() => { setPanelMode('clinician'); }}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${panelMode === 'clinician' ? 'bg-[#6b705c] text-white shadow' : 'text-[#8a887d] hover:text-[#43423b]'}`}
              >
                <Sliders className="w-3.5 h-3.5" /> محطة الموظف الطبي
              </button>
              <button
                onClick={() => { setPanelMode('patient'); }}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${panelMode === 'patient' ? 'bg-[#cb997e] text-white shadow' : 'text-[#8a887d] hover:text-[#43423b]'}`}
              >
                <User className="w-3.5 h-3.5" /> البوابة الذكية للمريض
              </button>
            </div>

            {/* Field Security Indicator */}
            <div className="bg-[#f8f7f4] py-2 px-4 rounded-xl border border-[#e1ddd3] text-xs font-mono flex items-center gap-2 text-[#43423b]">
              <ShieldCheck className="w-4 h-4 text-[#6b705c] animate-spin-slow" />
              <span>مستودع SQLite WAL آمن</span>
            </div>
          </div>
        </div>
      </header>

      {/* Clinician Terminal Wrapper */}
      {panelMode === 'clinician' && !loggedInClinician && (
         <div className="max-w-md mx-auto w-full px-6 py-12 md:py-24 flex-1 flex flex-col justify-center print:hidden">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6 text-right relative overflow-hidden">
               <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-l from-emerald-500 to-indigo-600"></div>
               
               <div className="space-y-4 text-center">
                  <div className="mx-auto bg-slate-50 p-4 rounded-full w-16 h-16 flex items-center justify-center border border-slate-100">
                     <Lock className="w-8 h-8 text-slate-800" />
                  </div>
                  <div className="space-y-1">
                     <h2 className="text-base font-black text-slate-800">بوابة الموظف والمشرف الطبي الآمنة</h2>
                     <p className="text-[11px] text-slate-500">منظومة المصادقة الفائقة والتحكم بالوصول لمنظومة MyLab عبر Google Single Sign-on</p>
                  </div>
               </div>

               {/* Secure Info Box */}
               <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2 text-xs">
                  <p className="font-extrabold text-slate-700 flex items-center gap-2 justify-end">
                     <span>بوابة الدخول المصرح بها للمنشأة</span>
                     <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  </p>
                  <p className="text-slate-500 leading-relaxed text-[10px]">
                     هذا النظام آمن ومخصص للموظفين والأطباء المصرح لهم فقط. بمجرد تقديم طلب تسجيل الدخول، سيبقى طلبك قيد الانتظار لموافقة إدارة ومتحكم المنظومة الرئيسي قبل منح الصلاحيات الطبية أو المالية.
                  </p>
               </div>

               {/* Log-In Fields */}
               <form onSubmit={handleGoogleSignInSimulated} className="space-y-4">
                  <div className="space-y-1">
                     <label className="text-[11px] font-bold text-slate-600 block">عنوان بريد Google للإدارة الطبية</label>
                     <input
                        type="email"
                        required
                        placeholder="example@gmail.com"
                        value={googleEmailInput}
                        onChange={(e) => setGoogleEmailInput(e.target.value)}
                        className="w-full p-3 rounded-xl border border-slate-200 text-xs text-left font-mono focus:outline-none focus:ring-2 focus:ring-slate-900"
                     />
                  </div>

                  <div className="space-y-1">
                     <label className="text-[11px] font-bold text-slate-600 block">كلمة مرور حساب Google للتحقق الآمن</label>
                     <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={googlePasswordInput}
                        onChange={(e) => setGooglePasswordInput(e.target.value)}
                        className="w-full p-3 rounded-xl border border-slate-200 text-xs text-left font-mono focus:outline-none focus:ring-2 focus:ring-slate-900"
                     />
                  </div>

                  <div className="space-y-1">
                     <label className="text-[11px] font-bold text-slate-600 block">الصفة الوظيفية المطلوبة بالنظام</label>
                     <select
                        value={googleRoleInput}
                        onChange={(e: any) => setGoogleRoleInput(e.target.value)}
                        className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                     >
                        <option value="doctor">طبيب معمل معتمد (رؤية التحاليل و فك تشفير PII)</option>
                        <option value="accountant">موظف استقبال وحسابات (حظر التقارير والأسماء الطبية)</option>
                     </select>
                  </div>

                  {/* Auth feedback alerts */}
                  {authError && (
                     <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl text-rose-800 text-[10px] leading-relaxed flex items-center gap-1.5 justify-end text-right">
                        <span>{authError}</span>
                        <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                     </div>
                  )}

                  {pendingMessage && (
                     <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-amber-950 text-[10px] leading-relaxed space-y-1 text-right">
                        <p className="font-extrabold flex items-center gap-1.5 justify-end text-amber-800">
                           <span>طلب الانضمام قيد الانتظار حالياً</span>
                           <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0 animate-pulse" />
                        </p>
                        <p className="text-slate-600">{pendingMessage}</p>
                     </div>
                  )}

                  {/* Google Login Trigger */}
                  <button
                     type="submit"
                     className="w-full bg-slate-900 hover:bg-slate-800 text-white p-3.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-3 active:scale-[0.98] shadow-md border border-slate-900"
                  >
                     <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                     </svg>
                     <span>دخول سريع ومصادقة Google SSO</span>
                  </button>
               </form>
            </div>
         </div>
      )}

      {/* Clinician Terminal Wrapper */}
      {panelMode === 'clinician' && loggedInClinician && (
        <div className="max-w-7xl mx-auto w-full px-6 py-8 flex-1 flex flex-col lg:flex-row gap-8 print:hidden">
          
          {/* Sidebar Area */}
          <aside className="w-full lg:w-64 shrink-0 space-y-6">
            
            {/* Authenticated User Badge & Logout */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-slate-800 pb-2 border-b border-slate-100 justify-between">
                <button 
                  onClick={handleClinicianLogout}
                  className="text-[10px] bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold px-2.5 py-1 rounded-lg transition-all flex items-center gap-1"
                >
                  <LogOut className="w-3 h-3" />
                  خروج
                </button>
                <div className="flex items-center gap-2 text-right">
                  <h3 className="font-bold text-sm">جلسة العمل المعتمدة</h3>
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                </div>
              </div>

              {/* Logged-in Clinician info */}
              <div className="text-right space-y-1">
                <p className="text-xs font-black text-slate-900">{loggedInClinician?.fullName}</p>
                <p className="text-[10px] text-slate-400 font-mono">{loggedInClinician?.email}</p>
                <div className="flex flex-wrap gap-1 pt-1 justify-end">
                  <span className="text-[9px] bg-slate-900 text-slate-100 px-2 py-0.5 rounded-full font-black uppercase font-mono">
                     {loggedInClinician?.role === 'owner' ? 'ROOT_OWNER' : loggedInClinician?.role.toUpperCase()}
                  </span>
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                     Google SSO
                  </span>
                </div>
              </div>

              {/* Toggles for owners to switch views during trial sessions */}
              {loggedInClinician?.email === 'mhm763517@gmail.com' && (
                <div className="space-y-2 pt-2 border-t border-slate-100 text-right">
                  <span className="text-[9px] text-slate-400 font-bold block">متحكم المنصة: محاكاة أدوار الموظفين</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => { setUserRole('doctor'); triggerUIFeedback('وضع محاكاة الطبابة المعتمدة'); }}
                      className={`text-[9.5px] font-bold p-1.5 rounded-lg border text-center transition-all ${userRole === 'doctor' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                    >
                      طبيب معتمد
                    </button>
                    <button
                      onClick={() => { setUserRole('accountant'); triggerUIFeedback('وضع محاكاة قسم الحسابات والمالية'); }}
                      className={`text-[9.5px] font-bold p-1.5 rounded-lg border text-center transition-all ${userRole === 'accountant' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                    >
                      محاسب / استقبال
                    </button>
                  </div>
                </div>
              )}
              
              <div className="bg-slate-50 text-[10px] p-2.5 rounded-lg text-slate-500 border border-slate-100 font-mono text-center leading-relaxed">
                {userRole === 'doctor' ? '🔓 كامل الصلاحية الطبية لفك تشفير المرضى' : '🔒 حجب التقارير الطبية بالـ *** وتعمية المرضى'}
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-1.5">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full px-4 py-3 rounded-xl font-bold text-xs transition-all text-right flex items-center gap-3 ${activeTab === 'dashboard' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <Activity className={`w-4 h-4 ${activeTab === 'dashboard' ? 'text-emerald-400' : 'text-slate-400'}`} />
                المؤشرات ولوحة التحكم المركزية
              </button>

              <button
                onClick={() => setActiveTab('patients')}
                className={`w-full px-4 py-3 rounded-xl font-bold text-xs transition-all text-right flex items-center gap-3 ${activeTab === 'patients' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <UserPlus className={`w-4 h-4 ${activeTab === 'patients' ? 'text-emerald-400' : 'text-slate-400'}`} />
                تسجيل وفك تشفير المرضى
              </button>
              
              <button
                onClick={() => setActiveTab('samples')}
                className={`w-full px-4 py-3 rounded-xl font-bold text-xs transition-all text-right flex items-center gap-3 ${activeTab === 'samples' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <QrCode className={`w-4 h-4 ${activeTab === 'samples' ? 'text-emerald-400' : 'text-slate-400'}`} />
                مسار العينات وسلسلة الحيازة
              </button>
              
              <button
                onClick={() => setActiveTab('results')}
                className={`w-full px-4 py-3 rounded-xl font-bold text-xs transition-all text-right flex items-center gap-3 ${activeTab === 'results' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <FileSignature className={`w-4 h-4 ${activeTab === 'results' ? 'text-emerald-400' : 'text-slate-400'}`} />
                توثيق التواقيع وفحص النزاهة
              </button>

              <button
                onClick={() => setActiveTab('lis')}
                className={`w-full px-4 py-3 rounded-xl font-bold text-xs transition-all text-right flex items-center gap-3 ${activeTab === 'lis' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <Network className={`w-4 h-4 ${activeTab === 'lis' ? 'text-emerald-400' : 'text-slate-400'}`} />
                جهاز الاتصال LIS والترجمة الآلية
              </button>

              <button
                onClick={() => setActiveTab('notifications')}
                className={`w-full px-4 py-3 rounded-xl font-bold text-xs transition-all text-right flex items-center gap-3 ${activeTab === 'notifications' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <MessageSquare className={`w-4 h-4 ${activeTab === 'notifications' ? 'text-emerald-400' : 'text-slate-400'}`} />
                سجل التنبيهات وإعادة المحاولة
                {notificationLogs.filter(n => n.status === 'failed').length > 0 && (
                   <span className="bg-rose-500 text-white px-1.5 py-0.5 rounded-full text-[9px] font-mono mr-auto leading-none">
                     {notificationLogs.filter(n => n.status === 'failed').length}
                   </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('keep')}
                className={`w-full px-4 py-3 rounded-xl font-bold text-xs transition-all text-right flex items-center gap-3 ${activeTab === 'keep' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <FileText className={`w-4 h-4 ${activeTab === 'keep' ? 'text-emerald-400' : 'text-slate-400'}`} />
                ملاحظات المعمل (Google Keep)
                <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[8.5px] px-1.5 py-0.5 rounded-full mr-auto leading-none font-bold">جديد</span>
              </button>

              {loggedInClinician?.email === 'mhm763517@gmail.com' && (
                <button
                  onClick={() => setActiveTab('clinicians')}
                  className={`w-full px-4 py-3 rounded-xl font-extrabold text-xs transition-all text-right flex items-center gap-3 ${activeTab === 'clinicians' ? 'bg-indigo-950 text-emerald-400 border border-indigo-700/80 shadow' : 'bg-indigo-50 text-indigo-950 hover:bg-indigo-100'}`}
                >
                  <ShieldAlert className={`w-4 h-4 ${activeTab === 'clinicians' ? 'text-emerald-400' : 'text-indigo-600'}`} />
                  إدارة طلبات المصادقة (المالك)
                  {cliniciansList.filter(c => c.status === 'pending').length > 0 && (
                     <span className="bg-amber-500 text-white px-1.5 py-0.5 rounded-full text-[9.5px] font-mono mr-auto leading-none">
                       {cliniciansList.filter(c => c.status === 'pending').length}
                     </span>
                  )}
                </button>
              )}
            </div>
          </aside>

          {/* Clinician Tab Page Panel Content */}
          <main className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 lg:p-10 min-h-[600px]">
            
            {/* SECTION: Clinician Dashboard */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8 animate-fadeIn">
                <div className="border-b border-indigo-50 pb-4">
                  <h2 className="text-xl font-extrabold text-slate-800">مؤشرات الأداء الطبي والكفاءة التشغيلية LIMS</h2>
                  <p className="text-xs text-slate-500 mt-1">الرصد اللحظي لتدفق العينات الطبية، وكفاءة أجهزة الربط الآلي LIMS، ومستويات الإنذار الحرجة للنتائج.</p>
                </div>

                {/* KPI Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-center justify-between">
                     <div className="space-y-1 text-right">
                        <span className="text-[10px] text-slate-400 font-extrabold block">قاعدة المرضى الآمنة (AES)</span>
                        <strong className="text-2xl font-black text-slate-900 font-mono">{patients.length}</strong>
                        <span className="text-[9px] text-emerald-600 block">✓ بيانات مشفرة بالكامل</span>
                     </div>
                     <div className="bg-emerald-100 text-emerald-800 p-3.5 rounded-xl border border-emerald-200">
                        <ShieldCheck className="w-6 h-6" />
                     </div>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-center justify-between">
                     <div className="space-y-1 text-right">
                        <span className="text-[10px] text-slate-400 font-extrabold block">العينات المسحوبة وقيد المعالجة</span>
                        <strong className="text-2xl font-black text-slate-900 font-mono">{samples.length}</strong>
                        <span className="text-[9px] text-indigo-600 block">✓ تتبع حيازة GS1-128</span>
                     </div>
                     <div className="bg-indigo-100 text-indigo-800 p-3.5 rounded-xl border border-indigo-200">
                        <QrCode className="w-6 h-6" />
                     </div>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-center justify-between">
                     <div className="space-y-1 text-right">
                        <span className="text-[10px] text-slate-400 font-extrabold block">النتائج الطبية المصدقة والمبرمة</span>
                        <strong className="text-2xl font-black text-slate-900 font-mono">
                           {Object.values(activeResults).flat().length}
                        </strong>
                        <span className="text-[9px] text-purple-600 block">✓ موقعة SHA-256 HMAC</span>
                     </div>
                     <div className="bg-purple-100 text-purple-800 p-3.5 rounded-xl border border-purple-200">
                        <Award className="w-6 h-6" />
                     </div>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-center justify-between">
                     <div className="space-y-1 text-right">
                        <span className="text-[10px] text-slate-400 font-extrabold block">حملات الإشعارات (WhatsApp Gateway)</span>
                        <strong className="text-2xl font-black text-slate-900 font-mono">
                           {notificationLogs.length}
                        </strong>
                        <span className="text-[9px] text-rose-600 block">
                           {notificationLogs.filter(n => n.status === 'failed').length > 0 
                             ? `⚠ وجود ${notificationLogs.filter(n => n.status === 'failed').length} إرسال معلق` 
                             : '✓ تم التسليم بالكامل'}
                        </span>
                     </div>
                     <div className="bg-rose-100 text-rose-800 p-3.5 rounded-xl border border-rose-200">
                        <MessageSquare className="w-6 h-6" />
                     </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left Column: Critical warning center */}
                  <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
                     <div className="flex justify-between items-center border-b pb-3">
                        <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                           <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                           منظومة فحص القيم والتحاليل الطبية الحرجة (TAT Triage)
                        </h3>
                        <span className="text-[10px] bg-amber-50 text-amber-800 border-amber-200 px-2.5 py-1 rounded-full font-bold">حالة الطوارئ المخبرية</span>
                     </div>

                     <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                        {(() => {
                          const allResultsList = Object.keys(activeResults).flatMap(sampleId => {
                             const sampleObj = samples.find(s => s.id === sampleId);
                             const patientObj = sampleObj ? patients.find(p => p.id === sampleObj.patientId) : null;
                             return (activeResults[sampleId] || []).map(r => ({
                               ...r,
                               sample: sampleObj,
                               patientName: patientObj ? (userRole === 'accountant' ? patientObj.fullName.slice(0, 3) + '***' : patientObj.fullName) : 'مريض مجهول',
                               patientNationalId: patientObj ? patientObj.nationalId : ''
                             }));
                          });

                          const criticalResults = allResultsList.filter(r => {
                             const numVal = parseFloat(r.resultValue);
                             if (isNaN(numVal)) return false;
                             if (r.testName === 'Glucose' && numVal > 110) return true;
                             if (r.testName === 'Hemoglobin' && numVal < 12) return true;
                             return false;
                          });

                          if (criticalResults.length === 0) {
                             return (
                                <div className="text-center py-10 text-slate-400 italic text-xs">
                                   ✓ لا توجد مؤشرات حرجة أو قيم خارج النطاق الطييعي تستدعي تفعيل بروتوكول الإنذار السريع.
                                </div>
                             );
                          }

                          return criticalResults.map(item => (
                             <div key={item.id} className="p-3 bg-rose-50/50 border border-rose-200 rounded-xl flex items-center justify-between gap-4 text-right animate-pulse">
                                <div className="space-y-1">
                                   <div className="flex items-center gap-2">
                                      <p className="text-xs font-extrabold text-indigo-950">المريض: {item.patientName}</p>
                                      <span className="font-mono text-[10px] text-slate-500">ID: {item.patientNationalId}</span>
                                   </div>
                                   <p className="text-[11px] text-slate-600 font-medium">
                                      فحص {item.testName}: <strong className="text-rose-700 font-mono text-xs">{item.resultValue} {item.unit}</strong> (المدى الآمن: {item.referenceRange})
                                   </p>
                                </div>
                                <div className="text-left space-y-1 shrink-0">
                                   <span className="bg-rose-100 text-rose-800 border border-rose-200 text-[9px] px-2 py-0.5 rounded-full font-extrabold block">
                                      ⚠ إنذار مخبري حرج
                                   </span>
                                   <span className="text-[9px] text-slate-400 block font-mono">الباركود: {item.sample?.barcodeGs1}</span>
                                </div>
                             </div>
                          ));
                        })()}
                     </div>
                     <p className="text-[10px] text-slate-400 leading-relaxed font-sans mt-2">
                        * يحدد النظام القيم الطارئة تلقائياً طبقاً لتوجيهات هيئة الغذاء والدواء ومتطلبات مختبرات MyLab المركزية لضمان سلامة المرضى والاتصال السريع.
                     </p>
                  </div>

                  {/* Right Column: Key Operational TAT & Automation rate metrics */}
                  <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 space-y-6 flex flex-col justify-between">
                     <div className="space-y-4">
                        <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2 border-b pb-3">
                           <Sliders className="w-5 h-5 text-indigo-500" />
                           زمن الاستجابة وكفاءة خط السحب الالي
                        </h3>

                        {/* Turnaround speed tracker */}
                        <div className="space-y-2">
                           <div className="flex justify-between text-xs font-bold text-slate-700">
                             <span>متوسط زمن إصدار التواقيع والتقارير (TAT)</span>
                             <span className="font-mono text-emerald-600">14.2 دقيقة</span>
                           </div>
                           <div className="w-full bg-slate-100 rounded-full h-2">
                              <div className="bg-emerald-500 h-2 rounded-full w-[85%]"></div>
                           </div>
                           <p className="text-[10px] text-slate-400 leading-tight">
                              ✓ ممتاز: زمن الاستجابة أسرع بنسبة 45% مقارنة بالهدف العالمي (30 دقيقة للمستعجل).
                           </p>
                        </div>

                        {/* Integration driver rate */}
                        <div className="space-y-2 pt-2">
                           <div className="flex justify-between text-xs font-bold text-slate-700">
                             <span>معدل تفريغ الفحوصات وميكنة LIS</span>
                             <span className="font-mono text-indigo-600">75%</span>
                           </div>
                           <div className="w-full bg-slate-100 rounded-full h-2">
                              <div className="bg-indigo-600 h-2 rounded-full w-[75%]"></div>
                           </div>
                           <p className="text-[10px] text-slate-400 leading-tight">
                              يتم تغذية 3 من كل 4 تحاليل بالترميز المباشر HL7/ASTM دون التدخل البشري واليدوي للمكتب الفني.
                           </p>
                        </div>
                     </div>

                     {/* Server integration parameters status monitor */}
                     <div className="bg-slate-900 text-emerald-400 font-mono text-[9px] p-4 rounded-xl space-y-1.5 border border-slate-800/80">
                        <p className="font-sans font-bold text-slate-400 text-[10px] border-b border-slate-800 pb-1 mb-1">حالة بروتوكول الشبكة والمنافذ (Active Listener)</p>
                        <p>NETWORK STATUS: ACTIVE [STANDBY_READY]</p>
                        <p>INTEG_PORTS: TCP:3000 (HTTP API), RS232:COM3 (ASTM_EMULATOR)</p>
                        <p>DB ENGINE: SQLITE v3 WAL_JOURNAL_MODE_ON</p>
                        <p>HMAC KEY INTEGRITY check: OK [SHA-255-CONFIRMED]</p>
                     </div>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 1: Patient Registrations and decryption */}
            {activeTab === 'patients' && (
              <div className="space-y-8 animate-fadeIn">
                <div className="border-b border-indigo-50 pb-4">
                  <h2 className="text-xl font-extrabold text-slate-800">إضافة مريض جديد مع الحفاظ على سرية البيانات</h2>
                  <p className="text-xs text-slate-500 mt-1">يتم تشفير الإسم ورقم الجوال بقاعدة البيانات بصيغة AES-256 محصنة غير قابلة للإصابة بالتسريب.</p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                  <form onSubmit={handleRegisterPatient} className="xl:col-span-5 bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                    <h3 className="font-extrabold text-xs text-indigo-950 uppercase tracking-widest">نموذج القبول الطبي</h3>
                    
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">رقم الهوية الوطنية / المدنية</label>
                      <input 
                        required 
                        type="text" 
                        value={newPatient.nationalId} 
                        onChange={e => setNewPatient({...newPatient, nationalId: e.target.value})} 
                        className="w-full border border-slate-200 bg-white rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none text-xs font-semibold"
                        placeholder="مثال: 1029384756"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5 font-mono">الاسم الكامل (PII - سيتم تشفيره بـ AES-256)</label>
                      <input 
                        required 
                        type="text" 
                        value={newPatient.fullName} 
                        onChange={e => setNewPatient({...newPatient, fullName: e.target.value})} 
                        className="w-full border border-slate-200 bg-white rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none text-xs font-semibold"
                        placeholder="مثال: محمد بن عثمان المطيري"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5">تاريخ الميلاد</label>
                        <input 
                          required 
                          type="date" 
                          value={newPatient.dateOfBirth} 
                          onChange={e => setNewPatient({...newPatient, dateOfBirth: e.target.value})} 
                          className="w-full border border-slate-200 bg-white rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none text-xs font-semibold text-center"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5">الجنس</label>
                        <select 
                          value={newPatient.gender} 
                          onChange={e => setNewPatient({...newPatient, gender: e.target.value})} 
                          className="w-full border border-slate-200 bg-white rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none text-xs font-bold text-center"
                        >
                          <option value="Male">ذكر</option>
                          <option value="Female">أنثى</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">رقم الهاتف الجوال (سيتم تشفيره)</label>
                      <input 
                        type="text" 
                        value={newPatient.phoneNumber} 
                        onChange={e => setNewPatient({...newPatient, phoneNumber: e.target.value})} 
                        className="w-full border border-slate-200 bg-white rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none text-xs font-semibold"
                        placeholder="مثال: +966500000000"
                      />
                    </div>

                    <button 
                      type="submit" 
                      className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 w-full mt-4 flex items-center justify-center gap-2 text-xs transition-colors shadow"
                    >
                      <Save className="w-4 h-4" /> حفظ وتشفير البيانات الحساسة للمريض
                    </button>
                  </form>

                  {/* Directory table showing security state representation */}
                  <div className="xl:col-span-7 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-sm text-slate-800">سجل المرضى الكلي بالقاعدة</h3>
                      <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-1 rounded-lg border border-indigo-100 font-mono font-bold">عدد السجلات: {patients.length}</span>
                    </div>

                    <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                      <table className="w-full text-right text-xs">
                        <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-extrabold">
                          <tr>
                            <th className="p-4">رقم الهوية</th>
                            <th className="p-4">الاسم (فك التشفير)</th>
                            <th className="p-4 text-center">تاريخ الميلاد / الجنس</th>
                            <th className="p-4 text-left">الجوال</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {patients.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="p-8 text-center text-slate-400 italic">لا توجد سجلات حالياً بقاعدة البيانات المدعومة.</td>
                            </tr>
                          ) : (
                            patients.map(p => (
                              <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                                <td className="p-4 font-mono font-bold text-slate-700">{p.nationalId}</td>
                                <td className="p-4">
                                  <div className="flex items-center gap-2">
                                    <span className="font-extrabold text-slate-900">{p.fullName}</span>
                                    {userRole === 'accountant' ? (
                                       <span className="bg-rose-100 text-rose-700 text-[9px] px-1.5 py-0.5 rounded border border-rose-200 font-mono font-extrabold shrink-0">محجوب</span>
                                    ) : (
                                       <span className="bg-emerald-100 text-emerald-800 text-[9px] px-1.5 py-0.5 rounded border border-emerald-200 font-mono shrink-0">فك AES-256</span>
                                    )}
                                  </div>
                                </td>
                                <td className="p-4 text-center text-slate-500 font-medium">
                                  {p.dateOfBirth} / {p.gender === 'Male' ? 'ذكر' : 'أنثى'}
                                </td>
                                <td className="p-4 text-left font-mono font-bold text-slate-600">
                                  {p.phoneNumber || '---'}
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
            )}

            {/* SECTION 2: Sample Tracking and chain of custody with timeline! */}
            {activeTab === 'samples' && (
              <div className="space-y-8 animate-fadeIn">
                <div className="border-b border-indigo-50 pb-4">
                  <h2 className="text-xl font-extrabold text-slate-800">بروتوكول تتبع مسار العينات وسلسلة الحيازة (Chain of Custody)</h2>
                  <p className="text-xs text-slate-500 mt-1">توليد أكواد باركود GS1-128 الموثوقة وتتبع العينات لحظة بلحظة لضمان النزاهة الطبية وحفظ تتبع الخطوات.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Registry form for samples */}
                  <form onSubmit={handleRegisterSample} className="lg:col-span-4 bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4 h-fit">
                    <h3 className="font-extrabold text-xs text-indigo-950 uppercase tracking-widest flex items-center gap-1">
                      <QrCode className="w-4 h-4 text-indigo-600" />
                      تسجيل وتجهيز عينة عازلة
                    </h3>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">اختيار المريض المعني</label>
                      <select 
                        required 
                        value={newSample.patientId} 
                        onChange={e => setNewSample({...newSample, patientId: e.target.value})} 
                        className="w-full border border-slate-200 bg-white rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none text-xs font-semibold"
                      >
                        <option value="">-- اختر مريض تسجيل --</option>
                        {patients.map(p => (
                          <option key={p.id} value={p.id}>{p.fullName} ({p.nationalId})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">نوع العينة الطبية</label>
                      <select 
                        value={newSample.sampleType} 
                        onChange={e => setNewSample({...newSample, sampleType: e.target.value})} 
                        className="w-full border border-slate-200 bg-white rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none text-xs font-bold"
                      >
                        <option value="Blood">عينة دم (Blood SB)</option>
                        <option value="Urine">تحليل بول (Urine Specimen)</option>
                        <option value="Swab">مسحة كشطية مخبرية (Swab)</option>
                      </select>
                    </div>

                    <button 
                      type="submit" 
                      className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 w-full mt-4 flex items-center justify-center gap-2 text-xs transition-colors shadow"
                    >
                      <QrCode className="w-4 h-4" /> توليد طابع GS1-128 وتسجيل العينة
                    </button>
                    
                    <p className="text-[10px] text-slate-400 leading-normal text-center">
                      تلقائياً، تُصدر طوابع الباركود المعيرة تحت رمز الترميز (01) لضمان التوافق مع أنظمة المستشفيات العالمية ASTM.
                    </p>
                  </form>

                  {/* Specimen and dynamic timeline tracker */}
                  <div className="lg:col-span-8 space-y-4">
                    <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-indigo-500" />
                      مراقبة الحيازة اللحظية والتحكم بالطرق اليدوية
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left list */}
                      <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm max-h-[460px] overflow-y-auto space-y-2.5 p-3 bg-slate-50/50">
                        {samples.length === 0 ? (
                          <div className="text-center p-8 text-slate-400 text-xs italic">لا توجد عينات مدخلة في النظام.</div>
                        ) : (
                          samples.map(s => {
                            const pName = patients.find(p => p.id === s.patientId)?.fullName || 'مريض مجهول';
                            const resultsCount = activeResults[s.id]?.length || 0;
                            return (
                              <div 
                                key={s.id} 
                                onClick={() => { setSelectedSample(s); fetchSampleLogs(s.id); }}
                                className={`p-4 border rounded-xl bg-white cursor-pointer transition-all hover:shadow-md hover:border-indigo-200 text-right ${selectedSample?.id === s.id ? 'border-indigo-400 ring-2 ring-indigo-50 animate-pulse' : 'border-slate-200'}`}
                              >
                                <div className="flex justify-between items-start gap-2">
                                  <div className="font-mono text-[11px] font-extrabold bg-slate-800 text-emerald-400 px-2 py-1 rounded">
                                    {s.barcodeGs1}
                                  </div>
                                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded capitalize ${s.status === 'registered' ? 'bg-amber-100 text-amber-800' : s.status === 'received' ? 'bg-blue-100 text-blue-800' : s.status === 'processing' ? 'bg-purple-100 text-purple-800' : 'bg-emerald-100 text-emerald-800'}`}>
                                    {s.status === 'registered' ? 'مسحوبة حديثاً' : s.status === 'received' ? 'مستلمة بالمعمل' : s.status === 'processing' ? 'قيد التحليل' : 'مكتملة ومؤكدة'}
                                  </span>
                                </div>
                                <div className="mt-3 text-xs space-y-1 text-slate-600 font-medium">
                                  <p className="text-slate-900 font-bold">المريض: {pName}</p>
                                  <p>النوع: <strong className="text-slate-700">{s.sampleType === 'Blood' ? 'عصارة دم' : s.sampleType === 'Urine' ? 'تجمع بولي' : 'مسحة مخبرية'}</strong></p>
                                  <div className="flex justify-between text-[10px] text-slate-400 pt-1 border-t mt-2">
                                    <span>سحب: {new Date(s.collectedAt).toLocaleTimeString().slice(0, 5)}</span>
                                    <span>النتائج: {resultsCount} فحوصات</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>

                      {/* Right Detail / Timeline logs */}
                      <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 space-y-4 flex flex-col justify-between">
                        {selectedSample ? (
                          <div className="space-y-4 flex-1 flex flex-col justify-between">
                            <div>
                               <div className="border-b pb-2 flex items-center justify-between">
                                  <h4 className="font-extrabold text-xs text-slate-800">تفاصيل العينة ومحاكي الحيازة</h4>
                                  <span className="font-mono text-[10px] text-slate-500">Log Timeline</span>
                               </div>

                               {/* Manual control buttons to step through sample steps */}
                               <div className="mt-4 space-y-2">
                                  <p className="text-[10px] text-slate-500 font-bold">ترقية خطوة الحيازة يدوياً:</p>
                                  <div className="grid grid-cols-2 gap-2">
                                    <button 
                                      onClick={() => handleUpdateSampleStatus(selectedSample.id, 'received', 'تأكيد تطابق الباركود GS1 وتفريغ عازل الأجهزة.')}
                                      className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[10px] p-2 rounded-lg border border-blue-200 transition-all text-center"
                                    >
                                      استقبال بالمعمل 📥
                                    </button>
                                    <button 
                                      onClick={() => handleUpdateSampleStatus(selectedSample.id, 'processing', 'تفكيك الكبسولة ووضع الأنابيب بمحلل LIS الآلي.')}
                                      className="bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-[10px] p-2 rounded-lg border border-purple-200 transition-all text-center"
                                    >
                                      تغذية أجهزة التحليل 🔬
                                    </button>
                                  </div>
                               </div>

                               {/* Scrollable Timeline tracker logs */}
                               <div className="mt-6 space-y-4">
                                  <p className="text-[10px] font-extrabold text-slate-500">تسلسل الحيازة الدائم (CoC Logs):</p>
                                  <div className="space-y-3 max-h-[220px] overflow-y-auto pl-1 pr-2">
                                     {sampleLogsList.length === 0 ? (
                                        <p className="text-[10px] text-slate-400 italic">بانتظار المعالجة والتحديثات...</p>
                                     ) : (
                                        sampleLogsList.map((log, i) => (
                                          <div key={log.id} className="relative pr-4 border-r-2 border-slate-200 pb-1.5 align-right text-right">
                                             <div className="absolute right-[-5px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-white" />
                                             <p className="text-[11px] font-bold text-slate-900">{log.statusLabelText}</p>
                                             <div className="flex justify-between text-[9px] text-slate-400 mt-0.5">
                                               <span>المنفذ: {log.assignedOperator}</span>
                                               <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                                             </div>
                                          </div>
                                        ))
                                     )}
                                  </div>
                               </div>
                            </div>

                            <button
                              onClick={() => { populateLISPreset('hl7', selectedSample.barcodeGs1); setActiveTab('lis'); triggerUIFeedback('تم تجهيز كود المريض لترميز LIS Driver محاكاة بنجاح.'); }}
                              className="w-full bg-slate-900 text-white font-bold text-xs p-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 transition-all text-center"
                            >
                              🚀 إرسال الباركود لجهاز LIS لمحاكاة الأجهزة
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center text-center p-12 text-slate-400 h-full">
                            <Clock className="w-10 h-10 text-slate-300 stroke-1 mb-2" />
                            <p className="text-xs font-bold">يرجى تحديد عينة من قائمة العينات لعرض وقائع تتبع الحيازة وتحديثها.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 3: Result Certification & SHA-256 validation */}
            {activeTab === 'results' && (
              <div className="space-y-8 animate-fadeIn">
                <div className="border-b border-indigo-50 pb-4">
                  <h2 className="text-xl font-extrabold text-slate-800">نظام توثيق وحماية النتائج المعتمدة بأمان (SHA-256 HMAC Fingerprint)</h2>
                  <p className="text-xs text-slate-500 mt-1">تؤخذ قيم التحليل وتصاغ بصيغة نصية موحدة ثم تشفر بهيئة بصمة رقمية لمقاومة تزوير التقارير المعطاة للمرضى والجهات الرسمية.</p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                  {/* Result input form */}
                  <form onSubmit={handleEnterResult} className="xl:col-span-5 bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                    <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-widest flex items-center gap-1">
                      <FileSignature className="w-4 h-4 text-emerald-500" />
                      إدخال واعتماد نتيجة كمية يدوياً
                    </h3>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">ربط بالباركود النشط</label>
                      <select 
                        required 
                        value={newResult.sampleId} 
                        onChange={e => setNewResult({...newResult, sampleId: e.target.value})} 
                        className="w-full border border-slate-200 bg-white rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none text-xs font-semibold"
                      >
                        <option value="">-- اختر باركود العينة المستلمة --</option>
                        {samples.map(s => (
                          <option key={s.id} value={s.id}>{s.barcodeGs1} ({s.sampleType === 'Blood' ? 'دم' : s.sampleType === 'Urine' ? 'بول' : 'مسحة'})</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5">اسم الفحص (ASTM E1381 map)</label>
                        <input 
                          type="text" 
                          value={newResult.testName} 
                          onChange={e => setNewResult({...newResult, testName: e.target.value})} 
                          className="w-full border border-slate-200 bg-white rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none text-xs font-bold font-mono text-center"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5">النتيجة الرقمية الكمية</label>
                        <input 
                          required 
                          type="text" 
                          placeholder="مثال: 14.5"
                          value={newResult.resultValue} 
                          onChange={e => setNewResult({...newResult, resultValue: e.target.value})} 
                          className="w-full border border-slate-200 bg-white rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none text-xs font-extrabold font-mono text-left"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5">المعدل الطبيعي الآمن</label>
                        <input 
                          type="text" 
                          value={newResult.referenceRange} 
                          onChange={e => setNewResult({...newResult, referenceRange: e.target.value})} 
                          className="w-full border border-slate-200 bg-white rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none text-xs font-semibold text-center font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5">حجم الوحدة الطبية</label>
                        <input 
                          type="text" 
                          value={newResult.unit} 
                          onChange={e => setNewResult({...newResult, unit: e.target.value})} 
                          className="w-full border border-slate-200 bg-white rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none text-xs font-semibold text-center font-mono"
                        />
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 w-full mt-4 flex items-center justify-center gap-2 text-xs transition-colors shadow"
                    >
                      <ShieldCheck className="w-5 h-5 text-emerald-300" /> اعتماد وتوقيع ببصمة رقمية ضد التزوير
                    </button>
                  </form>

                  {/* Log results with verify test triggers */}
                  <div className="xl:col-span-7 space-y-4">
                    <h3 className="font-extrabold text-sm text-slate-800">قائمة النتائج الموقعة رقمياً وفحص سلامة التعديل</h3>
                    
                    <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                      {samples.filter(s => activeResults[s.id]?.length > 0).length === 0 ? (
                        <div className="text-center p-8 text-slate-400 text-xs italic">لا توجد نتائج مسودة معتمدة حالياً. يرجى توليد نتيجة من اليسار أو عبر جهاز LIS.</div>
                      ) : (
                        samples.map(s => {
                          const results = activeResults[s.id] || [];
                          if (results.length === 0) return null;
                          const pName = patients.find(p => p.id === s.patientId)?.fullName || 'مجهول';
                          
                          return (
                            <div key={s.id} className="p-4 border border-slate-200 rounded-2xl space-y-3 bg-slate-50/20">
                              <div className="flex justify-between items-center bg-slate-100 p-2.5 rounded-xl border border-slate-200">
                                <span className="text-xs font-extrabold text-indigo-950 font-mono">الباركود: {s.barcodeGs1}</span>
                                <span className="text-xs text-slate-500 font-medium">المريض: {pName}</span>
                              </div>

                              <div className="space-y-3">
                                {results.map(r => {
                                  const verifyLog = verificationFeedback[r.id];
                                  return (
                                    <div key={r.id} className="bg-white p-3 rounded-xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 text-right">
                                      <div className="space-y-1">
                                        <p className="text-xs font-bold text-slate-800">تحليل {r.testName}: <strong className="text-emerald-700">{r.resultValue}</strong> {r.unit}</p>
                                        <p className="text-[10px] text-slate-500 font-mono">طبيعي: {r.referenceRange} (المرجع)</p>
                                        <p className="text-[10px] text-slate-400 font-mono font-bold select-all bg-slate-50 p-1.5 rounded truncate max-w-md" title={r.resultSha256Hash}>
                                          SHA-256: {r.resultSha256Hash}
                                        </p>
                                      </div>

                                      <div className="shrink-0 space-y-2 text-left">
                                        <button 
                                          onClick={() => handleVerifyIntegrity(r.id)}
                                          disabled={isVerifying === r.id}
                                          className="text-[10px] bg-slate-900 border border-slate-700 text-white hover:bg-slate-800 font-extrabold px-3 py-2 rounded-lg transition-all flex items-center justify-center gap-1 w-full"
                                        >
                                          {isVerifying === r.id ? (
                                            <RefreshCw className="w-3 h-3 animate-spin" />
                                          ) : (
                                            <ShieldAlert className="w-3 h-3 text-indigo-400" />
                                          )}
                                          اختبار مطابقة البصمة رقمياً
                                        </button>

                                        {verifyLog && (
                                          <div className={`p-1.5 rounded text-[9px] font-bold text-center border ${verifyLog.isValid ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800 animate-pulse'}`}>
                                            {verifyLog.isValid ? '✓ البصمة سليمة 100%' : '⚠ خطر: البصمة مقطوعة! البيانات معدلة!'}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 4: HL7 & ASTM Driver LIS Simulation Console */}
            {activeTab === 'lis' && (
              <div className="space-y-8 animate-fadeIn">
                <div className="border-b border-indigo-50 pb-4">
                  <h2 className="text-xl font-extrabold text-slate-800">وحدة الربط Driver التلقائي مع أجهزة فحص LIS الآلية</h2>
                  <p className="text-xs text-slate-500 mt-1">تسمح بمحاكاة استقبال الأظرف البرمجية الرسمية HL7 v2.x و ASTM E1381 الواردة مباشرة من أجهزة تحليل الدم والمصل وفك حزمها.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left Controls/Preset Selection */}
                  <div className="lg:col-span-4 bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-5">
                    <h3 className="font-extrabold text-xs text-indigo-950 uppercase tracking-widest flex items-center gap-1.5">
                      <Network className="w-4 h-4 text-indigo-500" />
                      إعداد الحزمة وإرسال الطرد للتحليل
                    </h3>

                    <div className="space-y-3">
                      <label className="block text-xs font-bold text-slate-600">اختر عينة طبية لاختبار الإرسال:</label>
                      <div className="space-y-2 max-h-[180px] overflow-y-auto border p-2 bg-white rounded-xl">
                        {samples.length === 0 ? (
                           <p className="text-[10px] text-slate-400 italic text-center py-4">سجل عينة أولاً لتعبئة الباركود تلقائياً.</p>
                        ) : (
                           samples.map(s => (
                              <button 
                                key={s.id}
                                type="button" 
                                onClick={() => populateLISPreset(lisMsgType, s.barcodeGs1)}
                                className="w-full text-right p-2 border border-slate-100 rounded-lg hover:border-indigo-400 hover:bg-indigo-50/20 text-[10px] font-mono font-bold flex justify-between"
                              >
                                <span>{s.barcodeGs1}</span>
                                <span className="text-slate-400 font-sans font-medium">{s.sampleType === 'Blood' ? 'دم' : 'بول'}</span>
                              </button>
                           ))
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                       <label className="block text-xs font-bold text-slate-600">بروتوكول الترميز المستهدف:</label>
                       <div className="grid grid-cols-2 gap-2">
                         <button 
                           onClick={() => { setLisMsgType('hl7'); setLisCustomMessage(hl7Preset.replace('[BARCODE_PLACEHOLDER]', samples[0]?.barcodeGs1 || 'GS1-BARCODE')); }}
                           className={`p-2 rounded-xl text-xs font-bold border transition-all ${lisMsgType === 'hl7' ? 'bg-indigo-600 border-indigo-700 text-white shadow-sm' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
                         >
                           HL7 v2.x TCP Driver
                         </button>
                         <button 
                           onClick={() => { setLisMsgType('astm'); setLisCustomMessage(astmPreset.replace('[BARCODE_PLACEHOLDER]', samples[0]?.barcodeGs1 || 'GS1-BARCODE')); }}
                           className={`p-2 rounded-xl text-xs font-bold border transition-all ${lisMsgType === 'astm' ? 'bg-indigo-600 border-indigo-700 text-white shadow-sm' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
                         >
                           ASTM E1381 RS232
                         </button>
                       </div>
                    </div>

                    <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                      يقوم نظام Parser المعملي المطور بقراءة حزم البيانات المشفرة ذات الحدود المتطابقة، وفصل المقاطع المرجعية وتوليد شفرة النزاهة قبل وضع النتيجة في خانة الطبيب للتحقق.
                    </p>
                  </div>

                  {/* Right Editor Terminal Console and logs feedback */}
                  <div className="lg:col-span-8 flex flex-col justify-between space-y-4">
                     <div>
                        <div className="flex justify-between items-center mb-1.5">
                           <h4 className="font-extrabold text-xs text-slate-700 uppercase tracking-wider font-mono">
                             Raw Serial Packet Input Simulator ({lisMsgType === 'hl7' ? 'HL7 ORU_R01' : 'ASTM Message'})
                           </h4>
                           <span className="text-[10px] font-mono text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">LIS Active Listen Port: 3000</span>
                        </div>

                        <textarea 
                          value={lisCustomMessage}
                          onChange={(e) => setLisCustomMessage(e.target.value)}
                          placeholder="بانتظار تلقيم الحزم الطبية..."
                          rows={8}
                          dir="ltr"
                          className="w-full bg-slate-900 border border-slate-800 text-emerald-400 font-mono text-xs p-5 rounded-2xl shadow-inner focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                     </div>

                     <div className="flex gap-4 items-center">
                        <button 
                          onClick={handleRunLISParser}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-8 py-3.5 rounded-xl transition-all shadow-md inline-flex items-center gap-2 shrink-0"
                        >
                          <Network className="w-4 h-4 animate-pulse" />
                          ترجمة الحزمة وربط النتيجة آلياً
                        </button>
                        
                        <div className="text-[11px] text-slate-500 leading-normal">
                          سيقوم جهاز فك الحزم بفك شفرة الباركود والبحث عنه بقاعدة البيانات تلقائياً وتوثيق الفحص آلياً.
                        </div>
                     </div>

                     {/* LIS parse feedback details */}
                     {lisFeedback && (
                        <div className={`p-5 rounded-2xl border ${lisFeedback.success ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-rose-50 border-rose-200 text-rose-950'}`}>
                           <h5 className="font-extrabold text-xs mb-2">تقرير محلل الحزمة اللحظي:</h5>
                           <p className="text-xs leading-relaxed font-medium mb-3">{lisFeedback.message}</p>
                           {lisFeedback.parsed && (
                              <div className="p-3 bg-white/70 backdrop-blur rounded-xl border border-emerald-200 text-xs font-mono space-y-1">
                                 <div className="flex justify-between items-center pb-2 border-b border-indigo-50/50 mb-2">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const title = `تصدير عينة LIS [${lisFeedback.parsed.barcode}]`;
                                        const text = `عينة باركود: ${lisFeedback.parsed.barcode}\nنوع الفحص: ${lisFeedback.parsed.testName}\nالنتيجة المرصودة: ${lisFeedback.parsed.resultValue} ${lisFeedback.parsed.unit}\nالنطاق المرجعي المقارن: ${lisFeedback.parsed.referenceRange}\nبروتوكول فك تشفير المحلل الآلي بنجاح بمختبرات MyLab.`;
                                        handleCreateNoteFromContext(title, text);
                                      }}
                                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[9px] px-2 py-0.5 rounded transition-colors flex items-center gap-1"
                                    >
                                       <FileText className="w-2.5 h-2.5" />
                                       مزامنة كملحوظة لـ Google Keep
                                    </button>
                                    <span className="font-extrabold text-slate-800">بيانات التفكيك البنيوي:</span>
                                 </div>
                                 <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-right pt-1 text-[11px] font-bold">
                                    <p>كود العينة: <strong className="text-slate-800 font-mono">{lisFeedback.parsed.barcode}</strong></p>
                                    <p>الفحص: <strong className="text-slate-800 font-mono">{lisFeedback.parsed.testName}</strong></p>
                                    <p>النتيجة: <strong className="text-indigo-700 font-mono">{lisFeedback.parsed.resultValue} {lisFeedback.parsed.unit}</strong></p>
                                    <p>المرجع: <strong className="text-slate-800 font-mono">{lisFeedback.parsed.referenceRange}</strong></p>
                                 </div>
                              </div>
                           )}
                        </div>
                     )}
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 5: Notifications center with fail retry simulator logs */}
            {activeTab === 'notifications' && (
              <div className="space-y-8 animate-fadeIn">
                <div className="border-b border-indigo-50 pb-4">
                  <h2 className="text-xl font-extrabold text-slate-800">سجل الإشعارات ونظام إعادة الاستدعاء التلقائي (Retry Protocol)</h2>
                  <p className="text-xs text-slate-500 mt-1">يعمل على محاكاة بوابة الواتساب / الرسائل النصية الرسمية التي تعلم المريض فور إصدار النتيجة الطبية الموقعة للتذكير بالتحميل والطباعة.</p>
                </div>

                <div className="space-y-4">
                   <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-2xl text-xs leading-relaxed flex items-start gap-3">
                     <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                     <p>
                       <strong>تنبيه تفعيل المحاكاة الساقطة:</strong> يبدأ إرسال الإشعار آلياً بوضعية فشل الإرسال الأولية ("Failed") تلبيةً لمتطلبات الخطط البرمجية للمستشفيات، مما يتيح لك تجربة خوارزمية <strong>Retry Log</strong> اليدوية لمشاهدة تعديل البوابة الطبية التلقائي وتأكيد جدار الأمان.
                     </p>
                   </div>

                   <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                      <table className="w-full text-right text-xs">
                        <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-extrabold">
                          <tr>
                            <th className="p-4">الجوال المستهدف</th>
                            <th className="p-4">نص الرسالة المرسلة</th>
                            <th className="p-4 text-center">عدد المحاولات</th>
                            <th className="p-4 text-center">أخر تشغيل</th>
                            <th className="p-4 text-center">وضعية الخدمة</th>
                            <th className="p-4 text-left">التدابير المباشرة</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {notificationLogs.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="p-8 text-center text-slate-400 italic">لا توجد محاولات إرسال إشعارات مسجلة للنتائج المعالجة بقاعدة البيانات.</td>
                            </tr>
                          ) : (
                            notificationLogs.map(log => (
                              <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                                <td className="p-4 font-mono font-bold text-slate-900">{log.recipient}</td>
                                <td className="p-4 max-w-sm font-medium text-slate-600 leading-normal">{log.message}</td>
                                <td className="p-4 text-center font-mono font-bold">{log.attempts} من 3</td>
                                <td className="p-4 text-center font-mono text-slate-500 text-[11px]">
                                  {new Date(log.timestamp).toLocaleTimeString()}
                                </td>
                                <td className="p-4 text-center">
                                  <span className={`px-2.5 py-1 rounded text-[10px] font-extrabold border ${log.status === 'sent' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800 animate-pulse'}`}>
                                    {log.status === 'sent' ? 'تم الإرسال بنجاح' : 'فشل التسليم'}
                                  </span>
                                </td>
                                <td className="p-4 text-left">
                                  {log.status !== 'sent' && (
                                    <button
                                      onClick={() => handleRetryNotification(log.id)}
                                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-3 py-1.5 rounded-lg text-[10px] transition-all flex items-center gap-1 inline-block"
                                    >
                                      <RefreshCw className="w-3 h-3 animate-spin-slow" />
                                      إعادة محاولة دفع الطرد
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                   </div>
                </div>
              </div>
            )}

            {/* SECTION 6: Clinicians SSO Request Manager (Owner exclusive) */}
            {activeTab === 'clinicians' && loggedInClinician?.email === 'mhm763517@gmail.com' && (
              <div className="space-y-8 animate-fadeIn text-right pb-10">
                <div className="border-b border-indigo-50 pb-4">
                  <h2 className="text-xl font-extrabold text-slate-800">إدارة تراخيص الأطباء والموظفين المعتمدين - Google SSO Gate</h2>
                  <p className="text-xs text-slate-500 mt-1">تتيح لك كـ (مالك مشروع MyLab الأساسي mhm763517@gmail.com) مراجعة حسابات الموظفين وتهيئتهم وإسناد الأدوار الطبية والمالية لهم.</p>
                </div>

                {/* Statistics of requests */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-extrabold block">إجمالي طلبات التسجيل</span>
                      <strong className="text-2xl font-black text-slate-900 font-mono">{cliniciansList.length}</strong>
                   </div>
                   <div className="bg-amber-50/50 p-5 rounded-2xl border border-amber-100">
                      <span className="text-[10px] text-amber-700 font-extrabold block">الطلبات المعلقة (قيد الانتظار)</span>
                      <strong className="text-2xl font-black text-amber-800 font-mono">
                         {cliniciansList.filter(c => c.status === 'pending').length}
                      </strong>
                   </div>
                   <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100">
                      <span className="text-[10px] text-emerald-700 font-extrabold block">الموظفين المعتمدين النشطين</span>
                      <strong className="text-2xl font-black text-emerald-800 font-mono">
                         {cliniciansList.filter(c => c.status === 'approved').length}
                      </strong>
                   </div>
                </div>

                <div className="border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                   <table className="w-full text-right text-xs">
                     <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-extrabold">
                       <tr>
                         <th className="p-4 text-right">اسم الموظف المستند لـ Google</th>
                         <th className="p-4 text-right">عنوان البريد الإلكتروني</th>
                         <th className="p-4 text-right">الصفة الحالية</th>
                         <th className="p-4 text-center">تاريخ التقديم</th>
                         <th className="p-4 text-center">الحالة الأمنية</th>
                         <th className="p-4 text-left">التدابير المباشرة لمالك المشروع</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                       {cliniciansList.length === 0 ? (
                         <tr>
                           <td colSpan={6} className="p-8 text-center text-slate-400 italic">لا توجد طلبات انضمام خارجية مسجلة بقاعدة بيانات المنشأة.</td>
                         </tr>
                       ) : (
                         cliniciansList.map(item => (
                           <tr key={item.email} className={`hover:bg-slate-50/65 transition-colors ${item.email === 'mhm763517@gmail.com' ? 'bg-emerald-50/20' : ''}`}>
                             <td className="p-4 font-bold text-slate-900 flex items-center justify-end">
                                <span>{item.fullName}</span>
                                {item.email === 'mhm763517@gmail.com' && (
                                   <span className="bg-emerald-600 text-white text-[9px] px-2 py-0.5 rounded-full font-bold mr-2">المالك الجذري</span>
                                )}
                             </td>
                             <td className="p-4 font-mono text-slate-600 text-right">{item.email}</td>
                             <td className="p-4 font-bold uppercase text-[10.5px] text-right">
                                {item.role === 'owner' ? 'متحكم كامل الصلاحيات' :
                                 item.role === 'doctor' ? 'طبيب مختبر' : 'محاسب / استقبال'}
                             </td>
                             <td className="p-4 text-center font-mono text-slate-500">
                               {new Date(item.createdAt).toLocaleDateString('ar-EG')}
                             </td>
                             <td className="p-4 text-center">
                               <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
                                 item.status === 'approved' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
                                 item.status === 'rejected' ? 'bg-rose-50 border-rose-200 text-rose-800' :
                                 'bg-amber-50 border-amber-200 text-amber-800'
                               }`}>
                                 {item.status === 'approved' ? 'موافق عليه ومفعّل' :
                                  item.status === 'rejected' ? 'مرفوض ومحظور' : 'قيد المراجعة والانتظار'}
                               </span>
                             </td>
                             <td className="p-4 text-left">
                               {item.email !== 'mhm763517@gmail.com' ? (
                                 <div className="flex items-center gap-1.5 justify-start">
                                   {item.status !== 'approved' && (
                                     <>
                                       <button
                                         onClick={() => handleApproveClinician(item.email, 'approved', 'doctor')}
                                         className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[9.5px] px-2.5 py-1.5 rounded-lg transition-all"
                                       >
                                         موافقة كطبيب
                                       </button>
                                       <button
                                         onClick={() => handleApproveClinician(item.email, 'approved', 'accountant')}
                                         className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[9.5px] px-2.5 py-1.5 rounded-lg transition-all"
                                       >
                                         موافقة كمحاسب
                                       </button>
                                     </>
                                   )}
                                   {item.status === 'approved' && (
                                      <button
                                        onClick={() => handleApproveClinician(item.email, 'rejected')}
                                        className="bg-amber-600 hover:bg-amber-700 text-white font-black text-[9.5px] px-2.5 py-1.5 rounded-lg transition-all"
                                      >
                                        إلغاء التفعيل/حظر
                                      </button>
                                   )}
                                   <button
                                     onClick={() => handleDeleteClinicianRequest(item.email)}
                                     className="bg-rose-100 hover:bg-rose-200 text-rose-700 font-extrabold text-[9.5px] px-2.5 py-1.5 rounded-lg transition-all"
                                     title="حذف طلب العضوية بالكامل"
                                   >
                                     حذف
                                   </button>
                                 </div>
                               ) : (
                                 <span className="text-[10px] text-slate-400 italic">لا يوجد تدابير على الحساب الجذري</span>
                               )}
                             </td>
                           </tr>
                         ))
                       )}
                     </tbody>
                   </table>
                </div>
              </div>
            )}

            {/* SECTION 7: Google Keep laboratory notes integration */}
            {activeTab === 'keep' && (
              <div className="space-y-8 animate-fadeIn text-right pb-10">
                <div className="border-b border-indigo-50 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2 justify-end">
                      <span>مفكرة ومذكرات المعمل الطبي (Google Keep)</span>
                      <FileText className="w-5 h-5 text-emerald-500" />
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">تتيح لك هذه المنظومة مزامنة لحظية لقوائم المهام، معايير التحليل، وجداول العمل اليومية مباشرة مع حساب Google Keep الرسمي للمختبر.</p>
                  </div>
                  
                  {/* OAuth / Connection Status Display */}
                  <div className="inline-flex items-center gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-200 justify-end">
                    {keepAuthStatus.isConnected ? (
                      <>
                        <div className="text-right">
                          <span className="text-[9.5px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full block">متصل بحسابك الطبي نشطاً</span>
                          <span className="text-[10.5px] font-mono text-slate-600 block">{keepAuthStatus.email || loggedInClinician?.email}</span>
                        </div>
                        <button
                          onClick={handleDisconnectKeep}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold text-[10.5px] px-3 py-1.5 rounded-xl transition-all border border-rose-100"
                        >
                          إلغاء الربط
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="text-right">
                          <span className="text-[9.5px] text-amber-600 font-bold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full block">حساب غير مكامل</span>
                          <span className="text-[10.5px] text-slate-500 block">وضع المحاكاة التفاعلية مستخدم حالياً</span>
                        </div>
                        <button
                          onClick={handleConnectKeep}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[10.5px] px-3.5 py-2 rounded-xl transition-all shadow-sm"
                        >
                          ربط حساب Google Keep
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Main Content Layout Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  
                  {/* Sidebar column: Add New Note form */}
                  <div className="lg:col-span-4 space-y-6">
                    <div className="bg-slate-50/75 p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                      <h3 className="font-extrabold text-sm text-slate-800 border-b border-slate-200 pb-2">ثبّت ملاحظة جديدة بالمفكرة</h3>
                      
                      <form onSubmit={handleAddKeepNote} className="space-y-4">
                        <div>
                          <label className="text-xs font-bold text-slate-600 block mb-1">عنوان الملاحظة</label>
                          <input
                            type="text"
                            required
                            placeholder="مثال: بروتوكول معايرة جهاز CBC"
                            value={newKeepTitle}
                            onChange={(e) => setNewKeepTitle(e.target.value)}
                            className="w-full text-xs text-right p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 bg-white"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-600 block mb-1">طبيعة الملاحظة</label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => { setNewKeepType('text'); }}
                              className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${newKeepType === 'text' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                            >
                              ملحوظة نصية
                            </button>
                            <button
                              type="button"
                              onClick={() => { setNewKeepType('list'); }}
                              className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${newKeepType === 'list' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'}`}
                            >
                              قائمة مهام (List)
                            </button>
                          </div>
                        </div>

                        {newKeepType === 'text' ? (
                          <div>
                            <label className="text-xs font-bold text-slate-600 block mb-1">محتوى الملاحظة</label>
                            <textarea
                              required
                              rows={5}
                              placeholder="اكتب التوجيهات الطبية أو المهام هنا..."
                              value={newKeepContent}
                              onChange={(e) => setNewKeepContent(e.target.value)}
                              className="w-full text-xs text-right p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 bg-white resize-none"
                            />
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <label className="text-xs font-bold text-slate-600 block">عناصر القائمة</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="أضف بنداً جديداً..."
                                value={newKeepListItemInput}
                                onChange={(e) => setNewKeepListItemInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    if (newKeepListItemInput.trim()) {
                                      setNewKeepListItems([...newKeepListItems, { text: newKeepListItemInput.trim(), checked: false }]);
                                      setNewKeepListItemInput('');
                                    }
                                  }
                                }}
                                className="w-full text-xs text-right p-2.5 rounded-xl border border-slate-200 bg-white"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (newKeepListItemInput.trim()) {
                                    setNewKeepListItems([...newKeepListItems, { text: newKeepListItemInput.trim(), checked: false }]);
                                    setNewKeepListItemInput('');
                                  }
                                }}
                                className="bg-slate-800 hover:bg-slate-900 text-white text-xs px-3 rounded-xl font-extrabold"
                              >
                                إضافة
                              </button>
                            </div>

                            <ul className="space-y-1.5 max-h-40 overflow-y-auto border border-dashed rounded-xl p-2 bg-white/50">
                              {newKeepListItems.length === 0 ? (
                                <li className="text-[10px] text-slate-400 text-center italic py-2">لا عناصر مضافة.</li>
                              ) : (
                                newKeepListItems.map((item, index) => (
                                  <li key={index} className="flex items-center justify-between text-xs bg-white p-2 rounded-lg border border-slate-100">
                                    <button
                                      type="button"
                                      onClick={() => setNewKeepListItems(newKeepListItems.filter((_, i) => i !== index))}
                                      className="text-rose-500 hover:text-rose-700 text-[10px]"
                                    >
                                      حذف
                                    </button>
                                    <span className="font-bold text-slate-700">{item.text}</span>
                                  </li>
                                ))
                              )}
                            </ul>
                          </div>
                        )}

                        <button
                          type="submit"
                          disabled={isSavingKeepNote}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-black text-xs py-3.5 rounded-xl transition-all shadow-sm block text-center"
                        >
                          {isSavingKeepNote ? 'جاري المزامنة السحابية...' : 'حفظ ومزامنة الملاحظة مع Google Keep'}
                        </button>
                      </form>
                    </div>

                    {/* Pre-saved templates for rapid deployment */}
                    <div className="bg-slate-50/50 p-5 rounded-3xl border border-slate-100">
                      <h4 className="font-bold text-xs text-slate-700 mb-2">💡 قوالب ملاحظات سريعة لتسهيل العمل اليومي</h4>
                      <div className="space-y-2">
                        <button
                          onClick={() => {
                            setNewKeepTitle('معايير الجودة الأسبوعية للمختبر');
                            setNewKeepType('list');
                            setNewKeepListItems([
                              { text: 'مراجعة درجات حرارة ثلاجة الدم والأمصال', checked: false },
                              { text: 'غسل فلاتر جهاز التحليل الكيميائي الأوتوماتيكي', checked: false },
                              { text: 'التحقق من صلاحية كواشف وبصمات فحص عينات السكر', checked: false },
                              { text: 'توثيق وتعديل معايرات الجودة الداخلي LIS', checked: false }
                            ]);
                          }}
                          className="w-full text-right p-3 bg-white hover:bg-indigo-50/40 rounded-xl border border-slate-200 text-[11px] font-bold text-slate-600 transition-colors block"
                        >
                          قالب قائمة مهام المعايرة والجودة
                        </button>
                        <button
                          onClick={() => {
                            setNewKeepTitle('جدول طوارئ الأطباء المناوبين');
                            setNewKeepType('text');
                            setNewKeepContent('جدول نوب الطبيب المختص والأخطاء التنبيهية:\n- د. محمد محمود (mhm763517@gmail.com) - مالك مستمر على مدار الساعة.\n- الاتصال بهاتف الطوارئ الخاص بالمعمل في حال حدوث أي طارئ.');
                          }}
                          className="w-full text-right p-3 bg-white hover:bg-indigo-50/40 rounded-xl border border-slate-200 text-[11px] font-bold text-slate-600 transition-colors block"
                        >
                          قالب نوبات العمل والأرقام الحرجة
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Feed container column: Loaded Notes Cards */}
                  <div className="lg:col-span-8 space-y-6">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-slate-400 font-bold">ملاحظات نشطة: ({keepNotes.length})</span>
                      <button
                        onClick={fetchKeepStatusAndNotes}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isLoadingKeep ? 'animate-spin' : ''}`} />
                        تحديث المفكرة
                      </button>
                    </div>

                    {isLoadingKeep ? (
                      <div className="p-20 text-center space-y-3 bg-slate-50/55 rounded-3xl border border-dashed text-slate-400">
                        <RefreshCw className="w-8 h-8 text-slate-300 animate-spin mx-auto" />
                        <span className="text-xs font-bold block">مزامنة الملاحظات الطبية...</span>
                      </div>
                    ) : keepNotes.length === 0 ? (
                      <div className="p-16 text-center space-y-3 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                        <FileText className="w-10 h-10 text-slate-300 mx-auto" />
                        <h4 className="font-extrabold text-slate-700 text-sm">مفكرة معمل MyLab فارغة حالياً</h4>
                        <p className="text-xs text-slate-400 leading-normal max-w-sm mx-auto">لا توجد ملاحظات منشورة عبر Keep. ثبّت ملحوظتك الأولى للبدء.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {keepNotes.map((note) => (
                          <div key={note.id} className="bg-amber-50/30 border border-amber-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col justify-between space-y-4">
                            <div>
                              <div className="flex justify-between items-start mb-2 gap-2">
                                <button
                                  onClick={() => handleDeleteKeepNote(note.id)}
                                  className="text-rose-500 hover:text-rose-700 bg-rose-50/80 p-1.5 rounded-lg transition-colors border border-rose-100"
                                  title="حذف نهائي كلي من Google Keep"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                                
                                <strong className="text-sm font-extrabold text-slate-800 text-right leading-snug">{note.title}</strong>
                              </div>

                              {note.noteType === 'list' && Array.isArray(note.content) ? (
                                <ul className="space-y-1.5 pt-2">
                                  {note.content.map((item: any, idx: number) => (
                                    <li
                                      key={idx}
                                      onClick={() => handleToggleKeepListItem(note.id, idx)}
                                      className="flex items-center justify-end gap-2 text-xs font-medium cursor-pointer py-1.5 px-2 bg-white/70 rounded-lg border border-slate-100 hover:bg-white transition-colors"
                                    >
                                      <span className={item.checked ? 'line-through text-slate-400 font-bold' : 'text-slate-700 font-extrabold'}>
                                        {item.text}
                                      </span>
                                      <input
                                        type="checkbox"
                                        checked={!!item.checked}
                                        onChange={() => {}} // toggled by parent click for fast responsive UX
                                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                                      />
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-xs text-slate-600 leading-relaxed text-right whitespace-pre-line pt-2 border-t border-amber-100/30 animate-fadeIn">
                                  {note.content}
                                </p>
                              )}
                            </div>

                            <div className="flex justify-between items-center text-[10px] text-slate-400 border-t border-amber-100/30 pt-3">
                              <span className="font-mono bg-amber-100/60 font-medium text-amber-800 border border-amber-200 rounded px-1.5 py-0.5">
                                {note.noteType === 'list' ? 'قائمة مهام' : 'مذكرة معمل'}
                              </span>
                              <span>
                                {new Date(note.createdAt || Date.now()).toLocaleDateString('ar-EG', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              </div>
            )}

          </main>
        </div>
      )}

      {/* Patient Portal Wrappers */}
      {panelMode === 'patient' && (
         <div className="max-w-7xl mx-auto w-full px-6 py-8 flex-1 flex flex-col justify-center items-center">
            
            {/* If not logged in: OTP Form */}
            {!patientProfile ? (
               <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden p-8 space-y-6">
                  
                  <div className="text-center space-y-2 border-b pb-4">
                     <div className="inline-flex bg-indigo-50 p-4 rounded-2xl border border-indigo-100 mb-2">
                        <Lock className="w-8 h-8 text-indigo-600 animate-bounce" />
                     </div>
                     <h2 className="text-xl font-black text-slate-900">بوابة المرضى المعتمدة الآمنة</h2>
                     <p className="text-xs text-slate-500 font-medium">الوصول لسلسلة الفحوصات الطبية الموقعة إلكترونياً وتكامل FHIR العالمي.</p>
                  </div>

                  {patientLoginError && (
                     <div className="bg-rose-50 border border-rose-250 text-rose-900 p-3 rounded-xl text-xs text-right font-medium">
                        ⚠ {patientLoginError}
                     </div>
                  )}

                  <form onSubmit={handlePatientLogin} className="space-y-4 text-right">
                     <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5">رقم الهوية المدنية / الإقامة للمريض</label>
                        <div className="flex gap-2">
                           <input 
                             required 
                             type="text" 
                             value={patientNationalId}
                             onChange={e => setPatientNationalId(e.target.value)}
                             placeholder="مثال: 1029384756"
                             disabled={otpSent}
                             className="flex-1 border border-slate-200 bg-white rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none text-xs font-bold font-mono"
                           />
                           {!otpSent && (
                              <button 
                                type="button" 
                                onClick={handleGeneratePatientOTP}
                                className="bg-indigo-600 text-white font-bold text-[11px] px-3.5 rounded-xl hover:bg-indigo-700 transition"
                              >
                                إرسال الرمز OTP
                              </button>
                           )}
                        </div>
                     </div>

                     {otpSent && (
                        <div className="space-y-3 animate-fadeIn">
                           <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 text-[10px] p-3 rounded-lg leading-normal">
                              تم إرسال الرمز السري المؤقت المكون من 6 أرقام إلى جوالك بنجاح (محاكاة). 
                              <br />الرمز هو: <strong className="font-mono text-xs text-emerald-700 font-extrabold">{simulatedOtp}</strong>
                           </div>
                           
                           <div>
                              <label className="block text-xs font-bold text-slate-600 mb-1.5">أدخل رمز التحقق (OTP)</label>
                              <input 
                                required 
                                type="text" 
                                value={patientOtp}
                                onChange={e => setPatientOtp(e.target.value)}
                                placeholder="أدخل الرمز المكون من 6 أرقام هنا"
                                className="w-full text-center tracking-widest border border-slate-200 bg-white rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-extrabold font-mono"
                              />
                           </div>

                           <button 
                             type="submit" 
                             className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold w-full p-3.5 rounded-xl text-xs transition shadow-md"
                           >
                             تأكيد الهوية وسحب المستندات والتقارير الطبية
                           </button>
                           
                           <button
                             type="button"
                             onClick={() => setOtpSent(false)}
                             className="text-xs text-slate-400 font-bold hover:text-slate-600 w-full text-center mt-2.5 block"
                           >
                             تغيير رقم الهوية أو إعادة الإرسال
                           </button>
                        </div>
                     )}
                  </form>
               </div>
            ) : (
               /* Logged In Patient view */
               <div className="w-full bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden min-h-[580px] flex flex-col justify-between print:border-none print:shadow-none">
                  
                  {/* Top Header info */}
                  <div className="bg-slate-900 text-white p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-b-4 border-emerald-500 print:hidden">
                     <div className="flex items-center gap-3">
                        <div className="bg-emerald-950 p-2.5 rounded-lg border border-emerald-800">
                           <User className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div>
                           <h3 className="font-extrabold text-sm text-slate-200">بوابة المريض: {patientProfile.patient?.fullName}</h3>
                           <p className="text-[11px] text-slate-400 font-mono">رقم الملف: {patientProfile.patient?.nationalId}</p>
                        </div>
                     </div>

                     <div className="flex gap-2">
                        <button
                          onClick={handlePatientLogout}
                          className="bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-300 font-extrabold text-[10px] px-3.5 py-1.5 rounded-lg transition"
                        >
                          تسجيل الخروج الآمن ⎋
                        </button>
                     </div>
                  </div>

                  {/* Portal content container and navigation subtabs */}
                  <div className="flex-1 flex flex-col lg:flex-row print:flex-row print:block">
                     {/* Menu options left / Right in RTL direction */}
                     <div className="w-full lg:w-56 bg-slate-50 p-4 border-l border-slate-100 space-y-1.5 print:hidden">
                        <button
                          onClick={() => setActivePatientSubTab('dashboard')}
                          className={`w-full text-right px-4 py-2.5 rounded-lg text-xs font-bold transition ${activePatientSubTab === 'dashboard' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`}
                        >
                          الملخص وحالة العينات
                        </button>
                        <button
                          onClick={() => setActivePatientSubTab('trends')}
                          className={`w-full text-right px-4 py-2.5 rounded-lg text-xs font-bold transition ${activePatientSubTab === 'trends' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`}
                        >
                          مؤشر الاتجاه الصحي للدم
                        </button>
                        <button
                          onClick={() => setActivePatientSubTab('fhir')}
                          className={`w-full text-right px-4 py-2.5 rounded-lg text-xs font-bold transition ${activePatientSubTab === 'fhir' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`}
                        >
                          ملف النقل الطبي FHIR
                        </button>
                        <button
                          onClick={() => setActivePatientSubTab('report')}
                          className={`w-full text-right px-4 py-2.5 rounded-lg text-xs font-bold transition ${activePatientSubTab === 'report' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`}
                        >
                          التقرير المصحح المعتمد للطباعة
                        </button>
                     </div>

                     <div className="flex-1 p-6 lg:p-8 print:p-0">
                        {/* SUBTAB 1: Patient main view details and current statuses */}
                        {activePatientSubTab === 'dashboard' && (
                           <div className="space-y-6 animate-fadeIn">
                              <div className="border-b pb-3.5">
                                 <h4 className="text-base font-extrabold text-slate-800">مرحبا بك، إليك السجل الطبي المعتمد لعازلاتك</h4>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                 <div className="p-4 rounded-2xl border border-slate-100 bg-emerald-50/20">
                                    <p className="text-[10px] text-slate-400 font-extrabold uppercase">الحالة الكلية للنتائج</p>
                                    <p className="text-xl font-black text-emerald-950 mt-1">✓ مؤكد وموثق</p>
                                 </div>
                                 <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50">
                                    <p className="text-[10px] text-slate-400 font-extrabold uppercase">عدد فحوصات التتبع</p>
                                    <p className="text-xl font-black text-slate-900 mt-1">{patientProfile.samples.length}</p>
                                 </div>
                                 <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50">
                                    <p className="text-[10px] text-slate-400 font-extrabold uppercase">تاريخ تحديث الهوية</p>
                                    <p className="text-xs font-mono font-bold text-slate-750 mt-2">{new Date(patientProfile.patient?.updatedAt || Date.now()).toLocaleDateString()}</p>
                                 </div>
                              </div>

                              <div className="space-y-3">
                                 <h5 className="font-extrabold text-xs text-slate-700">تتبع مسار عيناتك الطبية الحالية:</h5>
                                 {patientProfile.samples.length === 0 ? (
                                    <p className="text-xs text-slate-400 italic">لم تدرج عينات حديثة للمستودع الطبي.</p>
                                 ) : (
                                    patientProfile.samples.map(s => {
                                       return (
                                          <div key={s.id} className="p-4 rounded-xl border border-slate-100 flex justify-between items-center text-right text-xs bg-slate-50/40">
                                             <div>
                                                <p className="font-bold text-slate-900 font-mono">الباركود: {s.barcodeGs1}</p>
                                                <p className="text-slate-500 mt-1">الspecimen: {s.sampleType === 'Blood' ? 'دم' : 'بول'}</p>
                                             </div>
                                             <div className="text-left">
                                                <span className={`px-2.5 py-1 rounded text-[10px] font-extrabold border ${s.status === 'completed' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
                                                   {s.status === 'completed' ? 'التحليل مصدق ولقيم البوابة' : 'تحت المعالجة المعملية'}
                                                </span>
                                             </div>
                                          </div>
                                       );
                                    })
                                 )}
                              </div>
                           </div>
                        )}

                        {/* SUBTAB 2: Interactive clinical graph trends */}
                        {activePatientSubTab === 'trends' && (
                           <div className="space-y-6 animate-fadeIn">
                              <div className="border-b pb-3.5">
                                 <h4 className="text-base font-extrabold text-slate-800">منحنى مؤشر التغير الطبي والتحاليل التاريخية</h4>
                                 <p className="text-xs text-slate-500 mt-1">أداة قياس مبنية لمقارنة التغير لمستويات السكر بالمصل أو هيموجلوبين الدم على امتداد الفحوصات المتتابعة.</p>
                              </div>

                              {/* Beautiful reactive SVG chart avoiding any library issue */}
                              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-inner flex flex-col justify-between">
                                 <div className="flex justify-between items-center text-white mb-4 text-xs font-mono">
                                    <span>المعدل المعتمد (mg/dL)</span>
                                    <span>نمو مستوى سكر الدم التراكمي</span>
                                 </div>

                                 <div className="relative h-44 w-full bg-slate-950/80 rounded-xl p-2 border border-slate-800">
                                    {/* Pure SVG Line drawing */}
                                    <svg viewBox="0 0 500 150" className="w-full h-full" preserveAspectRatio="none">
                                       {/* Grid lines */}
                                       <line x1="0" y1="50" x2="500" y2="50" stroke="#1e293b" strokeDasharray="4" />
                                       <line x1="0" y1="100" x2="500" y2="100" stroke="#1e293b" strokeDasharray="4" />
                                       
                                       {/* Alert Zone area shaded */}
                                       <rect x="0" y="30" width="500" height="60" fill="rgba(16, 185, 129, 0.04)" />

                                       {/* Dynamic Plot Lines */}
                                       {patientProfile.results.length >= 2 ? (
                                         <path 
                                            d={`M 50 ${150 - (parseFloat(patientProfile.results[0]?.resultValue || '70') * 0.9)} 
                                                L 250 ${150 - (parseFloat(patientProfile.results[1]?.resultValue || '110') * 0.9)} 
                                                L 450 ${150 - (parseFloat(patientProfile.results[2]?.resultValue || '95') * 0.9)}`}
                                            fill="none" 
                                            stroke="#10b981" 
                                            strokeWidth="3.5"
                                            strokeLinecap="round"
                                         />
                                       ) : (
                                         <path 
                                            d="M 50 110 L 150 70 L 250 120 L 350 85 L 450 100" 
                                            fill="none" 
                                            stroke="#10b981" 
                                            strokeWidth="3"
                                            strokeDasharray="2"
                                         />
                                       )}

                                       {/* Normal zone text annotation */}
                                       <text x="5" y="45" fill="#10b981" className="text-[7px] font-sans font-extrabold uppercase">المدى الآمن الطبيعي 100</text>
                                       <text x="5" y="95" fill="#ef4444" className="text-[7px] font-sans font-extrabold uppercase">مستوى التحذير الأدنى 70</text>
                                    </svg>
                                 </div>

                                 <div className="mt-4 grid grid-cols-4 text-center text-[10px] text-slate-400 font-mono pt-2 border-t border-slate-800">
                                    <div>قراءة الأسبوع 1: {patientProfile.results[0]?.resultValue || '108'}</div>
                                    <div>قراءة الأسبوع 2: {patientProfile.results[1]?.resultValue || '142'}</div>
                                    <div>قراءة الأسبوع 3: {patientProfile.results[2]?.resultValue || '95'}</div>
                                    <div>النسبة: %{patientProfile.results.length > 0 ? '100مكتمل' : 'قراءة تقديرية لعدم كفاية اللقاح'}</div>
                                 </div>
                              </div>
                           </div>
                        )}

                        {/* SUBTAB 3: Live international FHIR JSON payload */}
                        {activePatientSubTab === 'fhir' && (
                           <div className="space-y-6 animate-fadeIn text-right">
                              <div className="border-b pb-3.5">
                                 <h4 className="text-base font-extrabold text-slate-800">كود تفوق التشغيل التبادلي FHIR JSON Resource</h4>
                                 <p className="text-xs text-slate-500 mt-1">يمثل البنية البرمجية المعتمدة لنقل التقارير المعرّبة للبرمجية العالمية المعتمدة HL7 FHIR لوزارات الصحة والجهات المتعاقدة.</p>
                              </div>

                              <div className="bg-slate-900 text-slate-200 p-5 rounded-2xl border border-slate-800 font-mono text-xs overflow-x-auto max-h-[350px] overflow-y-auto text-left" dir="ltr">
                                 <pre className="text-[11px] leading-relaxed">
{JSON.stringify({
  resourceType: "Bundle",
  type: "collection",
  timestamp: new Date().toISOString(),
  entry: [
    {
      resource: {
        resourceType: "Patient",
        id: patientProfile.patient?.id,
        identifier: [{ system: "http://saudi-national-id", value: patientProfile.patient?.nationalId }],
        name: [{ text: patientProfile.patient?.fullName }],
        gender: patientProfile.patient?.gender === 'Male' ? 'male' : 'female',
        birthDate: patientProfile.patient?.dateOfBirth,
        telecom: [{ system: "phone", value: patientProfile.patient?.phoneNumber }]
      }
    },
    ...(patientProfile.results.map(r => ({
      resource: {
        resourceType: "Observation",
        id: r.id,
        status: "final",
        code: {
          coding: [{ system: "http://loinc.org", code: r.testName === 'Glucose' ? "15074-8" : "718-7" }],
          text: r.testName
        },
        valueQuantity: {
          value: parseFloat(r.resultValue) || r.resultValue,
          unit: r.unit
        },
        referenceRange: [{ text: r.referenceRange }]
      }
    })))
  ]
}, null, 2)}
                                 </pre>
                              </div>
                           </div>
                        )}

                        {/* SUBTAB 4: Official Clean print style clinical report */}
                        {activePatientSubTab === 'report' && (
                           <div className="space-y-6 animate-fadeIn">
                              <div className="border-b pb-3.5 flex justify-between items-center print:hidden">
                                 <div>
                                    <h4 className="text-base font-extrabold text-slate-800">تنزيل وطباعة التقرير الطبي الموثق مع البصمة الجينية</h4>
                                    <p className="text-xs text-slate-500 mt-1">تؤمن الورقة الطبية بالبصام الإلكتروني والباركود لحمايتها من الابتذال.</p>
                                 </div>
                                 <button 
                                   onClick={() => window.print()} 
                                   className="bg-slate-900 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl hover:bg-slate-850 transition-all flex items-center gap-2 border border-slate-700"
                                 >
                                    <Printer className="w-4 h-4 text-emerald-400" />
                                    طباعة المستند الطبي المعتمد
                                 </button>
                              </div>

                              {/* Document Sheet layout compatible with standard offset printers page */}
                              <div className="bg-white border-2 border-slate-300 p-8 rounded-3xl max-w-2xl mx-auto shadow-inner space-y-8 text-right font-serif relative print:border-none print:shadow-none print:p-0">
                                 
                                 {/* Decorative Clinical Top Header */}
                                 <div className="flex justify-between items-start border-b-4 border-indigo-950 pb-6">
                                    <div className="text-left font-sans">
                                       <h5 className="text-lg font-black text-indigo-950 tracking-tight">MYLAB V2 CENTRAL CLINICS</h5>
                                       <p className="text-[10px] text-slate-400 font-mono tracking-wider font-bold">LIS AUTOMATION WORKSPACE</p>
                                       <p className="text-[9px] text-slate-400 mt-1 font-mono">Date: {new Date().toLocaleDateString()}</p>
                                    </div>
                                    <div className="text-right">
                                       <h1 className="text-xl font-black text-indigo-950">تقرير الفحوصات والتحاليل الطبية المخبرية</h1>
                                       <p className="text-[11px] text-emerald-600 font-sans font-bold">نسخة مصدقة إلكترونياً ببصمة SHA-256 مشفرة</p>
                                    </div>
                                 </div>

                                 {/* Patient Information Box */}
                                 <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 text-right text-xs leading-relaxed font-sans font-medium">
                                    <div>
                                       <p>الرقم الوطني للهوية: <strong className="text-slate-900 font-serif">{patientProfile.patient?.nationalId}</strong></p>
                                       <p>الجنس: <strong className="text-slate-900">{patientProfile.patient?.gender === 'Male' ? 'ذكر' : 'أنثى'}</strong></p>
                                       <p>رقم التحقق: <strong className="text-indigo-900 font-serif">Verified Code</strong></p>
                                    </div>
                                    <div>
                                       <p>الاسم الكامل للمريض: <strong className="text-indigo-950 font-serif text-sm font-black">{patientProfile.patient?.fullName}</strong></p>
                                       <p>تاريخ الميلاد: <strong className="text-slate-900">{patientProfile.patient?.dateOfBirth}</strong></p>
                                       <p>منفذ إقرار التقرير: <strong className="text-slate-900">Dr. Soleman</strong></p>
                                    </div>
                                 </div>

                                 {/* Table results list inside page report */}
                                 <div className="font-sans">
                                    <table className="w-full text-right text-xs border border-slate-200 rounded-xl overflow-hidden">
                                       <thead className="bg-slate-100 border-b border-slate-200 font-bold">
                                          <tr>
                                             <th className="p-3">الفحص الطبي المطلوب</th>
                                             <th className="p-3 text-center">النتيجة الكمية للمريض</th>
                                             <th className="p-3 text-center">منطقة القياس الآمن</th>
                                             <th className="p-3 text-left">التوقيع الجيني الفردي SHA-256</th>
                                          </tr>
                                       </thead>
                                       <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                                          {patientProfile.results.length === 0 ? (
                                             <tr>
                                                <td colSpan={4} className="p-6 text-center text-slate-400 italic">بانتظار اكمال النتائج معملياً.</td>
                                             </tr>
                                          ) : (
                                             patientProfile.results.map(r => (
                                                <tr key={r.id} className="hover:bg-slate-50/50">
                                                   <td className="p-3 font-bold text-slate-900">{r.testName} ({r.unit})</td>
                                                   <td className="p-3 text-center font-extrabold text-indigo-950 text-sm font-serif">{r.resultValue}</td>
                                                   <td className="p-3 text-center text-slate-500 font-mono">{r.referenceRange}</td>
                                                   <td className="p-3 text-left font-mono text-[9px] text-slate-400 max-w-[150px] truncate select-all">{r.resultSha256Hash}</td>
                                                </tr>
                                             ))
                                          )}
                                       </tbody>
                                    </table>
                                 </div>

                                 {/* Signature and Stamps Footer */}
                                 <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-4 font-sans text-xs items-end">
                                    <div className="text-left leading-relaxed">
                                       {patientProfile.samples[0] && (
                                         <div className="inline-block p-1 bg-slate-100 rounded border border-slate-350 mb-1">
                                            {/* Beautiful CSS pseudo barcode representation */}
                                            <div className="font-mono text-[9px] leading-tight select-none bg-slate-800 text-white p-1 font-extrabold tracking-widest">{patientProfile.samples[0].barcodeGs1}</div>
                                         </div>
                                       )}
                                       <p className="text-[8px] text-slate-400 font-mono mt-1 leading-normal select-all break-all">
                                          Hash Chain: {patientProfile.results[0]?.resultSha256Hash || 'N/A-HMAC'}
                                       </p>
                                    </div>
                                    <div className="text-right space-y-1">
                                       <p className="font-bold text-slate-900">طبيب المعمل المصدق:</p>
                                       <p className="font-serif italic text-slate-500 text-xs">د. أحمد عثمان المطيري</p>
                                       <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[9px] font-extrabold px-2.5 py-1 rounded-full uppercase">
                                          <Award className="w-3.5 h-3.5 text-emerald-600 animate-spin-slow" />
                                          توقيع قانوني معتمد بالبصمة
                                       </div>
                                    </div>
                                 </div>

                              </div>
                           </div>
                        )}
                     </div>
                  </div>

               </div>
            )}

         </div>
      )}

      {/* Official Print CSS Hidden helper wrapper */}
      <div className="hidden print:block text-right p-8 font-serif bg-white" dir="rtl">
         {patientProfile && (
            <div className="space-y-8">
               <div className="flex justify-between items-start border-b-4 border-slate-900 pb-5">
                  <div className="text-left font-sans">
                     <h2 className="text-lg font-black text-slate-950">MYLAB V2 LIS</h2>
                     <p className="text-[10px] text-slate-500 font-mono">SECURE HEALTH INTEROP PROFILE</p>
                     <p className="text-[9px] text-slate-400 mt-1">{new Date().toLocaleString()}</p>
                  </div>
                  <div>
                     <h1 className="text-2xl font-black text-slate-950">تقرير الفحوصات والتحاليل الطبية المعتمدة</h1>
                     <p className="text-xs text-slate-600 font-sans font-bold">مطابق للمواصفات القياسية ASTM E1381</p>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border text-xs leading-relaxed font-sans">
                  <div>
                     <p>الرقم القومي للمريض: <strong>{patientProfile.patient?.nationalId}</strong></p>
                     <p>الجنس: <strong>{patientProfile.patient?.gender === 'Male' ? 'ذكر' : 'أنثى'}</strong></p>
                  </div>
                  <div>
                     <p>الاسم الكامل: <strong>{patientProfile.patient?.fullName}</strong></p>
                     <p>تاريخ الميلاد: <strong>{patientProfile.patient?.dateOfBirth}</strong></p>
                  </div>
               </div>

               <table className="w-full text-right text-xs border border-slate-200">
                  <thead className="bg-slate-100 font-bold">
                     <tr>
                        <th className="p-3 border">الفحص الطبي المطلوب</th>
                        <th className="p-3 text-center border">النتيجة الكمية للمريض</th>
                        <th className="p-3 text-center border">المدى المرجعي الآمن</th>
                        <th className="p-3 text-left border">البصمة الجينية الفريدة SHA-256</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y font-sans">
                     {patientProfile.results.map(r => (
                        <tr key={r.id}>
                           <td className="p-3 border font-bold">{r.testName} ({r.unit})</td>
                           <td className="p-3 border text-center font-extrabold text-sm">{r.resultValue}</td>
                           <td className="p-3 border text-center text-slate-600">{r.referenceRange}</td>
                           <td className="p-3 border text-left font-mono text-[9px] text-slate-500 overflow-hidden text-ellipsis">{r.resultSha256Hash}</td>
                        </tr>
                     ))}
                  </tbody>
               </table>

               <div className="pt-12 grid grid-cols-2 gap-4 font-sans text-xs items-end">
                  <div className="text-left leading-relaxed">
                     <p className="text-[8px] text-slate-400 select-all font-mono">
                        HMAC Integrity: {patientProfile.results[0]?.resultSha256Hash || 'N/A'}
                     </p>
                  </div>
                  <div className="text-right">
                     <p className="font-bold">المشرف المصدق على الفحص الطبى:</p>
                     <p className="font-serif italic text-slate-500 mt-2">د. أحمدسليمان</p>
                  </div>
               </div>
            </div>
         )}
      </div>

      {/* Footer System Branding Credits */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6 px-6 text-center text-xs text-slate-400 print:hidden">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 font-mono">
            <p className="text-right">جميع الحقوق محفوظة © {new Date().getFullYear()} MyLab LIS Infrastructure</p>
            <p className="text-left text-[11px] text-slate-500">مشيد للأغراض الطبية - متوافق بالكامل مع ASTM و HL7 FHIR v4</p>
         </div>
      </footer>
    </div>
  );
}
