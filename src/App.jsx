import React, { useState, useEffect, useRef, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { BarChart3, Brain, Calculator, TrendingUp, Users, Target, Briefcase, PieChart, MessageSquare, Building2, FileText, ChevronDown, ChevronRight, Plus, X, Edit3, AlertTriangle, Star, Zap, RefreshCw, Settings, LogIn, LogOut, Layers, Clock, ClipboardList, Play, CheckCircle } from 'lucide-react';

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

// Convert 1-10 score to 1-7 level
const scoreToLevel = (score) => {
  if (score <= 2) return 1;
  if (score <= 4) return 2;
  if (score <= 5) return 3;
  if (score <= 6) return 4;
  if (score <= 7) return 5;
  if (score <= 8) return 6;
  return 7;
};

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

// Mobile-optimized modal for rating
function RatingModal({ skill, catId, onSubmit, onClose }) {
  const [text, setText] = useState('');
  const inputRef = useRef(null);
  
  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (level) => {
    if (!text.trim()) return;
    onSubmit(catId, skill.id, level, text.trim(), skill.evidence || []);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full sm:max-w-lg sm:rounded-xl rounded-t-xl max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h3 className="font-bold text-lg">Rate: {skill.name}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Evidence (required)</label>
            <input ref={inputRef} type="text" value={text} onChange={(e) => setText(e.target.value)} placeholder="What justifies this rating?" className="w-full p-4 border-2 rounded-xl text-base focus:border-blue-500 focus:outline-none" autoComplete="off" autoCorrect="off" spellCheck="false" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Level</label>
            <div className="grid grid-cols-7 gap-2">
              {levels.map(l => (
                <button key={l.value} onClick={() => handleSubmit(l.value)} disabled={!text.trim()} className={`py-4 rounded-xl text-lg font-bold ${l.color} text-white ${!text.trim() ? 'opacity-30' : 'active:scale-95'} transition-transform`}>{l.value}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Mobile-optimized modal for editing
function EditModal({ skill, catId, onSave, onClose }) {
  const [notes, setNotes] = useState(skill.notes || '');
  const [floor, setFloor] = useState(skill.floor);
  const [diffBar, setDiffBar] = useState(skill.diffBar);
  const [highWeight, setHighWeight] = useState(skill.highWeight);

  const handleSave = () => {
    onSave(catId, skill.id, { notes, floor, diffBar, highWeight });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full sm:max-w-lg sm:rounded-xl rounded-t-xl max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h3 className="font-bold text-lg">Edit: {skill.name}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Floor</label>
              <select value={floor} onChange={e => setFloor(Number(e.target.value))} className="w-full p-3 border-2 rounded-xl text-base">{[1,2,3,4,5,6,7].map(n => <option key={n} value={n}>{n}</option>)}</select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Diff Bar</label>
              <select value={diffBar} onChange={e => setDiffBar(Number(e.target.value))} className="w-full p-3 border-2 rounded-xl text-base">{[1,2,3,4,5,6,7].map(n => <option key={n} value={n}>{n}</option>)}</select>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <input type="checkbox" id="highWeight" checked={highWeight} onChange={e => setHighWeight(e.target.checked)} className="w-5 h-5" />
            <label htmlFor="highWeight" className="text-base">High Weight</label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes (save questions here)</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Paste specific questions to practice..." className="w-full p-4 border-2 rounded-xl text-base focus:border-blue-500 focus:outline-none" rows={4} />
          </div>
          <button onClick={handleSave} className="w-full py-4 bg-blue-600 text-white rounded-xl text-lg font-medium active:bg-blue-700">Save</button>
        </div>
      </div>
    </div>
  );
}

// Mock Interview Session Modal
function MockSessionModal({ categories, onSave, onClose }) {
  const [step, setStep] = useState('setup'); // setup, logging, review
  const [sessionName, setSessionName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [overallScore, setOverallScore] = useState('');
  const [questions, setQuestions] = useState([{ skillId: '', question: '', score: '' }]);
  
  const categorySkills = selectedCategory ? categories.find(c => c.id === selectedCategory)?.subcategories || [] : [];
  const allSkills = categories.flatMap(c => c.subcategories.map(s => ({ ...s, catId: c.id, catName: c.name })));

  const addQuestion = () => setQuestions([...questions, { skillId: '', question: '', score: '' }]);
  const updateQuestion = (idx, field, value) => {
    const updated = [...questions];
    updated[idx][field] = value;
    setQuestions(updated);
  };
  const removeQuestion = (idx) => setQuestions(questions.filter((_, i) => i !== idx));

  const handleSubmit = () => {
    const timestamp = new Date().toISOString();
    const date = new Date().toLocaleDateString();
    
    // Build session record
    const session = {
      id: Date.now(),
      name: sessionName || `Mock - ${selectedCategory ? categories.find(c => c.id === selectedCategory)?.name : 'Mixed'}`,
      date,
      timestamp,
      category: selectedCategory,
      overallScore: overallScore ? Number(overallScore) : null,
      questions: questions.filter(q => q.skillId && q.score).map(q => ({
        skillId: q.skillId,
        question: q.question,
        score: Number(q.score),
        level: scoreToLevel(Number(q.score))
      }))
    };

    // Build skill updates (evidence entries)
    const skillUpdates = {};
    questions.forEach(q => {
      if (q.skillId && q.score) {
        const skill = allSkills.find(s => s.id === q.skillId);
        if (skill) {
          const level = scoreToLevel(Number(q.score));
          const evidenceText = `Mock: ${q.score}/10${q.question ? ` - "${q.question}"` : ''}`;
          skillUpdates[q.skillId] = {
            catId: skill.catId,
            level,
            evidence: { text: evidenceText, level, date, timestamp, mockSessionId: session.id }
          };
        }
      }
    });

    onSave(session, skillUpdates);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full sm:max-w-lg sm:rounded-xl rounded-t-xl max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center z-10">
          <h3 className="font-bold text-lg flex items-center gap-2"><ClipboardList className="w-5 h-5" /> Log Mock Session</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
        </div>
        
        <div className="p-4 space-y-4">
          {/* Session Info */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Session Name (optional)</label>
            <input type="text" value={sessionName} onChange={e => setSessionName(e.target.value)} placeholder="e.g., Accounting Deep Dive" className="w-full p-3 border-2 rounded-xl text-base" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category Focus</label>
              <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="w-full p-3 border-2 rounded-xl text-base">
                <option value="">Mixed/All</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Overall Score</label>
              <input type="number" min="1" max="10" value={overallScore} onChange={e => setOverallScore(e.target.value)} placeholder="/10" className="w-full p-3 border-2 rounded-xl text-base" />
            </div>
          </div>

          {/* Questions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Questions ({questions.length})</label>
            <div className="space-y-3">
              {questions.map((q, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-xl space-y-2">
                  <div className="flex gap-2">
                    <select value={q.skillId} onChange={e => updateQuestion(idx, 'skillId', e.target.value)} className="flex-1 p-2 border rounded-lg text-sm">
                      <option value="">Select skill...</option>
                      {(selectedCategory ? categorySkills : allSkills).map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                    <input type="number" min="1" max="10" value={q.score} onChange={e => updateQuestion(idx, 'score', e.target.value)} placeholder="/10" className="w-16 p-2 border rounded-lg text-sm text-center" />
                    {questions.length > 1 && (
                      <button onClick={() => removeQuestion(idx)} className="p-2 text-red-500"><X className="w-4 h-4" /></button>
                    )}
                  </div>
                  <input type="text" value={q.question} onChange={e => updateQuestion(idx, 'question', e.target.value)} placeholder="Question text (for notes)" className="w-full p-2 border rounded-lg text-sm" />
                  {q.score && (
                    <div className="text-xs text-gray-500">→ Level {scoreToLevel(Number(q.score))} ({levels[scoreToLevel(Number(q.score)) - 1]?.label})</div>
                  )}
                </div>
              ))}
            </div>
            <button onClick={addQuestion} className="mt-2 text-blue-600 text-sm flex items-center gap-1"><Plus className="w-4 h-4" /> Add Question</button>
          </div>

          <button onClick={handleSubmit} disabled={!questions.some(q => q.skillId && q.score)} className="w-full py-4 bg-green-600 text-white rounded-xl text-lg font-medium active:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            <CheckCircle className="w-5 h-5" /> Save Session & Update Skills
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [categories, setCategories] = useState(initialData);
  const [mockSessions, setMockSessions] = useState([]);
  const [view, setView] = useState('histogram');
  const [saveStatus, setSaveStatus] = useState('idle');
  const [lastSaved, setLastSaved] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({ background_fit: true });
  const [ratingModal, setRatingModal] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [mockModal, setMockModal] = useState(false);
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
            if (data.mockSessions) setMockSessions(data.mockSessions);
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
            if (parsed.mockSessions) setMockSessions(parsed.mockSessions);
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
      const data = { categories, mockSessions, defaultFloor, lastSaved: new Date().toISOString() };
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
  }, [categories, mockSessions, defaultFloor, loading, authLoading, user]);

  const handleSignIn = async () => {
    try { await signInWithPopup(auth, googleProvider); } catch (e) { console.error('Sign in error:', e); }
  };
  const handleSignOut = async () => {
    try { await signOut(auth); setCategories(initialData); setMockSessions([]); setDefaultFloor(4); } catch (e) { console.error('Sign out error:', e); }
  };

  const exportData = () => {
    const data = { categories, mockSessions, defaultFloor, exportDate: new Date().toISOString() };
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
        if (data.categories) { 
          setCategories(data.categories); 
          if (data.mockSessions) setMockSessions(data.mockSessions);
          if (data.defaultFloor) setDefaultFloor(data.defaultFloor); 
          alert('Data imported!'); 
        } else { alert('Invalid file'); }
      } catch (err) { alert('Error reading file'); }
    };
    reader.readAsText(file); e.target.value = '';
  };

  const allSkills = categories.flatMap(c => c.subcategories.map(s => ({ ...s, catId: c.id, catName: c.name })));
  const ratedSkills = allSkills.filter(s => s.level !== null);

  const updateSkill = useCallback((catId, skillId, updates) => {
    setCategories(prev => prev.map(c => c.id === catId ? { ...c, subcategories: c.subcategories.map(s => s.id === skillId ? { ...s, ...updates } : s) } : c));
  }, []);

  const submitRating = useCallback((catId, skillId, level, text, existingEvidence) => {
    const newEvidence = { text, level, date: new Date().toLocaleDateString(), timestamp: new Date().toISOString() };
    updateSkill(catId, skillId, { level, evidence: [...existingEvidence, newEvidence] });
    setRatingModal(null);
  }, [updateSkill]);

  const saveMockSession = useCallback((session, skillUpdates) => {
    // Save the session
    setMockSessions(prev => [session, ...prev]);
    
    // Update all the skills with new evidence
    Object.entries(skillUpdates).forEach(([skillId, update]) => {
      setCategories(prev => prev.map(c => c.id === update.catId ? {
        ...c,
        subcategories: c.subcategories.map(s => s.id === skillId ? {
          ...s,
          level: update.level,
          evidence: [...(s.evidence || []), update.evidence]
        } : s)
      } : c));
    });
  }, []);

  const deleteSkill = (catId, skillId) => setCategories(prev => prev.map(c => c.id === catId ? { ...c, subcategories: c.subcategories.filter(s => s.id !== skillId) } : c));
  const deleteCategory = (catId) => setCategories(prev => prev.filter(c => c.id !== catId));
  const deleteMockSession = (sessionId) => setMockSessions(prev => prev.filter(s => s.id !== sessionId));

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
    total: allSkills.length, rated: ratedSkills.length,
    belowFloor: ratedSkills.filter(s => s.level < s.floor).length,
    atFloor: ratedSkills.filter(s => s.level >= s.floor && s.level < s.diffBar).length,
    diff: ratedSkills.filter(s => s.level >= s.diffBar).length,
    avgLevel: ratedSkills.length > 0 ? (ratedSkills.reduce((sum, s) => sum + s.level, 0) / ratedSkills.length).toFixed(1) : '-'
  };

  const redZone = ratedSkills.filter(s => s.level < s.floor).sort((a, b) => (b.floor - b.level) - (a.floor - a.level));
  const yellowZone = ratedSkills.filter(s => s.level >= s.floor && s.level < s.diffBar);
  const greenZone = ratedSkills.filter(s => s.level >= s.diffBar);

  const allEvidence = allSkills.flatMap(s => (s.evidence || []).map(e => ({ ...e, skillName: s.name, skillId: s.id, catId: s.catId, catName: s.catName }))).sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
  const skillsWithProgress = allSkills.filter(s => s.evidence && s.evidence.length > 1).map(s => ({ ...s, firstLevel: s.evidence[0].level, lastLevel: s.evidence[s.evidence.length - 1].level, trend: s.evidence[s.evidence.length - 1].level - s.evidence[0].level, entries: s.evidence.length })).sort((a, b) => b.entries - a.entries);

  const SkillCard = ({ skill, catId, compact }) => {
    const zone = getZone(skill);
    if (compact) {
      return (
        <div onClick={() => setRatingModal({ skill, catId })} className={`flex items-center gap-2 p-3 rounded-xl border-2 active:scale-[0.98] transition-transform ${zone === 'red' ? 'bg-red-50 border-red-200' : zone === 'green' ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
          <span className={`px-2 py-1 rounded-lg ${levels[skill.level - 1]?.color} text-white font-bold text-sm`}>{skill.level}</span>
          <span className="font-medium text-sm flex-1">{skill.name}</span>
          {zone === 'red' && <span className="text-xs text-red-600 font-medium bg-red-100 px-2 py-1 rounded">-{skill.floor - skill.level}</span>}
        </div>
      );
    }
    return (
      <div className={`border-2 rounded-xl mb-3 p-4 ${zone === 'red' ? 'border-red-300 bg-red-50' : zone === 'green' ? 'border-green-300 bg-green-50' : zone === 'yellow' ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200 bg-white'}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="font-medium text-base truncate">{skill.name}</span>
            {skill.highWeight && <Star className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={() => setEditModal({ skill, catId })} className="p-2 hover:bg-white/50 rounded-lg"><Edit3 className="w-4 h-4 text-gray-400" /></button>
            <button onClick={() => deleteSkill(catId, skill.id)} className="p-2 hover:bg-white/50 rounded-lg"><X className="w-4 h-4 text-gray-400" /></button>
          </div>
        </div>
        <div className="flex gap-1 mb-3">
          {levels.map(l => (
            <div key={l.value} className={`flex-1 h-10 rounded-lg text-sm font-bold flex items-center justify-center ${skill.level === l.value ? l.color + ' text-white ring-2 ring-offset-2 ring-gray-800' : skill.level !== null && skill.level > l.value ? l.color + ' text-white/60' : 'bg-gray-200 text-gray-400'}`}>{l.value}</div>
          ))}
        </div>
        <div className="flex justify-between items-center">
          <div className="text-xs text-gray-500">Floor: <b className="text-orange-600">{skill.floor}</b> | Diff: <b className="text-emerald-600">{skill.diffBar}</b></div>
          <button onClick={() => setRatingModal({ skill, catId })} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium active:bg-blue-700">Rate</button>
        </div>
        {skill.notes && <div className="mt-3 text-sm text-gray-600 bg-white/50 p-2 rounded-lg">{skill.notes}</div>}
        {skill.evidence?.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200 text-sm text-gray-500">
            <div className="text-xs text-gray-400 mb-2">{skill.evidence.length} rating{skill.evidence.length > 1 ? 's' : ''}</div>
            {skill.evidence.slice(-1).map((e, i) => (
              <div key={i} className="flex gap-2"><span className={`px-1.5 py-0.5 rounded ${levels[e.level - 1]?.color} text-white font-bold text-xs`}>{e.level}</span><span className="flex-1 truncate">{e.text}</span></div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading || authLoading) return <div className="min-h-screen flex items-center justify-center"><RefreshCw className="w-8 h-8 animate-spin text-blue-500" /></div>;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Modals */}
      {ratingModal && <RatingModal skill={ratingModal.skill} catId={ratingModal.catId} onSubmit={submitRating} onClose={() => setRatingModal(null)} />}
      {editModal && <EditModal skill={editModal.skill} catId={editModal.catId} onSave={updateSkill} onClose={() => setEditModal(null)} />}
      {mockModal && <MockSessionModal categories={categories} onSave={saveMockSession} onClose={() => setMockModal(false)} />}

      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-4">
        <div className="flex justify-between items-center">
          <div className="min-w-0">
            <h1 className="text-lg font-bold flex items-center gap-2 truncate"><Briefcase className="w-5 h-5 shrink-0" /> Competency Tracker</h1>
            <p className="text-xs text-slate-400 truncate">YLF University of Utah Chapter</p>
          </div>
          <div className="flex gap-2 items-center shrink-0">
            {user ? (
              <button onClick={handleSignOut} className="text-xs text-slate-400 p-2"><LogOut className="w-4 h-4" /></button>
            ) : (
              <button onClick={handleSignIn} className="text-xs bg-white text-slate-800 px-3 py-2 rounded-lg flex items-center gap-1"><LogIn className="w-4 h-4" /></button>
            )}
            <button onClick={() => setShowSettings(s => !s)} className="p-2"><Settings className="w-4 h-4 text-slate-400" /></button>
          </div>
        </div>
        {!user && <div className="mt-2 bg-slate-700/50 rounded-lg p-2 text-xs text-slate-300">⚠️ Sign in to sync across devices</div>}
      </div>

      {/* Settings */}
      {showSettings && (
        <div className="bg-white border-b p-4">
          <h3 className="font-bold mb-3">Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Default Floor</span>
              <select value={defaultFloor} onChange={e => setDefaultFloor(Number(e.target.value))} className="border rounded-lg px-3 py-2">{[1,2,3,4,5,6,7].map(n => <option key={n} value={n}>{n}</option>)}</select>
            </div>
            <div><span className="text-sm block mb-2">Set All Floors</span><div className="flex gap-2">{[1,2,3,4,5,6,7].map(n => <button key={n} onClick={() => setAllFloors(n)} className="flex-1 py-2 border rounded-lg active:bg-gray-100">{n}</button>)}</div></div>
            <div className="flex gap-4">
              <button onClick={exportData} className="text-blue-600 text-sm">Export</button>
              <label className="text-blue-600 text-sm cursor-pointer">Import<input type="file" accept=".json" onChange={importData} className="hidden" /></label>
            </div>
            <button onClick={() => setShowReset(true)} className="text-red-600 text-sm">Reset All</button>
            {user && <div className="text-xs text-gray-500 truncate">Signed in: {user.email}</div>}
          </div>
        </div>
      )}

      {/* Reset Modal */}
      {showReset && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full">
            <h3 className="font-bold text-lg mb-2">Reset All Progress?</h3>
            <p className="text-gray-600 mb-4">This clears all ratings, evidence, and mock sessions.</p>
            <div className="flex gap-3">
              <button onClick={() => { setCategories(initialData); setMockSessions([]); setShowReset(false); }} className="flex-1 bg-red-600 text-white py-3 rounded-xl font-medium">Reset</button>
              <button onClick={() => setShowReset(false)} className="flex-1 border-2 py-3 rounded-xl font-medium">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Mock Session Button - Floating */}
      <button onClick={() => setMockModal(true)} className="fixed bottom-24 right-4 z-40 bg-green-600 text-white p-4 rounded-full shadow-lg active:bg-green-700 flex items-center gap-2">
        <Play className="w-6 h-6" />
      </button>

      {/* Tabs */}
      <div className="flex bg-white border-b sticky top-0 z-10">
        {[{ id: 'histogram', icon: BarChart3 }, { id: 'priority', icon: Target }, { id: 'categories', icon: Layers }, { id: 'mocks', icon: ClipboardList }, { id: 'timeline', icon: Clock }].map(v => (
          <button key={v.id} onClick={() => setView(v.id)} className={`flex-1 py-3 flex flex-col items-center gap-0.5 ${view === v.id ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400'}`}>
            <v.icon className="w-5 h-5" />
            <span className="text-[10px] capitalize">{v.id}</span>
          </button>
        ))}
      </div>

      {/* Stats Bar */}
      <div className="p-3 bg-white border-b flex justify-between items-center text-xs">
        <div className="flex gap-3">
          <span><b>{stats.rated}</b>/{stats.total}</span>
          <span className="text-red-600"><b>{stats.belowFloor}</b> red</span>
          <span className="text-yellow-600"><b>{stats.atFloor}</b> yel</span>
          <span className="text-green-600"><b>{stats.diff}</b> grn</span>
        </div>
        <div className="text-gray-500">
          {saveStatus === 'saving' && '💾'}{saveStatus === 'saved' && '✓'}{saveStatus === 'error' && '⚠️'}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pb-32">
        {view === 'histogram' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-4">
              <h3 className="font-bold mb-4">Distribution</h3>
              <div className="flex items-end gap-1 h-40 mb-2">
                {histogramData.map(d => (
                  <div key={d.level} className="flex-1 flex flex-col items-center">
                    <span className="text-xs font-bold mb-1">{d.skills.length || ''}</span>
                    <div className="w-full rounded-t-lg" style={{ height: `${(d.skills.length / maxHistogramCount) * 100}%`, minHeight: '4px', backgroundColor: d.color }} />
                  </div>
                ))}
              </div>
              <div className="flex gap-1">{levels.map(l => (<div key={l.value} className={`flex-1 text-center text-xs font-bold ${l.color} text-white rounded py-1`}>{l.value}</div>))}</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-4 rounded-xl text-center"><div className="text-2xl font-bold">{stats.rated}</div><div className="text-xs text-gray-500">Rated</div></div>
              <div className="bg-white p-4 rounded-xl text-center"><div className="text-2xl font-bold text-red-600">{stats.belowFloor}</div><div className="text-xs text-gray-500">Below Floor</div></div>
              <div className="bg-white p-4 rounded-xl text-center"><div className="text-2xl font-bold text-yellow-600">{stats.atFloor}</div><div className="text-xs text-gray-500">At Floor</div></div>
              <div className="bg-white p-4 rounded-xl text-center"><div className="text-2xl font-bold text-green-600">{stats.diff}</div><div className="text-xs text-gray-500">Differentiating</div></div>
            </div>
            <div className="bg-white p-4 rounded-xl text-center">
              <div className="text-2xl font-bold">{mockSessions.length}</div>
              <div className="text-xs text-gray-500">Mock Sessions</div>
            </div>
          </div>
        )}

        {view === 'priority' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-4 text-sm text-gray-600">Focus on <span className="text-red-600 font-bold">Red</span> to viable, then lean into <span className="text-green-600 font-bold">Green</span>.</div>
            <div>
              <h3 className="font-bold mb-3 text-red-600 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Red ({redZone.length})</h3>
              {redZone.length === 0 ? <div className="bg-green-50 text-green-700 p-4 rounded-xl">✓ None below floor!</div> : <div className="space-y-2">{redZone.map(s => <SkillCard key={s.id} skill={s} catId={s.catId} compact />)}</div>}
            </div>
            <div>
              <h3 className="font-bold mb-3 text-yellow-600 flex items-center gap-2"><Target className="w-4 h-4" /> Yellow ({yellowZone.length})</h3>
              {yellowZone.length === 0 ? <div className="text-gray-500 text-sm">None</div> : <div className="space-y-2">{yellowZone.map(s => <SkillCard key={s.id} skill={s} catId={s.catId} compact />)}</div>}
            </div>
            <div>
              <h3 className="font-bold mb-3 text-green-600 flex items-center gap-2"><Zap className="w-4 h-4" /> Green ({greenZone.length})</h3>
              {greenZone.length === 0 ? <div className="text-gray-500 text-sm">None yet</div> : <div className="space-y-2">{greenZone.map(s => <SkillCard key={s.id} skill={s} catId={s.catId} compact />)}</div>}
            </div>
          </div>
        )}

        {view === 'categories' && (
          <div className="space-y-3">
            {categories.map(cat => {
              const Icon = iconMap[cat.icon] || iconMap.default;
              const isExpanded = expanded[cat.id];
              const rated = cat.subcategories.filter(s => s.level !== null).length;
              const belowFloor = cat.subcategories.filter(s => s.level !== null && s.level < s.floor).length;
              return (
                <div key={cat.id} className="bg-white rounded-xl overflow-hidden">
                  <div onClick={() => setExpanded(p => ({ ...p, [cat.id]: !p[cat.id] }))} className="flex items-center justify-between p-4 active:bg-gray-50">
                    <div className="flex items-center gap-3 min-w-0">
                      {isExpanded ? <ChevronDown className="w-5 h-5 shrink-0" /> : <ChevronRight className="w-5 h-5 shrink-0" />}
                      <Icon className="w-5 h-5 text-slate-600 shrink-0" />
                      <span className="font-medium truncate">{cat.name}</span>
                      <span className="text-xs text-gray-400 shrink-0">{rated}/{cat.subcategories.length}</span>
                      {belowFloor > 0 && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full shrink-0">{belowFloor}</span>}
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-3">
                      {cat.subcategories.map(skill => <SkillCard key={skill.id} skill={skill} catId={cat.id} />)}
                      {addingSub === cat.id ? (
                        <div className="flex gap-2">
                          <input type="text" placeholder="Skill name" value={newName} onChange={e => setNewName(e.target.value)} className="flex-1 p-3 border-2 rounded-xl" autoFocus />
                          <button onClick={() => addSubcategory(cat.id)} className="px-4 bg-blue-600 text-white rounded-xl">Add</button>
                          <button onClick={() => { setAddingSub(null); setNewName(''); }} className="px-4 border-2 rounded-xl">✕</button>
                        </div>
                      ) : <button onClick={() => setAddingSub(cat.id)} className="text-blue-600 text-sm flex items-center gap-1"><Plus className="w-4 h-4" /> Add Skill</button>}
                    </div>
                  )}
                </div>
              );
            })}
            {addingCat ? (
              <div className="flex gap-2">
                <input type="text" placeholder="Category name" value={newName} onChange={e => setNewName(e.target.value)} className="flex-1 p-3 border-2 rounded-xl" autoFocus />
                <button onClick={addCategory} className="px-4 bg-blue-600 text-white rounded-xl">Add</button>
                <button onClick={() => { setAddingCat(false); setNewName(''); }} className="px-4 border-2 rounded-xl">✕</button>
              </div>
            ) : <button onClick={() => setAddingCat(true)} className="text-blue-600 flex items-center gap-1"><Plus className="w-4 h-4" /> Add Category</button>}
          </div>
        )}

        {view === 'mocks' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold flex items-center gap-2"><ClipboardList className="w-5 h-5" /> Mock Sessions</h3>
                <button onClick={() => setMockModal(true)} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium flex items-center gap-2"><Play className="w-4 h-4" /> Log Session</button>
              </div>
              <p className="text-sm text-gray-600 mb-4">Log mock interview sessions from your practice platform. Scores auto-convert to skill levels and track your progress.</p>
              <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500">
                <div className="font-medium mb-1">Score → Level Mapping:</div>
                <div className="grid grid-cols-4 gap-1">
                  <span>1-2 → L1</span><span>3-4 → L2</span><span>5 → L3</span><span>6 → L4</span>
                  <span>7 → L5</span><span>8 → L6</span><span>9-10 → L7</span>
                </div>
              </div>
            </div>
            
            {mockSessions.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center text-gray-500">
                <ClipboardList className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No mock sessions yet</p>
                <p className="text-sm">Tap the green button to log your first one!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {mockSessions.map(session => (
                  <div key={session.id} className="bg-white rounded-xl p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium">{session.name}</div>
                        <div className="text-xs text-gray-500">{session.date} • {session.questions.length} questions</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {session.overallScore && (
                          <span className="text-lg font-bold text-blue-600">{session.overallScore}/10</span>
                        )}
                        <button onClick={() => deleteMockSession(session.id)} className="p-1 text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {session.questions.slice(0, 3).map((q, i) => {
                        const skill = allSkills.find(s => s.id === q.skillId);
                        return (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <span className={`px-1.5 py-0.5 rounded ${levels[q.level - 1]?.color} text-white font-bold text-xs`}>{q.score}</span>
                            <span className="truncate text-gray-600">{skill?.name || 'Unknown'}</span>
                          </div>
                        );
                      })}
                      {session.questions.length > 3 && <div className="text-xs text-gray-400">+{session.questions.length - 3} more</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {view === 'timeline' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-4">
              <h3 className="font-bold mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Progress</h3>
              {skillsWithProgress.length === 0 ? <p className="text-sm text-gray-500">No skills with multiple ratings yet.</p> : (
                <div className="space-y-3">
                  {skillsWithProgress.slice(0, 10).map(s => (
                    <div key={s.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="flex-1 min-w-0"><div className="font-medium text-sm truncate">{s.name}</div><div className="text-xs text-gray-500">{s.entries} ratings</div></div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`px-2 py-1 rounded ${levels[s.firstLevel - 1]?.color} text-white font-bold text-xs`}>{s.firstLevel}</span>
                        <span>→</span>
                        <span className={`px-2 py-1 rounded ${levels[s.lastLevel - 1]?.color} text-white font-bold text-xs`}>{s.lastLevel}</span>
                        <span className={`text-sm font-bold ${s.trend > 0 ? 'text-green-600' : s.trend < 0 ? 'text-red-600' : 'text-gray-400'}`}>{s.trend > 0 ? `+${s.trend}` : s.trend}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="bg-white rounded-xl p-4">
              <h3 className="font-bold mb-4 flex items-center gap-2"><Clock className="w-4 h-4" /> Recent</h3>
              {allEvidence.length === 0 ? <p className="text-sm text-gray-500">No activity yet.</p> : (
                <div className="space-y-3">
                  {allEvidence.slice(0, 15).map((e, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <span className={`px-2 py-1 rounded ${levels[e.level - 1]?.color} text-white font-bold text-xs shrink-0`}>{e.level}</span>
                      <div className="flex-1 min-w-0"><div className="font-medium text-sm truncate">{e.skillName}</div><div className="text-xs text-gray-600 truncate">{e.text}</div><div className="text-xs text-gray-400 mt-1">{e.date}</div></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
