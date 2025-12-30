import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { BarChart3, Brain, Calculator, TrendingUp, Users, Target, Briefcase, PieChart, MessageSquare, Building2, FileText, ChevronDown, ChevronRight, Plus, X, Edit3, AlertTriangle, Star, Zap, Clock, RefreshCw, Settings, LogIn, LogOut, User } from 'lucide-react';

// Firebase config
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
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setInputMode(isActive ? null : skill.id)} className="text-xs text-blue-600 hover:text-blue-800">
              {isActive ? 'Close' : '+ Evidence'}
            </button>
            <button onClick={() => deleteSkill(catId, skill.id)} className="text-gray-400 hover:text-red-500"><X className="w-3 h-3" /></button>
          </div>
        </div>
        <div className="flex gap-1 mb-2">
          {levels.map(l => (
            <button key={l.value} onClick={() => setCategories(prev => prev.map(c => c.id === catId ? { ...c, subcategories: c.subcategories.map(s => s.id === skill.id ? { ...s, level: l.value } : s) } : c))} className={`w-8 h-8 rounded text-xs font-bold transition-all ${skill.level === l.value ? l.color + ' text-white ring-2 ring-gray-800' : skill.level > l.value ? l.color + ' text-white/60' : 'bg-gray-100 text-gray-400'} ${l.value === skill.floor ? 'ring-2 ring-orange-400 ring-offset-1' : ''} ${l.value === skill.diffBar ? 'ring-2 ring-emerald-400 ring-offset-1' : ''}`}>{l.value}</button>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-500"><span>Floor: <b className="text-orange-600">{skill.floor}</b></span><span>Diff: <b className="text-emerald-600">{skill.diffBar}</b></span></div>
        {isActive && (
          <div className="mt-3 p-3 bg-white border rounded">
            <input type="text" placeholder="Evidence: 'answered 8/10 correctly'" value={localEvidence} onChange={e => setLocalEvidence(e.target.value)} className="w-full p-2 border rounded text-sm mb-2" autoFocus />
            <div className="flex gap-1">{levels.map(l => (<button key={l.value} onClick={() => handleAddEvidence(l.value)} className={`flex-1 py-1.5 rounded text-xs font-bold ${l.color} text-white`}>{l.value}</button>))}</div>
            <button onClick={() => setInputMode(null)} className="mt-2 text-xs text-gray-500">Cancel</button>
          </div>
        )}
        {skill.evidence.length > 0 && !isActive && (
          <div className="mt-2 pt-2 border-t text-xs text-gray-500">
            {skill.evidence.slice(-2).map((e, i) => (<div key={i} className="flex gap-2 mb-1"><span className={`px-1 rounded ${levels[e.level - 1]?.color} text-white font-bold`}>{e.level}</span><span>{e.text}</span></div>))}
          </div>
        )}
      </div>
    );
  };

  if (loading || authLoading) return <div className="min-h-screen flex items-center justify-center"><RefreshCw className="w-8 h-8 animate-spin text-blue-500" /></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2"><Briefcase className="w-5 h-5" /> Competency Tracker</h1>
            <p className="text-xs text-slate-400 mt-0.5">by your friends at the YLF University of Utah Chapter</p>
          </div>
          <div className="flex gap-3 items-center">
            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-300">{user.email}</span>
                <button onClick={handleSignOut} className="text-xs text-slate-400 hover:text-white flex items-center gap-1"><LogOut className="w-3 h-3" />Sign Out</button>
              </div>
            ) : (
              <button onClick={handleSignIn} className="text-xs bg-white text-slate-800 px-3 py-1.5 rounded flex items-center gap-1 hover:bg-slate-100"><LogIn className="w-3 h-3" />Sign in with Google</button>
            )}
            <button onClick={() => setShowSettings(s => !s)} className="text-xs text-slate-400 hover:text-white flex items-center gap-1"><Settings className="w-3 h-3" />Settings</button>
          </div>
        </div>
        {!user && (
          <div className="mt-2 bg-slate-700/50 rounded p-2 text-xs text-slate-300">
            <span className="text-amber-400">⚠️</span> Sign in to sync progress across devices. Without sign-in, progress saves only to this browser.
          </div>
        )}
      </div>

      {showSettings && (
        <div className="bg-white border-b p-4">
          <h3 className="font-bold mb-3">Settings</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <label className="block text-gray-600 mb-1">Default Floor for New Skills</label>
              <select value={defaultFloor} onChange={e => setDefaultFloor(Number(e.target.value))} className="border rounded px-2 py-1">{[1,2,3,4,5,6,7].map(n => <option key={n} value={n}>{n}</option>)}</select>
            </div>
            <div>
              <label className="block text-gray-600 mb-1">Set All Floors To</label>
              <div className="flex gap-1">{[1,2,3,4,5,6,7].map(n => <button key={n} onClick={() => setAllFloors(n)} className="px-2 py-1 border rounded hover:bg-gray-100">{n}</button>)}</div>
            </div>
            <div>
              <label className="block text-gray-600 mb-1">Export Data</label>
              <button onClick={exportData} className="text-blue-600 hover:text-blue-800">Download Backup</button>
            </div>
            <div>
              <label className="block text-gray-600 mb-1">Import Data</label>
              <input type="file" accept=".json" onChange={importData} className="text-sm" />
            </div>
            <div className="col-span-2">
              <button onClick={() => setShowReset(true)} className="text-red-600 hover:text-red-800 text-sm">Reset All Progress</button>
            </div>
          </div>
        </div>
      )}

      {showReset && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm">
            <h3 className="font-bold text-lg mb-2">Reset All Progress?</h3>
            <p className="text-gray-600 mb-4">This will clear all your ratings and evidence. This cannot be undone.</p>
            <div className="flex gap-2">
              <button onClick={() => { setCategories(initialData); setShowReset(false); }} className="flex-1 bg-red-600 text-white py-2 rounded">Reset</button>
              <button onClick={() => setShowReset(false)} className="flex-1 border py-2 rounded">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex border-b bg-white">
        {['input', 'dashboard'].map(v => (
          <button key={v} onClick={() => setView(v)} className={`flex-1 py-3 text-sm font-medium ${view === v ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>{v === 'input' ? 'Rate Skills' : 'Dashboard'}</button>
        ))}
      </div>

      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-4 text-xs">
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-500 rounded-full" /> Below Floor: {stats.belowFloor}</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-yellow-400 rounded-full" /> At Floor: {stats.atFloor}</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-500 rounded-full" /> Differentiating: {stats.diff}</span>
          </div>
          <div className="text-xs text-gray-500">
            {saveStatus === 'saving' && <span className="text-blue-500">Saving...</span>}
            {saveStatus === 'saved' && <span className="text-green-500">✓ Saved</span>}
            {saveStatus === 'error' && <span className="text-red-500">Error saving</span>}
            {lastSaved && saveStatus === 'idle' && <span>Last saved: {new Date(lastSaved).toLocaleTimeString()}</span>}
          </div>
        </div>

        {view === 'input' && (
          <div>
            {categories.map(cat => {
              const Icon = iconMap[cat.icon] || iconMap.default;
              const isExpanded = expanded[cat.id];
              const catSkills = cat.subcategories;
              const belowFloor = catSkills.filter(s => s.level !== null && s.level < s.floor).length;
              
              return (
                <div key={cat.id} className="mb-4">
                  <div onClick={() => setExpanded(p => ({ ...p, [cat.id]: !p[cat.id] }))} className="flex items-center justify-between p-3 bg-white rounded-lg border cursor-pointer hover:bg-gray-50">
                    <div className="flex items-center gap-2">
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      <Icon className="w-4 h-4 text-slate-600" />
                      <span className="font-medium">{cat.name}</span>
                      <span className="text-xs text-gray-400">({catSkills.filter(s => s.level !== null).length}/{catSkills.length})</span>
                      {belowFloor > 0 && <span className="text-xs bg-red-100 text-red-700 px-1.5 rounded">{belowFloor} below floor</span>}
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); deleteCategory(cat.id); }} className="text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                  </div>
                  {isExpanded && (
                    <div className="mt-2 ml-4">
                      {catSkills.map(skill => <SkillRow key={skill.id} skill={skill} catId={cat.id} />)}
                      {addingSub === cat.id ? (
                        <div className="flex gap-2 mt-2">
                          <input type="text" placeholder="New skill name" value={newName} onChange={e => setNewName(e.target.value)} className="flex-1 p-2 border rounded text-sm" autoFocus />
                          <button onClick={() => addSubcategory(cat.id)} className="px-3 py-2 bg-blue-600 text-white rounded text-sm">Add</button>
                          <button onClick={() => { setAddingSub(null); setNewName(''); }} className="px-3 py-2 border rounded text-sm">Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => setAddingSub(cat.id)} className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"><Plus className="w-3 h-3" /> Add Skill</button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            {addingCat ? (
              <div className="flex gap-2 mt-4">
                <input type="text" placeholder="New category name" value={newName} onChange={e => setNewName(e.target.value)} className="flex-1 p-2 border rounded" autoFocus />
                <button onClick={addCategory} className="px-4 py-2 bg-blue-600 text-white rounded">Add</button>
                <button onClick={() => { setAddingCat(false); setNewName(''); }} className="px-4 py-2 border rounded">Cancel</button>
              </div>
            ) : (
              <button onClick={() => setAddingCat(true)} className="mt-4 text-blue-600 hover:text-blue-800 flex items-center gap-1"><Plus className="w-4 h-4" /> Add Category</button>
            )}
          </div>
        )}

        {view === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg border text-center">
                <div className="text-3xl font-bold">{stats.rated}</div>
                <div className="text-xs text-gray-500">Skills Rated</div>
              </div>
              <div className="bg-white p-4 rounded-lg border text-center">
                <div className="text-3xl font-bold text-red-600">{stats.belowFloor}</div>
                <div className="text-xs text-gray-500">Below Floor</div>
              </div>
              <div className="bg-white p-4 rounded-lg border text-center">
                <div className="text-3xl font-bold text-yellow-600">{stats.atFloor}</div>
                <div className="text-xs text-gray-500">At Floor</div>
              </div>
              <div className="bg-white p-4 rounded-lg border text-center">
                <div className="text-3xl font-bold text-green-600">{stats.diff}</div>
                <div className="text-xs text-gray-500">Differentiating</div>
              </div>
            </div>

            <div>
              <h3 className="font-bold mb-3 flex items-center gap-2 text-red-600"><AlertTriangle className="w-4 h-4" /> Critical: Below Floor ({stats.belowFloor})</h3>
              {ratedSkills.filter(s => s.floorCritical && s.level < s.floor).length === 0 ? (
                <p className="text-sm text-gray-500">No critical skills below floor. Great job!</p>
              ) : (
                ratedSkills.filter(s => s.floorCritical && s.level < s.floor).map(s => (
                  <div key={s.id} className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded mb-1">
                    <span className={`px-2 py-0.5 rounded ${levels[s.level - 1]?.color} text-white font-bold text-xs`}>{s.level}</span>
                    <span className="font-medium text-sm">{s.name}</span>
                    <span className="text-xs text-gray-500">Floor: {s.floor}</span>
                    <span className="text-xs text-red-600 ml-auto">Gap: {s.floor - s.level}</span>
                  </div>
                ))
              )}
            </div>

            <div>
              <h3 className="font-bold mb-3 flex items-center gap-2 text-green-600"><Zap className="w-4 h-4" /> Differentiating Skills ({stats.diff})</h3>
              {ratedSkills.filter(s => s.level >= s.diffBar).length === 0 ? (
                <p className="text-sm text-gray-500">No differentiating skills yet. Keep practicing!</p>
              ) : (
                ratedSkills.filter(s => s.level >= s.diffBar).map(s => {
                  const hist = s.evidence.map(e => e.level);
                  const trend = hist.length > 1 ? hist[hist.length - 1] - hist[0] : 0;
                  return (
                    <div key={s.id} className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded mb-1">
                      <span className={`px-2 py-0.5 rounded ${levels[s.level - 1]?.color} text-white font-bold text-xs`}>{s.level}</span>
                      <span className="font-medium text-sm">{s.name}</span>
                      <div className="ml-auto text-xs">
                        <span className={`${trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-500'}`}>{hist[0]} → {hist[hist.length - 1]} {trend > 0 ? '↑' : trend < 0 ? '↓' : ''}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div>
              <h3 className="font-bold mb-3 flex items-center gap-2"><Clock className="w-4 h-4" />Recent Activity</h3>
              {allSkills.flatMap(s => s.evidence.map(e => ({ ...e, name: s.name }))).slice(-10).reverse().map((e, i) => (
                <div key={i} className="flex items-center gap-2 p-2 bg-white border rounded mb-1 text-sm">
                  <span className={`px-1.5 py-0.5 rounded ${levels[e.level - 1]?.color} text-white font-bold text-xs`}>{e.level}</span>
                  <span className="font-medium">{e.name}</span>
                  <span className="text-gray-500 text-xs flex-1">{e.text}</span>
                  <span className="text-gray-400 text-xs">{e.date}</span>
                </div>
              ))}
              {allSkills.every(s => s.evidence.length === 0) && <p className="text-sm text-gray-500">No activity yet</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
