
import React from 'react';
import { ReasoningStep } from '../types';
import { ChevronRight, CheckCircle2, XCircle, Info, BrainCircuit } from 'lucide-react';

interface Props {
  trace: ReasoningStep[];
}

const ReasoningTraceView: React.FC<Props> = ({ trace }) => {
  return (
    <div className="space-y-2 mt-4">
      <h3 className="text-lg font-semibold flex items-center gap-2 text-slate-700">
        <BrainCircuit className="w-5 h-5" />
        Reasoning Trace
      </h3>
      <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 overflow-y-auto max-h-[400px]">
        {trace.map((step, idx) => {
          const Icon = step.type === 'SUCCESS' ? CheckCircle2 : 
                       step.type === 'FAIL' ? XCircle : 
                       step.type === 'MATCH' ? CheckCircle2 :
                       step.type === 'GOAL' ? ChevronRight : Info;
          
          const colors = step.type === 'SUCCESS' ? 'text-green-600' :
                         step.type === 'FAIL' ? 'text-red-500' :
                         step.type === 'GOAL' ? 'text-blue-500' : 'text-slate-600';

          return (
            <div 
              key={idx} 
              className={`flex items-start gap-2 py-1 ${colors}`}
              style={{ marginLeft: `${step.depth * 1.5}rem` }}
            >
              <Icon className="w-4 h-4 mt-1 flex-shrink-0" />
              <div className="text-sm">
                <span className="font-medium">[{step.type}]</span> {step.message}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReasoningTraceView;
