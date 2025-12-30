import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { BarChart3, Brain, Calculator, TrendingUp, Users, Target, Briefcase, PieChart, MessageSquare, Building2, FileText, ChevronDown, ChevronRight, Plus, X, Edit3, AlertTriangle, Star, Zap, Clock, RefreshCw, Settings, LogIn, LogOut, User } from 'lucide-react';

// TODO: Replace with your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBmBYLOs8qe5_oGvel37pEas9cpaz6Kmyk",
  authDomain: "competency-tracker-48714.firebaseapp.com",
  projectId: "competency-tracker-48714",
  storageBucket: "competency-tracker-48714.firebasestorage.app",
  messagingSenderId: "410761657034",
  appId: "1:410761657034:web:86cca89027ae5b77811233"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

const iconMap = { behavioral: MessageSquare, accounting: Calculator, valuation: PieChart, lbo: TrendingUp, ma: Building2, brainteasers: Brain, market: BarChart3, fit: Users, technical: FileText, default: Target };

const levels = [
  { value: 1, label: 'Liability', color: 'bg-red-600' },
  { value: 2, label: 'Weak', color: 'bg-red-400' },
  { value: 3, label: 'Below Viable', color: 'bg-orange-400' },
  { value: 4, label: 'Viable', color: 'bg-yellow-400' },
  { value: 5, label: 'Strong', color: 'bg-lime-500' },
  { value: 6, label: 'Differentiating', color: 'bg-green-500' },
  { value: 7, label: 'Rare/Standout', color: 'bg-emerald-600' }
];

