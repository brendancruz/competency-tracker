import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { BarChart3, Brain, Calculator, TrendingUp, Users, Target, Briefcase, PieChart, MessageSquare, Building2, FileText, ChevronDown, ChevronRight, Plus, X, Edit3, AlertTriangle, Star, Zap, RefreshCw, Settings, LogIn, LogOut, Layers } from 'lucide-react';

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
  { value: 1, label: 'Liability', color: 'bg-red-600', hex: '#dc2626' },
  { value: 2, label: 'Weak', color: 'bg-red-400', hex: '#f87171' },
  { value: 3, label: 'Below Viable', color: 'bg-orange-400', hex: '#fb923c' },
  { value: 4, label: 'Viable', color: 'bg-yellow-400', hex: '#facc15' },
  { value: 5, label: 'Strong', color: 'bg-lime-500', hex: '#84cc16' },
  { value: 6, label: 'Differentiating', color: 'bg-green-500', hex: '#22c55e' },
  { value: 7, label: 'Rare/Standout', color: 'bg-emerald-600', hex: '#059669' }
];

const initialData = [
  { id: 'background_fit', name: 'Background & Fit', icon: 'behavioral', subcategories: [
    { id: 'bf1', name: 'Walk Me Through Your Resume', level: null, floor: 5, diffBar: 7, floorCritical: true, highWeight: true, evidence: [], notes: '' },
    { id: 'bf2', name: 'Why Investment Banking', level: null, floor: 5, diffBar: 7, floorCritical: true, highWeight: true, evidence: [], notes: '' },
    { id: 'bf3', name: 'Why This Firm', level: null, floor: 5, diffBar: 7, floorCritical: true, highWeight: true, evidence: [], notes: '' },
    { id: 'bf4', name: 'Why This Group/Coverage', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: false, evidence: [], notes: '' },
    { id: 'bf5', name: 'Tell Me About Yourself', level: null, floor: 5, diffBar: 7, floorCritical: true, highWeight: true, evidence: [], notes: '' },
  ]},
  { id: 'career_vision', name: 'Career Vision & Future', icon: 'behavioral', subcategories: [
    { id: 'cv1', name: 'Where Do You See Yourself in 5 Years', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: false, evidence: [], notes: '' },
    { id: 'cv2', name: 'Long-Term Career Goals', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: false, evidence: [], notes: '' },
    { id: 'cv3', name: 'Why Not PE/HF/Consulting', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: false, evidence: [], notes: '' },
  ]},
  { id: 'conflict_situations', name: 'Conflict & Difficult Situations', icon: 'behavioral', subcategories: [
    { id: 'cs1', name: 'Tell Me About a Conflict', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: false, evidence: [], notes: '' },
    { id: 'cs2', name: 'Disagreement with Manager/Team', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: false, evidence: [], notes: '' },
    { id: 'cs3', name: 'Handling Failure/Mistake', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: false, evidence: [], notes: '' },
    { id: 'cs4', name: 'High-Pressure Deadline Story', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: false, evidence: [], notes: '' },
  ]},
  { id: 'general_banking_knowledge', name: 'General Banking Knowledge', icon: 'market', subcategories: [
    { id: 'gbk1', name: 'What Does an IB Analyst Do', level: null, floor: 5, diffBar: 7, floorCritical: true, highWeight: false, evidence: [], notes: '' },
    { id: 'gbk2', name: 'IB vs S&T vs Research vs AM', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: false, evidence: [], notes: '' },
    { id: 'gbk3', name: 'M&A vs ECM vs DCM vs Restructuring', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: false, evidence: [], notes: '' },
    { id: 'gbk4', name: 'Recent Deals at This Bank', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: true, evidence: [], notes: '' },
  ]},
  { id: 'strengths_weaknesses', name: 'Strengths, Weaknesses & Feedback', icon: 'behavioral', subcategories: [
    { id: 'sw1', name: 'Greatest Strength', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: false, evidence: [], notes: '' },
    { id: 'sw2', name: 'Greatest Weakness', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: false, evidence: [], notes: '' },
    { id: 'sw3', name: 'Constructive Feedback Received', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: false, evidence: [], notes: '' },
  ]},
  { id: 'team_leadership', name: 'Team & Leadership', icon: 'fit', subcategories: [
    { id: 'tl1', name: 'Leadership Experience Story', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: true, evidence: [], notes: '' },
    { id: 'tl2', name: 'Team Project Example', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: false, evidence: [], notes: '' },
    { id: 'tl3', name: 'Role in Team Dynamics', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: false, evidence: [], notes: '' },
  ]},
  { id: 'work_ethic', name: 'Work Ethic & Commitment', icon: 'fit', subcategories: [
    { id: 'we1', name: 'Why Can You Handle the Hours', level: null, floor: 5, diffBar: 7, floorCritical: true, highWeight: true, evidence: [], notes: '' },
    { id: 'we2', name: 'Going Above and Beyond Example', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: false, evidence: [], notes: '' },
    { id: 'we3', name: 'Attention to Detail Example', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: false, evidence: [], notes: '' },
  ]},
  { id: 'resume_understanding', name: 'Resume Understanding', icon: 'behavioral', subcategories: [
    { id: 'ru1', name: 'Explain Any Experience on Resume', level: null, floor: 5, diffBar: 7, floorCritical: true, highWeight: true, evidence: [], notes: '' },
    { id: 'ru2', name: 'Most Impactful Experience', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: false, evidence: [], notes: '' },
    { id: 'ru3', name: 'Quantified Achievements', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: false, evidence: [], notes: '' },
  ]},
  { id: 'accounting', name: 'Accounting', icon: 'accounting', subcategories: [
    { id: 'acc1', name: '3-Statement Linkages', level: null, floor: 5, diffBar: 7, floorCritical: true, highWeight: true, evidence: [], notes: '' },
    { id: 'acc2', name: 'Walk Through $10 Depreciation', level: null, floor: 5, diffBar: 7, floorCritical: true, highWeight: true, evidence: [], notes: '' },
    { id: 'acc3', name: 'Working Capital Changes', level: null, floor: 5, diffBar: 7, floorCritical: true, highWeight: false, evidence: [], notes: '' },
    { id: 'acc4', name: 'Deferred Revenue Accounting', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: false, evidence: [], notes: '' },
    { id: 'acc5', name: 'Goodwill & Intangibles', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: false, evidence: [], notes: '' },
    { id: 'acc6', name: 'Stock-Based Compensation', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: false, evidence: [], notes: '' },
  ]},
  { id: 'enterprise_equity', name: 'Enterprise & Equity Value', icon: 'valuation', subcategories: [
    { id: 'ev1', name: 'Enterprise Value Formula', level: null, floor: 5, diffBar: 7, floorCritical: true, highWeight: true, evidence: [], notes: '' },
    { id: 'ev2', name: 'Equity Value to EV Bridge', level: null, floor: 5, diffBar: 7, floorCritical: true, highWeight: true, evidence: [], notes: '' },
    { id: 'ev3', name: 'Why Add Debt / Subtract Cash', level: null, floor: 5, diffBar: 7, floorCritical: true, highWeight: false, evidence: [], notes: '' },
    { id: 'ev4', name: 'Diluted Shares Calculation', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: false, evidence: [], notes: '' },
  ]},
  { id: 'valuation', name: 'Valuation', icon: 'valuation', subcategories: [
    { id: 'val1', name: 'Three Main Valuation Methods', level: null, floor: 5, diffBar: 7, floorCritical: true, highWeight: true, evidence: [], notes: '' },
    { id: 'val2', name: 'When to Use Each Method', level: null, floor: 5, diffBar: 7, floorCritical: true, highWeight: true, evidence: [], notes: '' },
    { id: 'val3', name: 'Comparable Company Analysis', level: null, floor: 5, diffBar: 7, floorCritical: true, highWeight: false, evidence: [], notes: '' },
    { id: 'val4', name: 'Precedent Transactions', level: null, floor: 5, diffBar: 7, floorCritical: true, highWeight: false, evidence: [], notes: '' },
  ]},
  { id: 'dcf', name: 'DCF', icon: 'valuation', subcategories: [
    { id: 'dcf1', name: 'Walk Me Through a DCF', level: null, floor: 5, diffBar: 7, floorCritical: true, highWeight: true, evidence: [], notes: '' },
    { id: 'dcf2', name: 'Unlevered Free Cash Flow', level: null, floor: 5, diffBar: 7, floorCritical: true, highWeight: true, evidence: [], notes: '' },
    { id: 'dcf3', name: 'WACC Calculation', level: null, floor: 5, diffBar: 7, floorCritical: true, highWeight: false, evidence: [], notes: '' },
    { id: 'dcf4', name: 'Cost of Equity (CAPM)', level: null, floor: 5, diffBar: 7, floorCritical: true, highWeight: false, evidence: [], notes: '' },
    { id: 'dcf5', name: 'Terminal Value Methods', level: null, floor: 5, diffBar: 7, floorCritical: true, highWeight: false, evidence: [], notes: '' },
  ]},
  { id: 'merger_model', name: 'Merger Model (M&A)', icon: 'ma', subcategories: [
    { id: 'ma1', name: 'Walk Me Through a Merger Model', level: null, floor: 5, diffBar: 7, floorCritical: true, highWeight: true, evidence: [], notes: '' },
    { id: 'ma2', name: 'Accretion / Dilution Analysis', level: null, floor: 5, diffBar: 7, floorCritical: true, highWeight: true, evidence: [], notes: '' },
    { id: 'ma3', name: 'Stock vs Cash Deal Impact', level: null, floor: 5, diffBar: 7, floorCritical: true, highWeight: false, evidence: [], notes: '' },
    { id: 'ma4', name: 'Sources of Synergies', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: false, evidence: [], notes: '' },
    { id: 'ma5', name: 'Goodwill Creation in M&A', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: false, evidence: [], notes: '' },
  ]},
  { id: 'lbo', name: 'Leveraged Buyouts (LBOs)', icon: 'lbo', subcategories: [
    { id: 'lbo1', name: 'Walk Me Through an LBO', level: null, floor: 5, diffBar: 7, floorCritical: true, highWeight: true, evidence: [], notes: '' },
    { id: 'lbo2', name: 'Paper LBO (Mental Math)', level: null, floor: 5, diffBar: 7, floorCritical: true, highWeight: true, evidence: [], notes: '' },
    { id: 'lbo3', name: 'Sources & Uses', level: null, floor: 5, diffBar: 7, floorCritical: true, highWeight: false, evidence: [], notes: '' },
    { id: 'lbo4', name: 'IRR Drivers', level: null, floor: 5, diffBar: 7, floorCritical: true, highWeight: true, evidence: [], notes: '' },
    { id: 'lbo5', name: 'Ideal LBO Candidate', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: false, evidence: [], notes: '' },
    { id: 'lbo6', name: 'Types of Debt in LBO', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: false, evidence: [], notes: '' },
  ]},
  { id: 'finance_brainteasers', name: 'Finance Brain Teasers', icon: 'brainteasers', subcategories: [
    { id: 'fbt1', name: 'Stock Price Impact Questions', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: false, evidence: [], notes: '' },
    { id: 'fbt2', name: 'Interest Rate Scenarios', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: false, evidence: [], notes: '' },
    { id: 'fbt3', name: 'M&A Quick Scenarios', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: false, evidence: [], notes: '' },
    { id: 'fbt4', name: 'Balance Sheet Impact Questions', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: false, evidence: [], notes: '' },
  ]},
  { id: 'general_brainteasers', name: 'General Brain Teasers', icon: 'brainteasers', subcategories: [
    { id: 'gbt1', name: 'Market Sizing Questions', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: false, evidence: [], notes: '' },
    { id: 'gbt2', name: 'Logic Puzzles', level: null, floor: 4, diffBar: 7, floorCritical: false, highWeight: false, evidence: [], notes: '' },
    { id: 'gbt3', name: 'Mental Math Speed', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: false, evidence: [], notes: '' },
    { id: 'gbt4', name: 'Estimation Questions', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: false, evidence: [], notes: '' },
  ]},
  { id: 'market_knowledge', name: 'Market Knowledge', icon: 'market', subcategories: [
    { id: 'mk1', name: 'Current Market Indices', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: false, evidence: [], notes: '' },
    { id: 'mk2', name: 'Recent Major Deals', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: true, evidence: [], notes: '' },
    { id: 'mk3', name: 'Interest Rate Environment', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: false, evidence: [], notes: '' },
    { id: 'mk4', name: 'Pitch a Stock', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: true, evidence: [], notes: '' },
  ]},
  { id: 'tmt_banking', name: 'Technology Banking Group', icon: 'technical', subcategories: [
    { id: 'tmt1', name: 'TMT Sector Overview', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: true, evidence: [], notes: '' },
    { id: 'tmt2', name: 'SaaS Metrics (ARR, NRR, CAC)', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: true, evidence: [], notes: '' },
    { id: 'tmt3', name: 'Tech Valuation Multiples', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: false, evidence: [], notes: '' },
    { id: 'tmt4', name: 'Recent Tech M&A Deals', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: true, evidence: [], notes: '' },
  ]},
  { id: 'hc_banking', name: 'Healthcare Banking Group', icon: 'technical', subcategories: [
    { id: 'hc1', name: 'Healthcare Sector Overview', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: true, evidence: [], notes: '' },
    { id: 'hc2', name: 'Pharma vs Biotech vs Medtech', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: false, evidence: [], notes: '' },
    { id: 'hc3', name: 'Healthcare Valuation Nuances', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: false, evidence: [], notes: '' },
    { id: 'hc4', name: 'Recent Healthcare M&A Deals', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: true, evidence: [], notes: '' },
  ]},
  { id: 'fit_presence', name: 'Fit & Presence', icon: 'fit', subcategories: [
    { id: 'fp1', name: 'Confidence & Polish', level: null, floor: 5, diffBar: 7, floorCritical: true, highWeight: true, evidence: [], notes: '' },
    { id: 'fp2', name: 'Handling Curveballs', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: false, evidence: [], notes: '' },
    { id: 'fp3', name: 'Energy & Enthusiasm', level: null, floor: 5, diffBar: 7, floorCritical: true, highWeight: true, evidence: [], notes: '' },
    { id: 'fp4', name: 'Asking Good Questions', level: null, floor: 4, diffBar: 7, floorCritical: true, highWeight: true, evidence: [], notes: '' },
  ]},
];

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [categories, setCategories] = useState(initialData);
  const [view, setView] = useState('histogram');
  const [saveStatus, setSaveStatus] = useState('idle');
  const [lastSaved, setLastSaved] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({ background_fit: true });
  const [inputMode, setInputMode] = useState(null);
  const [editingSkill, setEditingSkill] = useState(null);
  const [addingCat, setAddingCat] = useState(false);
  const [addingSub, setAddingSub] = useState(null);
  const [newName, setNewName] = useState('');
  const [showReset, setShowReset] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [defaultFloor, setDefaultFloor] = useState(4);
  const [hoveredBar, setHoveredBar] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

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
    try { await signInWithPopup(auth, googleProvider); } catch (e) { console.error('Sign in error:', e); }
  };

  const handleSignOut = async () => {
    try { await signOut(auth); setCategories(initialData); setDefaultFloor(4); } catch (e) { console.error('Sign out error:', e); }
  };

  const exportData = () => {
    const data = { categories, defaultFloor, exportDate: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `competency-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click(); URL.revokeObjectURL(url);
  };

  const importData = (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result);
        if (data.categories) { setCategories(data.categories); if (data.defaultFloor) setDefaultFloor(data.defaultFloor); alert('Data imported!'); }
        else { alert('Invalid file'); }
      } catch (err) { alert('Error reading file'); }
    };
    reader.readAsText(file); e.target.value = '';
  };

  const allSkills = categories.flatMap(c => c.subcategories.map(s => ({ ...s, catId: c.id, catName: c.name })));
  const ratedSkills = allSkills.filter(s => s.level !== null);
  const deleteSkill = (catId, skillId) => setCategories(prev => prev.map(c => c.id === catId ? { ...c, subcategories: c.subcategories.filter(s => s.id !== skillId) } : c));
  const deleteCategory = (catId) => setCategories(prev => prev.filter(c => c.id !== catId));
  const updateSkill = (catId, skillId, updates) => setCategories(prev => prev.map(c => c.id === catId ? { ...c, subcategories: c.subcategories.map(s => s.id === skillId ? { ...s, ...updates } : s) } : c));

  const addSubcategory = (catId) => {
    if (!newName.trim()) return;
    setCategories(prev => prev.map(c => c.id === catId ? { ...c, subcategories: [...c.subcategories, { id: `${catId}_${Date.now()}`, name: newName, level: null, floor: defaultFloor, diffBar: 7, floorCritical: true, highWeight: false, evidence: [], notes: '' }] } : c));
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

  const histogramData = levels.map(l => ({ level: l.value, label: l.label, color: l.hex, bgColor: l.color, skills: ratedSkills.filter(s => s.level === l.value) }));
  const maxHistogramCount = Math.max(...histogramData.map(d => d.skills.length), 1);

  const stats = {
    total: allSkills.length, rated: ratedSkills.length, unrated: allSkills.length - ratedSkills.length,
    belowFloor: ratedSkills.filter(s => s.level < s.floor).length,
    atFloor: ratedSkills.filter(s => s.level >= s.floor && s.level < s.diffBar).length,
    diff: ratedSkills.filter(s => s.level >= s.diffBar).length,
    avgLevel: ratedSkills.length > 0 ? (ratedSkills.reduce((sum, s) => sum + s.level, 0) / ratedSkills.length).toFixed(1) : '-'
  };

  const redZone = ratedSkills.filter(s => s.level < s.floor).sort((a, b) => (b.floor - b.level) - (a.floor - a.level));
  const yellowZone = ratedSkills.filter(s => s.level >= s.floor && s.level < s.diffBar);
  const greenZone = ratedSkills.filter(s => s.level >= s.diffBar);

  const SkillRow = ({ skill, catId, compact = false }) => {
    const zone = getZone(skill);
    const [localEvidence, setLocalEvidence] = useState('');
    const [localNotes, setLocalNotes] = useState(skill.notes || '');
    const isActive = inputMode === skill.id;
    const isEditing = editingSkill === skill.id;
    
    const handleAddEvidence = (level) => {
      if (!localEvidence.trim()) return;
      updateSkill(catId, skill.id, { evidence: [...(skill.evidence || []), { text: localEvidence, level, date: new Date().toLocaleDateString() }], level });
      setLocalEvidence(''); setInputMode(null);
    };
    const handleSaveEdit = () => { updateSkill(catId, skill.id, { notes: localNotes }); setEditingSkill(null); };
    
    if (compact) {
      return (
        <div className={`flex items-center gap-2 p-2 rounded border ${zone === 'red' ? 'bg-red-50 border-red-200' : zone === 'green' ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
          <span className={`px-2 py-0.5 rounded ${levels[skill.level - 1]?.color} text-white font-bold text-xs`}>{skill.level}</span>
          <span className="font-medium text-sm flex-1">{skill.name}</span>
          <span className="text-xs text-gray-500">Floor: {skill.floor}</span>
          {zone === 'red' && <span className="text-xs text-red-600 font-medium">Gap: {skill.floor - skill.level}</span>}
        </div>
      );
    }
    
    return (
      <div className={`border rounded-lg mb-2 p-3 ${zone === 'red' ? 'border-red-300 bg-red-50' : zone === 'green' ? 'border-green-300 bg-green-50' : zone === 'yellow' ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200 bg-white'}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{skill.name}</span>
            {skill.floorCritical && <span className="text-xs bg-red-100 text-red-700 px-1 rounded">Floor</span>}
            {skill.highWeight && <Star className="w-3 h-3 text-amber-500 fill-amber-500" />}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setEditingSkill(isEditing ? null : skill.id)} className="text-gray-400 hover:text-blue-500"><Edit3 className="w-3 h-3" /></button>
            <button onClick={() => setInputMode(isActive ? null : skill.id)} className="text-xs text-blue-600 hover:text-blue-800">{isActive ? 'Close' : '+ Evidence'}</button>
            <button onClick={() => deleteSkill(catId, skill.id)} className="text-gray-400 hover:text-red-500"><X className="w-3 h-3" /></button>
          </div>
        </div>
        <div className="flex gap-1 mb-2">
          {levels.map(l => (
            <button key={l.value} onClick={() => updateSkill(catId, skill.id, { level: l.value })} className={`w-8 h-8 rounded text-xs font-bold transition-all ${skill.level === l.value ? l.color + ' text-white ring-2 ring-gray-800' : skill.level !== null && skill.level > l.value ? l.color + ' text-white/60' : 'bg-gray-100 text-gray-400'} ${l.value === skill.floor ? 'ring-2 ring-orange-400 ring-offset-1' : ''} ${l.value === skill.diffBar ? 'ring-2 ring-emerald-400 ring-offset-1' : ''}`}>{l.value}</button>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-500"><span>Floor: <b className="text-orange-600">{skill.floor}</b></span><span>Diff: <b className="text-emerald-600">{skill.diffBar}</b></span></div>
        {isEditing && (
          <div className="mt-3 p-3 bg-white border rounded space-y-2">
            <div className="flex gap-4">
              <div><label className="text-xs text-gray-600">Viable Floor</label><select value={skill.floor} onChange={e => updateSkill(catId, skill.id, { floor: Number(e.target.value) })} className="block border rounded px-2 py-1 text-sm">{[1,2,3,4,5,6,7].map(n => <option key={n} value={n}>{n}</option>)}</select></div>
              <div><label className="text-xs text-gray-600">Diff Bar</label><select value={skill.diffBar} onChange={e => updateSkill(catId, skill.id, { diffBar: Number(e.target.value) })} className="block border rounded px-2 py-1 text-sm">{[1,2,3,4,5,6,7].map(n => <option key={n} value={n}>{n}</option>)}</select></div>
              <div className="flex items-center gap-2"><label className="text-xs text-gray-600">High Weight</label><input type="checkbox" checked={skill.highWeight} onChange={e => updateSkill(catId, skill.id, { highWeight: e.target.checked })} /></div>
            </div>
            <div><label className="text-xs text-gray-600">Notes</label><textarea value={localNotes} onChange={e => setLocalNotes(e.target.value)} className="w-full p-2 border rounded text-sm" rows={2} placeholder="Add notes..." /></div>
            <button onClick={handleSaveEdit} className="text-xs bg-blue-600 text-white px-3 py-1 rounded">Save</button>
          </div>
        )}
        {isActive && (
          <div className="mt-3 p-3 bg-white border rounded">
            <input type="text" placeholder="Evidence: 'answered 8/10 correctly'" value={localEvidence} onChange={e => setLocalEvidence(e.target.value)} className="w-full p-2 border rounded text-sm mb-2" autoFocus />
            <div className="flex gap-1">{levels.map(l => (<button key={l.value} onClick={() => handleAddEvidence(l.value)} className={`flex-1 py-1.5 rounded text-xs font-bold ${l.color} text-white`}>{l.value}</button>))}</div>
            <button onClick={() => setInputMode(null)} className="mt-2 text-xs text-gray-500">Cancel</button>
          </div>
        )}
        {skill.notes && !isEditing && <div className="mt-2 text-xs text-gray-600 italic bg-gray-50 p-2 rounded">{skill.notes}</div>}
        {skill.evidence && skill.evidence.length > 0 && !isActive && (
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
        {!user && <div className="mt-2 bg-slate-700/50 rounded p-2 text-xs text-slate-300"><span className="text-amber-400">⚠️</span> Sign in to sync progress across devices.</div>}
      </div>

      {showSettings && (
        <div className="bg-white border-b p-4">
          <h3 className="font-bold mb-3">Settings</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><label className="block text-gray-600 mb-1">Default Floor</label><select value={defaultFloor} onChange={e => setDefaultFloor(Number(e.target.value))} className="border rounded px-2 py-1">{[1,2,3,4,5,6,7].map(n => <option key={n} value={n}>{n}</option>)}</select></div>
            <div><label className="block text-gray-600 mb-1">Set All Floors To</label><div className="flex gap-1">{[1,2,3,4,5,6,7].map(n => <button key={n} onClick={() => setAllFloors(n)} className="px-2 py-1 border rounded hover:bg-gray-100">{n}</button>)}</div></div>
            <div><label className="block text-gray-600 mb-1">Export</label><button onClick={exportData} className="text-blue-600 hover:text-blue-800">Download Backup</button></div>
            <div><label className="block text-gray-600 mb-1">Import</label><input type="file" accept=".json" onChange={importData} className="text-sm" /></div>
            <div className="col-span-2"><button onClick={() => setShowReset(true)} className="text-red-600 hover:text-red-800 text-sm">Reset All Progress</button></div>
          </div>
        </div>
      )}

      {showReset && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm">
            <h3 className="font-bold text-lg mb-2">Reset All Progress?</h3>
            <p className="text-gray-600 mb-4">This will clear all ratings and evidence.</p>
            <div className="flex gap-2">
              <button onClick={() => { setCategories(initialData); setShowReset(false); }} className="flex-1 bg-red-600 text-white py-2 rounded">Reset</button>
              <button onClick={() => setShowReset(false)} className="flex-1 border py-2 rounded">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex border-b bg-white">
        {[{ id: 'histogram', label: 'Histogram', icon: BarChart3 }, { id: 'priority', label: 'Priority', icon: Target }, { id: 'categories', label: 'Categories', icon: Layers }].map(v => (
          <button key={v.id} onClick={() => setView(v.id)} className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-1 ${view === v.id ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}><v.icon className="w-4 h-4" />{v.label}</button>
        ))}
      </div>

      <div className="p-4 bg-white border-b">
        <div className="flex justify-between items-center">
          <div className="flex gap-4 text-xs">
            <span>Rated: <b>{stats.rated}/{stats.total}</b></span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-500 rounded-full" /> Red: {stats.belowFloor}</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-yellow-400 rounded-full" /> Yellow: {stats.atFloor}</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-500 rounded-full" /> Green: {stats.diff}</span>
            <span>Avg: <b>{stats.avgLevel}</b></span>
          </div>
          <div className="text-xs text-gray-500">
            {saveStatus === 'saving' && <span className="text-blue-500">Saving...</span>}
            {saveStatus === 'saved' && <span className="text-green-500">✓ Saved</span>}
            {saveStatus === 'error' && <span className="text-red-500">Error saving</span>}
            {lastSaved && saveStatus === 'idle' && <span>Last saved: {new Date(lastSaved).toLocaleTimeString()}</span>}
          </div>
        </div>
      </div>

      <div className="p-4">
        {view === 'histogram' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border p-4">
              <h3 className="font-bold mb-4 text-lg">Competency Distribution</h3>
              <p className="text-sm text-gray-600 mb-4">Visual distribution of your {ratedSkills.length} rated skills. Hover over bars to see skills.</p>
              <div className="flex items-end gap-2 h-64 mb-4">
                {histogramData.map(d => (
                  <div key={d.level} className="flex-1 flex flex-col items-center">
                    <div className="w-full relative cursor-pointer transition-all hover:opacity-80" style={{ height: `${(d.skills.length / maxHistogramCount) * 100}%`, minHeight: d.skills.length > 0 ? '20px' : '4px', backgroundColor: d.color }} onMouseEnter={() => setHoveredBar(d.level)} onMouseLeave={() => setHoveredBar(null)}>
                      {d.skills.length > 0 && <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-sm font-bold">{d.skills.length}</span>}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                {histogramData.map(d => (
                  <div key={d.level} className="flex-1 text-center">
                    <div className={`text-xs font-bold ${d.bgColor} text-white rounded px-1 py-0.5 mb-1`}>{d.level}</div>
                    <div className="text-xs text-gray-500 leading-tight">{d.label}</div>
                  </div>
                ))}
              </div>
              {hoveredBar && (
                <div className="mt-4 p-3 bg-gray-50 rounded border">
                  <h4 className="font-medium text-sm mb-2">Level {hoveredBar}: {levels[hoveredBar - 1]?.label} ({histogramData[hoveredBar - 1]?.skills.length} skills)</h4>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    {histogramData[hoveredBar - 1]?.skills.map(s => <div key={s.id} className="text-gray-600">• {s.name}</div>)}
                    {histogramData[hoveredBar - 1]?.skills.length === 0 && <div className="text-gray-400 col-span-2">No skills at this level</div>}
                  </div>
                </div>
              )}
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg border text-center"><div className="text-3xl font-bold">{stats.rated}</div><div className="text-xs text-gray-500">Rated</div></div>
              <div className="bg-white p-4 rounded-lg border text-center"><div className="text-3xl font-bold text-red-600">{stats.belowFloor}</div><div className="text-xs text-gray-500">Below Floor</div></div>
              <div className="bg-white p-4 rounded-lg border text-center"><div className="text-3xl font-bold text-yellow-600">{stats.atFloor}</div><div className="text-xs text-gray-500">At Floor</div></div>
              <div className="bg-white p-4 rounded-lg border text-center"><div className="text-3xl font-bold text-green-600">{stats.diff}</div><div className="text-xs text-gray-500">Differentiating</div></div>
            </div>
          </div>
        )}

        {view === 'priority' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border p-4 mb-4">
              <p className="text-sm text-gray-600"><b>Effort Allocation Framework:</b> Don't spend scarce effort raising your floor when you could be raising your ceiling. Focus on <span className="text-red-600 font-medium">Red Zone</span> only to reach viable, then lean into <span className="text-green-600 font-medium">Green Zone</span> strengths.</p>
            </div>
            <div>
              <h3 className="font-bold mb-3 flex items-center gap-2 text-red-600"><AlertTriangle className="w-4 h-4" /> Red Zone: Below Floor ({redZone.length})<span className="text-xs font-normal text-gray-500 ml-2">— Must improve to viable</span></h3>
              {redZone.length === 0 ? <p className="text-sm text-gray-500 bg-green-50 p-3 rounded border border-green-200">✓ No skills below floor!</p> : <div className="space-y-1">{redZone.map(s => <SkillRow key={s.id} skill={s} catId={s.catId} compact />)}</div>}
            </div>
            <div>
              <h3 className="font-bold mb-3 flex items-center gap-2 text-yellow-600"><Target className="w-4 h-4" /> Yellow Zone: At Floor ({yellowZone.length})<span className="text-xs font-normal text-gray-500 ml-2">— Maintain, nudge up selectively</span></h3>
              {yellowZone.length === 0 ? <p className="text-sm text-gray-500">No skills in yellow zone.</p> : <div className="space-y-1">{yellowZone.map(s => <SkillRow key={s.id} skill={s} catId={s.catId} compact />)}</div>}
            </div>
            <div>
              <h3 className="font-bold mb-3 flex items-center gap-2 text-green-600"><Zap className="w-4 h-4" /> Green Zone: Differentiating ({greenZone.length})<span className="text-xs font-normal text-gray-500 ml-2">— Your strengths, lean in here</span></h3>
              {greenZone.length === 0 ? <p className="text-sm text-gray-500">No differentiating skills yet.</p> : <div className="space-y-1">{greenZone.map(s => <SkillRow key={s.id} skill={s} catId={s.catId} compact />)}</div>}
            </div>
          </div>
        )}

        {view === 'categories' && (
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
                      ) : <button onClick={() => setAddingSub(cat.id)} className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"><Plus className="w-3 h-3" /> Add Skill</button>}
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
            ) : <button onClick={() => setAddingCat(true)} className="mt-4 text-blue-600 hover:text-blue-800 flex items-center gap-1"><Plus className="w-4 h-4" /> Add Category</button>}
          </div>
        )}
      </div>
    </div>
  );
}
