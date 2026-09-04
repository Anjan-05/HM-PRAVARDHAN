import React from 'react';
import { Trophy, ShieldCheck, GraduationCap, Scale, BookOpen } from 'lucide-react';
import { HMPravardhanLogo } from './HMPravardhanLogo.tsx';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white text-gray-600 border-t border-gray-200 text-sm mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Project info */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center space-x-2 text-[#1E3A8A] font-bold text-base">
              <div className="w-7 h-7 rounded bg-[#1E3A8A] flex items-center justify-center text-white shadow-xs p-1">
                <HMPravardhanLogo className="w-4 h-4 text-white" />
              </div>
              <span className="tracking-tight">HM Pravardhan</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              An engineering student project designed for Government Schools to evaluate, monitor, compare, and dynamically rank Headmasters based on transparent performance and verified achievements.
            </p>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded bg-gray-50 border border-gray-200 text-gray-700 text-xs font-mono">
              <GraduationCap className="w-3.5 h-3.5 text-[#1E3A8A]" />
              <span>3rd-Year B.Tech Project</span>
            </div>
          </div>

          {/* Col 2: Weighted Formula Summary */}
          <div className="space-y-3">
            <h4 className="text-[#1E3A8A] font-bold text-xs tracking-wider uppercase flex items-center space-x-1.5">
              <Scale className="w-3.5 h-3.5 text-[#1E3A8A]" />
              <span>Scoring Weights (100 pts)</span>
            </h4>
            <ul className="text-xs space-y-1.5 text-gray-600">
              <li className="flex justify-between">
                <span>Academic Performance</span>
                <span className="font-bold text-[#1E3A8A]">30%</span>
              </li>
              <li className="flex justify-between">
                <span>School Management</span>
                <span className="font-bold text-[#1E3A8A]">20%</span>
              </li>
              <li className="flex justify-between">
                <span>Student Development</span>
                <span className="font-bold text-[#1E3A8A]">15%</span>
              </li>
              <li className="flex justify-between">
                <span>Teacher Management</span>
                <span className="font-bold text-[#1E3A8A]">15%</span>
              </li>
              <li className="flex justify-between">
                <span>Infrastructure</span>
                <span className="font-bold text-[#1E3A8A]">10%</span>
              </li>
              <li className="flex justify-between">
                <span>Administrative Performance</span>
                <span className="font-bold text-[#1E3A8A]">10%</span>
              </li>
              <li className="pt-1 border-t border-gray-200 flex justify-between text-gray-800 font-semibold">
                <span>Verified Bonus Credits</span>
                <span className="text-amber-600 font-bold">Max +10 pts</span>
              </li>
            </ul>
          </div>

          {/* Col 3: System Standards */}
          <div className="space-y-3">
            <h4 className="text-[#1E3A8A] font-bold text-xs tracking-wider uppercase flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Platform Governance</span>
            </h4>
            <ul className="text-xs space-y-2 text-gray-600">
              <li>
                <strong className="text-gray-800 font-semibold">Role Isolation:</strong> Public visitors browse schools &amp; rankings without login. Headmasters access only their school.
              </li>
              <li>
                <strong className="text-gray-800 font-semibold">Verified Evidence:</strong> Achievements require Education Officer approval before bonus points apply.
              </li>
              <li>
                <strong className="text-gray-800 font-semibold">Right to Appeal:</strong> Transparent score correction workflow with evidence attachment.
              </li>
            </ul>
          </div>

          {/* Col 4: Testing & Demo Guidelines */}
          <div className="space-y-3">
            <h4 className="text-[#1E3A8A] font-bold text-xs tracking-wider uppercase flex items-center space-x-1.5">
              <BookOpen className="w-3.5 h-3.5 text-amber-600" />
              <span>Demo Testing Roles</span>
            </h4>
            <div className="bg-[#F3F4F6] p-3 rounded-lg border border-gray-200 text-xs space-y-2 font-mono">
              <div>
                <span className="text-[#1E3A8A] font-bold">Education Officer:</span>
                <div className="text-gray-800 font-semibold">officer@govschools.in</div>
                <div className="text-gray-500 text-[11px]">Pass: officer123</div>
              </div>
              <div className="pt-1 border-t border-gray-200">
                <span className="text-[#1E3A8A] font-bold">Headmaster 1:</span>
                <div className="text-gray-800 font-semibold">hm1@govschools.in</div>
                <div className="text-gray-500 text-[11px]">Pass: hm123 (ZPHS Kazipet)</div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500">
          <div>
            HM Pravardhan &bull; Government School Headmaster Development &amp; Ranking Platform &bull; Department of School Education
          </div>
          <div className="mt-2 sm:mt-0">
            Full-Stack Node.js &amp; React Architecture &bull; Dynamic Real-time Calculations
          </div>
        </div>
      </div>
    </footer>
  );
};