const initialData = [
  { id: 'background_fit', name: 'Background & Fit', icon: 'behavioral', subcategories: [
    { id: 'bf1', name: 'Walk Me Through Your Resume', level: null, floor: 5, diffBar: 7, floorCritical: true, highWeight: true, evidence: [] },
    { id: 'bf2', name: 'Why Investment Banking', level: null, floor: 5, diffBar: 7, floorCritical: true, highWeight: true, evidence: [] },
    { id: 'bf3', name: 'Why This Firm', level: null, floor: 5, diffBar: 7, floorCritical: true, highWeight: true, evidence: [] },
    { id: 'bf4', name: 'Why This Group/Coverage', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: false, evidence: [] },
    { id: 'bf5', name: 'Tell Me About Yourself', level: null, floor: 5, diffBar: 7, floorCritical: true, highWeight: true, evidence: [] },
  ]},
  { id: 'career_vision', name: 'Career Vision & Future', icon: 'behavioral', subcategories: [
    { id: 'cv1', name: 'Where Do You See Yourself in 5 Years', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: false, evidence: [] },
    { id: 'cv2', name: 'Long-Term Career Goals', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: false, evidence: [] },
    { id: 'cv3', name: 'Why Not PE/HF/Consulting', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: false, evidence: [] },
  ]},
  { id: 'conflict_situations', name: 'Conflict & Difficult Situations', icon: 'behavioral', subcategories: [
    { id: 'cs1', name: 'Tell Me About a Conflict', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: false, evidence: [] },
    { id: 'cs2', name: 'Disagreement with Manager/Team', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: false, evidence: [] },
    { id: 'cs3', name: 'Handling Failure/Mistake', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: false, evidence: [] },
    { id: 'cs4', name: 'High-Pressure Deadline Story', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: false, evidence: [] },
  ]},
  { id: 'general_banking_knowledge', name: 'General Banking Knowledge', icon: 'market', subcategories: [
    { id: 'gbk1', name: 'What Does an IB Analyst Do', level: null, floor: 5, diffBar: 7, floorCritical: true, highWeight: false, evidence: [] },
    { id: 'gbk2', name: 'IB vs S&T vs Research vs AM', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: false, evidence: [] },
    { id: 'gbk3', name: 'M&A vs ECM vs DCM vs Restructuring', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: false, evidence: [] },
    { id: 'gbk4', name: 'Recent Deals at This Bank', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: true, evidence: [] },
  ]},
  { id: 'strengths_weaknesses', name: 'Strengths, Weaknesses & Feedback', icon: 'behavioral', subcategories: [
    { id: 'sw1', name: 'Greatest Strength', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: false, evidence: [] },
    { id: 'sw2', name: 'Greatest Weakness', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: false, evidence: [] },
    { id: 'sw3', name: 'Constructive Feedback Received', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: false, evidence: [] },
  ]},
  { id: 'team_leadership', name: 'Team & Leadership', icon: 'fit', subcategories: [
    { id: 'tl1', name: 'Leadership Experience Story', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: true, evidence: [] },
    { id: 'tl2', name: 'Team Project Example', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: false, evidence: [] },
    { id: 'tl3', name: 'Role in Team Dynamics', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: false, evidence: [] },
  ]},
  { id: 'work_ethic', name: 'Work Ethic & Commitment', icon: 'fit', subcategories: [
    { id: 'we1', name: 'Why Can You Handle the Hours', level: null, floor: 5, diffBar: 7, floorCritical: true, highWeight: true, evidence: [] },
    { id: 'we2', name: 'Going Above and Beyond Example', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: false, evidence: [] },
    { id: 'we3', name: 'Attention to Detail Example', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: false, evidence: [] },
  ]},
  { id: 'resume_understanding', name: 'Resume Understanding', icon: 'behavioral', subcategories: [
    { id: 'ru1', name: 'Explain Any Experience on Resume', level: null, floor: 5, diffBar: 7, floorCritical: true, highWeight: true, evidence: [] },
    { id: 'ru2', name: 'Most Impactful Experience', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: false, evidence: [] },
    { id: 'ru3', name: 'Quantified Achievements', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: false, evidence: [] },
  ]},
  { id: 'accounting', name: 'Accounting', icon: 'accounting', subcategories: [
    { id: 'acc1', name: '3-Statement Linkages', level: null, floor: 5, diffBar: 7, floorCritical: true, highWeight: true, evidence: [] },
    { id: 'acc2', name: 'Walk Through $10 Depreciation', level: null, floor: 5, diffBar: 7, floorCritical: true, highWeight: true, evidence: [] },
    { id: 'acc3', name: 'Working Capital Changes', level: null, floor: 5, diffBar: 7, floorCritical: true, highWeight: false, evidence: [] },
    { id: 'acc4', name: 'Deferred Revenue Accounting', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: false, evidence: [] },
    { id: 'acc5', name: 'Goodwill & Intangibles', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: false, evidence: [] },
    { id: 'acc6', name: 'Stock-Based Compensation', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: false, evidence: [] },
  ]},
  { id: 'enterprise_equity', name: 'Enterprise & Equity Value', icon: 'valuation', subcategories: [
    { id: 'ev1', name: 'Enterprise Value Formula', level: null, floor: 5, diffBar: 7, floorCritical: true, highWeight: true, evidence: [] },
    { id: 'ev2', name: 'Equity Value to EV Bridge', level: null, floor: 5, diffBar: 7, floorCritical: true, highWeight: true, evidence: [] },
    { id: 'ev3', name: 'Why Add Debt / Subtract Cash', level: null, floor: 5, diffBar: 7, floorCritical: true, highWeight: false, evidence: [] },
    { id: 'ev4', name: 'Diluted Shares Calculation', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: false, evidence: [] },
  ]},
  { id: 'valuation', name: 'Valuation', icon: 'valuation', subcategories: [
    { id: 'val1', name: 'Three Main Valuation Methods', level: null, floor: 5, diffBar: 7, floorCritical: true, highWeight: true, evidence: [] },
    { id: 'val2', name: 'When to Use Each Method', level: null, floor: 5, diffBar: 7, floorCritical: true, highWeight: true, evidence: [] },
    { id: 'val3', name: 'Comparable Company Analysis', level: null, floor: 5, diffBar: 7, floorCritical: true, highWeight: false, evidence: [] },
    { id: 'val4', name: 'Precedent Transactions', level: null, floor: 5, diffBar: 7, floorCritical: true, highWeight: false, evidence: [] },
  ]},
  { id: 'dcf', name: 'DCF', icon: 'valuation', subcategories: [
    { id: 'dcf1', name: 'Walk Me Through a DCF', level: null, floor: 5, diffBar: 7, floorCritical: true, highWeight: true, evidence: [] },
    { id: 'dcf2', name: 'Unlevered Free Cash Flow', level: null, floor: 5, diffBar: 7, floorCritical: true, highWeight: true, evidence: [] },
    { id: 'dcf3', name: 'WACC Calculation', level: null, floor: 5, diffBar: 7, floorCritical: true, highWeight: false, evidence: [] },
    { id: 'dcf4', name: 'Cost of Equity (CAPM)', level: null, floor: 5, diffBar: 7, floorCritical: true, highWeight: false, evidence: [] },
    { id: 'dcf5', name: 'Terminal Value Methods', level: null, floor: 5, diffBar: 7, floorCritical: true, highWeight: false, evidence: [] },
  ]},
  { id: 'merger_model', name: 'Merger Model (M&A)', icon: 'ma', subcategories: [
    { id: 'ma1', name: 'Walk Me Through a Merger Model', level: null, floor: 5, diffBar: 7, floorCritical: true, highWeight: true, evidence: [] },
    { id: 'ma2', name: 'Accretion / Dilution Analysis', level: null, floor: 5, diffBar: 7, floorCritical: true, highWeight: true, evidence: [] },
    { id: 'ma3', name: 'Stock vs Cash Deal Impact', level: null, floor: 5, diffBar: 7, floorCritical: true, highWeight: false, evidence: [] },
    { id: 'ma4', name: 'Sources of Synergies', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: false, evidence: [] },
    { id: 'ma5', name: 'Goodwill Creation in M&A', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: false, evidence: [] },
  ]},
  { id: 'lbo', name: 'Leveraged Buyouts (LBOs)', icon: 'lbo', subcategories: [
    { id: 'lbo1', name: 'Walk Me Through an LBO', level: null, floor: 5, diffBar: 7, floorCritical: true, highWeight: true, evidence: [] },
    { id: 'lbo2', name: 'Paper LBO (Mental Math)', level: null, floor: 5, diffBar: 7, floorCritical: true, highWeight: true, evidence: [] },
    { id: 'lbo3', name: 'Sources & Uses', level: null, floor: 5, diffBar: 7, floorCritical: true, highWeight: false, evidence: [] },
    { id: 'lbo4', name: 'IRR Drivers', level: null, floor: 5, diffBar: 7, floorCritical: true, highWeight: true, evidence: [] },
    { id: 'lbo5', name: 'Ideal LBO Candidate', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: false, evidence: [] },
    { id: 'lbo6', name: 'Types of Debt in LBO', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: false, evidence: [] },
  ]},
  { id: 'finance_brainteasers', name: 'Finance Brain Teasers', icon: 'brainteasers', subcategories: [
    { id: 'fbt1', name: 'Stock Price Impact Questions', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: false, evidence: [] },
    { id: 'fbt2', name: 'Interest Rate Scenarios', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: false, evidence: [] },
    { id: 'fbt3', name: 'M&A Quick Scenarios', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: false, evidence: [] },
    { id: 'fbt4', name: 'Balance Sheet Impact Questions', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: false, evidence: [] },
  ]},
  { id: 'general_brainteasers', name: 'General Brain Teasers', icon: 'brainteasers', subcategories: [
    { id: 'gbt1', name: 'Market Sizing Questions', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: false, evidence: [] },
    { id: 'gbt2', name: 'Logic Puzzles', level: null, floor: 4, diffBar: 7, floorCritical: false, highWeight: false, evidence: [] },
    { id: 'gbt3', name: 'Mental Math Speed', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: false, evidence: [] },
    { id: 'gbt4', name: 'Estimation Questions', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: false, evidence: [] },
  ]},
  { id: 'market_knowledge', name: 'Market Knowledge', icon: 'market', subcategories: [
    { id: 'mk1', name: 'Current Market Indices', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: false, evidence: [] },
    { id: 'mk2', name: 'Recent Major Deals', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: true, evidence: [] },
    { id: 'mk3', name: 'Interest Rate Environment', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: false, evidence: [] },
    { id: 'mk4', name: 'Pitch a Stock', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: true, evidence: [] },
  ]},
  { id: 'tmt_banking', name: 'Technology Banking Group', icon: 'technical', subcategories: [
    { id: 'tmt1', name: 'TMT Sector Overview', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: true, evidence: [] },
    { id: 'tmt2', name: 'SaaS Metrics (ARR, NRR, CAC)', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: true, evidence: [] },
    { id: 'tmt3', name: 'Tech Valuation Multiples', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: false, evidence: [] },
    { id: 'tmt4', name: 'Recent Tech M&A Deals', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: true, evidence: [] },
  ]},
  { id: 'hc_banking', name: 'Healthcare Banking Group', icon: 'technical', subcategories: [
    { id: 'hc1', name: 'Healthcare Sector Overview', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: true, evidence: [] },
    { id: 'hc2', name: 'Pharma vs Biotech vs Medtech', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: false, evidence: [] },
    { id: 'hc3', name: 'Healthcare Valuation Nuances', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: false, evidence: [] },
    { id: 'hc4', name: 'Recent Healthcare M&A Deals', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: true, evidence: [] },
  ]},
  { id: 'fit_presence', name: 'Fit & Presence', icon: 'fit', subcategories: [
    { id: 'fp1', name: 'Confidence & Polish', level: null, floor: 5, diffBar: 7, floorCritical: true, highWeight: true, evidence: [] },
    { id: 'fp2', name: 'Handling Curveballs', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: false, evidence: [] },
    { id: 'fp3', name: 'Energy & Enthusiasm', level: null, floor: 5, diffBar: 7, floorCritical: true, highWeight: true, evidence: [] },
    { id: 'fp4', name: 'Asking Good Questions', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: true, evidence: [] },
  ]},
];

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [categories, setCategories] = useState(initialData);
  const [view, setView] = useState('input');
  const [saveStatus, setSaveStatus] = useState('idle');
  const [lastSaved, setLastSaved] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({ background_fit: true });
  const [inputMode, setInputMode] = useState(null);
  const [addingCat, setAddingCat] = useState(false);
  const [addingSub, setAddingSub] = useState(null);
  const [newName, setNewName] = useState('');
  const [showReset, setShowReset] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [defaultFloor, setDefaultFloor] = useState(4);

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Load data when user changes
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      if (user) {
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.categories) setCategories(data.categories);
            if (data.defaultFloor) setDefaultFloor(data.defaultFloor);
            if (data.lastSaved) setLastSaved(data.lastSaved);
          }
        } catch (e) { console.error('Error loading:', e); }
      } else {
        // Load from localStorage for non-logged-in users
        try {
          const saved = localStorage.getItem('competency-tracker-data');
          if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.categories) setCategories(parsed.categories);
            if (parsed.defaultFloor) setDefaultFloor(parsed.defaultFloor);
            if (parsed.lastSaved) setLastSaved(parsed.lastSaved);
          }
        } catch (e) { console.log('Using defaults'); }
      }
      setLoading(false);
    };
    if (!authLoading) loadData();
  }, [user, authLoading]);

  // Save data when categories change
  useEffect(() => {
    if (loading || authLoading) return;
    const save = async () => {
      setSaveStatus('saving');
      const data = { categories, defaultFloor, lastSaved: new Date().toISOString() };
      try {
        if (user) {
          await setDoc(doc(db, 'users', user.uid), data);
        } else {
          localStorage.setItem('competency-tracker-data', JSON.stringify(data));
        }
        setLastSaved(data.lastSaved);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 1500);
      } catch (e) { 
        console.error('Save error:', e);
        setSaveStatus('error'); 
      }
    };
    const t = setTimeout(save, 1500);
    return () => clearTimeout(t);
  }, [categories, defaultFloor, loading, authLoading, user]);

  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) { console.error('Sign in error:', e); }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setCategories(initialData);
      setDefaultFloor(4);
    } catch (e) { console.error('Sign out error:', e); }
  };

  const exportData = () => {
    const data = { categories, defaultFloor, exportDate: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `competency-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result);
        if (data.categories) {
          setCategories(data.categories);
          if (data.defaultFloor) setDefaultFloor(data.defaultFloor);
          alert('Data imported successfully!');
        } else {
          alert('Invalid backup file');
        }
      } catch (err) {
        alert('Error reading file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const allSkills = categories.flatMap(c => c.subcategories.map(s => ({ ...s, catId: c.id, catName: c.name })));
  const ratedSkills = allSkills.filter(s => s.level !== null);

  const deleteSkill = (catId, skillId) => setCategories(prev => prev.map(c => c.id === catId ? { ...c, subcategories: c.subcategories.filter(s => s.id !== skillId) } : c));
  const deleteCategory = (catId) => setCategories(prev => prev.filter(c => c.id !== catId));

  const addSubcategory = (catId) => {
    if (!newName.trim()) return;
    setCategories(prev => prev.map(c => c.id === catId ? { ...c, subcategories: [...c.subcategories, { id: `${catId}_${Date.now()}`, name: newName, level: null, floor: defaultFloor, diffBar: 7, floorCritical: true, highWeight: false, evidence: [] }] } : c));
    setNewName(''); setAddingSub(null);
  };

  const addCategory = () => {
    if (!newName.trim()) return;
    const id = newName.toLowerCase().replace(/\s+/g, '_');
    setCategories(prev => [...prev, { id, name: newName, icon: 'default', subcategories: [] }]);
    setNewName(''); setAddingCat(false); setExpanded(p => ({ ...p, [id]: true }));
  };

  const setAllFloors = (n) => setCategories(prev => prev.map(c => ({ ...c, subcategories: c.subcategories.map(s => ({ ...s, floor: n })) })));
  const getZone = (s) => s.level === null ? 'unrated' : s.level < s.floor ? 'red' : s.level >= s.diffBar ? 'green' : 'yellow';

  const stats = {
    total: allSkills.length, rated: ratedSkills.length,
    belowFloor: ratedSkills.filter(s => s.floorCritical && s.level < s.floor).length,
    atFloor: ratedSkills.filter(s => s.level >= s.floor && s.level < s.diffBar).length,
    diff: ratedSkills.filter(s => s.level >= s.diffBar).length,
  };

  const SkillRow = ({ skill, catId }) => {
    const zone = getZone(skill);
    const [localEvidence, setLocalEvidence] = useState('');
    const isActive = inputMode === skill.id;
    
    const handleAddEvidence = (level) => {
      if (!localEvidence.trim()) return;
      setCategories(prev => prev.map(c => c.id === catId ? { ...c, subcategories: c.subcategories.map(s => s.id === skill.id ? { ...s, evidence: [...(s.evidence || []), { text: localEvidence, level, date: new Date().toLocaleDateString() }], level } : s) } : c));
      setLocalEvidence('');
      setInputMode(null);
    };
    
    return (
      <div className={`border rounded-lg mb-2 p-3 ${zone === 'red' ? 'border-red-300 bg-red-50' : zone === 'green' ? 'border-green-300 bg-green-50' : zone === 'yellow' ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200 bg-white'}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{skill.name}</span>
            {skill.floorCritical && <span className="text-xs bg-red-100 text-red-700 px-1 rounded">Floor</span>}
            {skill.highWeight && <Star className="w-3 h-3 text-amber-500 fill-amber-500" />}
