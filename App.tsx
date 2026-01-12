
import React, { useState, useCallback, useMemo } from 'react';
import { Brain, Search, Activity, Stethoscope, AlertTriangle, ShieldAlert, History, MessageSquare, Comparison } from 'lucide-react';
import { SYMPTOMS_LIST, RULES, DISEASES_KB } from './constants';
import { Fact, InferenceMode, ReasoningStep, Predicate } from './types';
import { forwardChain, backwardChain } from './engine/logic';
import { parseSymptoms, explainDiagnosis } from './services/geminiService';
import ReasoningTraceView from './components/ReasoningTraceView';

const App: React.FC = () => {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [naturalLanguageInput, setNaturalLanguageInput] = useState('');
  const [inferenceMode, setInferenceMode] = useState<InferenceMode>('FORWARD');
  const [results, setResults] = useState<{disease: string, trace: ReasoningStep[]}[]>([]);
  const [explanation, setExplanation] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'diagnose' | 'kb'>('diagnose');

  const handleSymptomToggle = (id: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleNLPAnalyze = async () => {
    if (!naturalLanguageInput.trim()) return;
    setLoading(true);
    try {
      const extracted = await parseSymptoms(naturalLanguageInput);
      setSelectedSymptoms(prev => Array.from(new Set([...prev, ...extracted])));
      setNaturalLanguageInput('');
    } finally {
      setLoading(false);
    }
  };

  const runInference = async () => {
    setLoading(true);
    const facts: Fact[] = selectedSymptoms.map(s => ({
      name: 'HasSymptom',
      args: ['User', s],
      source: 'user'
    }));

    let inferenceResults: {disease: string, trace: ReasoningStep[]}[] = [];

    if (inferenceMode === 'FORWARD') {
      const { facts: finalFacts, trace } = forwardChain(facts, RULES);
      inferenceResults = finalFacts
        .filter(f => f.name === 'HasDisease')
        .map(f => ({ disease: f.args[1], trace }));
    } else {
      // Backward Chaining: Try to prove each disease in our KB
      for (const disease of DISEASES_KB) {
        const goal: Predicate = { name: 'HasDisease', args: ['User', disease.name] };
        const { success, trace } = backwardChain(goal, facts, RULES);
        if (success) {
          inferenceResults.push({ disease: disease.name, trace });
        }
      }
    }

    setResults(inferenceResults);
    
    if (inferenceResults.length > 0) {
      const mainResult = inferenceResults[0];
      const traceSummary = mainResult.trace.map(t => t.message).join(' | ').slice(0, 500);
      const aiExplanation = await explainDiagnosis(mainResult.disease, traceSummary);
      setExplanation(aiExplanation);
    } else {
      setExplanation("No definitive diagnosis could be reached based on the current logic rules and provided symptoms.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Brain className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-xl text-slate-800">MediLogic FOL</h1>
            <p className="text-xs text-slate-500">First-Order Logic Medical Inference</p>
          </div>
        </div>
        <nav className="flex gap-4">
          <button 
            onClick={() => setActiveTab('diagnose')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'diagnose' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            Diagnosis Studio
          </button>
          <button 
            onClick={() => setActiveTab('kb')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'kb' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            Knowledge Base
          </button>
        </nav>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {activeTab === 'diagnose' ? (
          <>
            {/* Left Column: Symptom Collection */}
            <section className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  Symptom Entry
                </h2>
                
                {/* Natural Language Input */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Describe symptoms in plain English</label>
                  <div className="relative">
                    <textarea 
                      value={naturalLanguageInput}
                      onChange={(e) => setNaturalLanguageInput(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      placeholder="e.g., I have a high fever, body aches and I feel very tired..."
                      rows={3}
                    />
                    <button 
                      onClick={handleNLPAnalyze}
                      disabled={loading || !naturalLanguageInput}
                      className="absolute bottom-3 right-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white p-2 rounded-md transition"
                    >
                      <Search className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Manual Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Or select from list</label>
                  <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2">
                    {SYMPTOMS_LIST.map(symptom => (
                      <button
                        key={symptom.id}
                        onClick={() => handleSymptomToggle(symptom.id)}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg border text-sm transition ${
                          selectedSymptoms.includes(symptom.id) 
                            ? 'bg-blue-50 border-blue-500 text-blue-700' 
                            : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        {symptom.label}
                        {selectedSymptoms.includes(symptom.id) && <Activity className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-blue-600" />
                  Inference Mode
                </h2>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg">
                  <button
                    onClick={() => setInferenceMode('FORWARD')}
                    className={`px-3 py-2 text-xs font-bold rounded-md transition ${inferenceMode === 'FORWARD' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Forward (Data-Driven)
                  </button>
                  <button
                    onClick={() => setInferenceMode('BACKWARD')}
                    className={`px-3 py-2 text-xs font-bold rounded-md transition ${inferenceMode === 'BACKWARD' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Backward (Goal-Driven)
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-3 px-1 leading-relaxed italic">
                  {inferenceMode === 'FORWARD' 
                    ? "Starting from known facts, the engine applies all applicable rules to see what diseases emerge." 
                    : "The engine defines a goal (a specific disease) and recursively tries to prove the necessary symptoms exist."}
                </p>
                <button
                  onClick={runInference}
                  disabled={selectedSymptoms.length === 0 || loading}
                  className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
                >
                  {loading ? 'Processing...' : 'Run Diagnostics'}
                  <Stethoscope className="w-5 h-5" />
                </button>
              </div>
            </section>

            {/* Right Columns: Results & Trace */}
            <section className="lg:col-span-2 space-y-6">
              {/* Educational Disclaimer */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-4">
                <ShieldAlert className="w-6 h-6 text-amber-600 flex-shrink-0" />
                <div className="text-sm text-amber-800 leading-relaxed">
                  <span className="font-bold">Educational Demonstration:</span> This system is based on classical First-Order Logic. It is for academic demonstration only and <span className="underline">not a medical device</span>. Always consult a professional for actual medical concerns.
                </div>
              </div>

              {/* Inference Results */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 min-h-[400px]">
                {!results.length && !loading ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 py-20">
                    <AlertTriangle className="w-12 h-12 mb-4 opacity-20" />
                    <p>Enter symptoms and run the engine to see diagnostics.</p>
                  </div>
                ) : (
                  <div className="space-y-8 animate-in fade-in duration-500">
                    {/* Diagnosis Summary */}
                    <div>
                      <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-4">
                        Diagnostic Results
                        <span className="text-xs font-normal px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                          {inferenceMode} Mode
                        </span>
                      </h2>
                      
                      {results.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {results.map((res, i) => (
                            <div key={i} className="p-4 rounded-xl border-2 border-green-100 bg-green-50/50 flex items-center justify-between">
                              <div>
                                <span className="text-xs text-green-700 font-semibold uppercase tracking-wider">Potential Match</span>
                                <h3 className="text-lg font-bold text-slate-900">{res.disease}</h3>
                              </div>
                              <CheckCircle2 className="w-8 h-8 text-green-500" />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-600">
                          No disease matches found in current logic rules.
                        </div>
                      )}
                    </div>

                    {/* AI Explanation */}
                    {explanation && (
                      <div className="bg-blue-50/30 border border-blue-100 rounded-xl p-5">
                        <h3 className="text-sm font-bold text-blue-800 uppercase tracking-tight mb-2">System Explanation</h3>
                        <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{explanation}</p>
                      </div>
                    )}

                    {/* Reasoning Trace Component */}
                    {results.length > 0 && (
                      <ReasoningTraceView trace={results[0].trace} />
                    )}
                  </div>
                )}
              </div>
            </section>
          </>
        ) : (
          <section className="lg:col-span-3 space-y-6">
             <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-2xl font-bold mb-6 text-slate-800 flex items-center gap-2">
                  <Brain className="w-7 h-7 text-blue-600" />
                  Medical Knowledge Base (FOL)
                </h2>
                
                <div className="space-y-10">
                  {/* Diseases Knowledge */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-700 mb-4 border-b pb-2">Configured Diseases</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {DISEASES_KB.map(d => (
                        <div key={d.id} className="border border-slate-200 rounded-xl p-4 hover:shadow-md transition">
                          <h4 className="font-bold text-blue-700 text-lg mb-2">{d.name}</h4>
                          <div className="space-y-3">
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase">Required Symptoms</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {d.requiredSymptoms.map(s => <span key={s} className="bg-slate-100 px-2 py-0.5 rounded text-[11px] text-slate-600">{s}</span>)}
                              </div>
                            </div>
                            {d.exclusions.length > 0 && (
                              <div>
                                <span className="text-[10px] font-bold text-red-400 uppercase">Exclusions</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {d.exclusions.map(s => <span key={s} className="bg-red-50 px-2 py-0.5 rounded text-[11px] text-red-600 font-medium">{s}</span>)}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Logic Rules (Horn Clauses) */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-700 mb-4 border-b pb-2">Inference Rules (Horn Clauses)</h3>
                    <div className="bg-slate-900 rounded-xl p-6 text-slate-300 font-mono text-sm overflow-x-auto shadow-inner">
                      {RULES.map(rule => (
                        <div key={rule.id} className="mb-4 last:mb-0 border-l-2 border-blue-500 pl-4 py-1">
                          <div className="text-blue-400 font-bold text-xs mb-1">// {rule.name}: {rule.description}</div>
                          <div className="flex flex-wrap items-center gap-2">
                            {rule.antecedents.map((ant, idx) => (
                              <React.Fragment key={idx}>
                                <span>{ant.name}({ant.args.join(', ')})</span>
                                {idx < rule.antecedents.length - 1 && <span className="text-blue-500">∧</span>}
                              </React.Fragment>
                            ))}
                            <span className="text-blue-500 px-1">⇒</span>
                            <span className="text-green-400">{rule.consequent.name}({rule.consequent.args.join(', ')})</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
             </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 px-10 text-center text-slate-500 text-xs">
        <p>© 2024 FOL Medical Inference Engine Project. Educational Purposes Only. Powered by Google Gemini.</p>
      </footer>
    </div>
  );
};

export default App;

// Helper icons
const CheckCircle2 = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
);
