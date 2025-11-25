'use client';

import React from 'react';
import { Users, FileText, RefreshCw, Database, Clock } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import type { CalculatorInputs } from './TimeSavingsPage';

interface SavingsCalculatorProps {
  inputs: CalculatorInputs;
  setInputs: React.Dispatch<React.SetStateAction<CalculatorInputs>>;
  onCalculate: () => void;
}

export default function SavingsCalculator({
  inputs,
  setInputs,
  onCalculate,
}: SavingsCalculatorProps) {
  const updateInput = (key: keyof CalculatorInputs, value: number) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 md:p-8 shadow-sm">
      <div className="space-y-8">
        {/* Team Size */}
        <div className="border-b border-slate-100 pb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-violet-100 rounded-lg p-2">
              <Users className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Team Size</h3>
              <p className="text-sm text-slate-500">Number of people creating content</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="number"
              min={1}
              max={50}
              value={inputs.teamSize}
              onChange={(e) => updateInput('teamSize', Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
              className="w-24 px-3 py-2 border border-slate-300 rounded-lg text-center font-mono text-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
            <span className="text-slate-600">people</span>
          </div>
        </div>

        {/* New Articles */}
        <div className="border-b border-slate-100 pb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-emerald-100 rounded-lg p-2">
              <FileText className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">New Articles</h3>
              <p className="text-sm text-slate-500">Fresh content created from scratch</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Articles per week
              </label>
              <input
                type="number"
                min={0}
                max={500}
                value={inputs.newArticles}
                onChange={(e) => updateInput('newArticles', Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Time per article: <span className="text-violet-600 font-semibold">{inputs.newTime} min</span>
              </label>
              <div className="pt-2">
                <Slider
                  value={[inputs.newTime]}
                  onValueChange={(value) => updateInput('newTime', value[0])}
                  min={5}
                  max={120}
                  step={5}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>5 min</span>
                <span>120 min</span>
              </div>
            </div>
          </div>
        </div>

        {/* Update/Repeat Articles */}
        <div className="border-b border-slate-100 pb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 rounded-lg p-2">
              <RefreshCw className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Update/Repeat Articles</h3>
              <p className="text-sm text-slate-500">Refreshing existing content with new data</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Updates per week
              </label>
              <input
                type="number"
                min={0}
                max={500}
                value={inputs.updateArticles}
                onChange={(e) => updateInput('updateArticles', Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Time per update: <span className="text-violet-600 font-semibold">{inputs.updateTime} min</span>
              </label>
              <div className="pt-2">
                <Slider
                  value={[inputs.updateTime]}
                  onValueChange={(value) => updateInput('updateTime', value[0])}
                  min={5}
                  max={60}
                  step={5}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>5 min</span>
                <span>60 min</span>
              </div>
            </div>
          </div>
        </div>

        {/* Complex Articles */}
        <div className="pb-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-amber-100 rounded-lg p-2">
              <Database className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Complex Articles</h3>
              <p className="text-sm text-slate-500">Data-heavy content using Smart Odds Capture</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Complex articles per week
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={inputs.complexArticles}
                onChange={(e) => updateInput('complexArticles', Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Time per article: <span className="text-violet-600 font-semibold">{inputs.complexTime} min</span>
              </label>
              <div className="pt-2">
                <Slider
                  value={[inputs.complexTime]}
                  onValueChange={(value) => updateInput('complexTime', value[0])}
                  min={30}
                  max={180}
                  step={10}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>30 min</span>
                <span>180 min</span>
              </div>
            </div>
          </div>
        </div>

        {/* Calculate Button */}
        <div className="pt-4 border-t border-slate-100">
          <button
            onClick={onCalculate}
            className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-lg shadow-md hover:from-violet-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
          >
            <Clock className="h-5 w-5" />
            Calculate Savings
          </button>
        </div>
      </div>
    </div>
  );
}

