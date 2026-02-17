'use client';

import React from 'react';
import { Clock, Calendar, CalendarDays, User, Users, TrendingDown } from 'lucide-react';
import type { CalculatorResults, CalculatorInputs } from './TimeSavingsPage';

interface SavingsResultsProps {
  results: CalculatorResults;
  inputs: CalculatorInputs;
}

export default function SavingsResults({ results, inputs }: SavingsResultsProps) {
  const reductionPercent = ((results.weeklySaved / results.currentWeeklyHours) * 100).toFixed(0);

  return (
    <div className="space-y-8">
      {/* Before/After Comparison */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Before Card */}
        <div className="bg-slate-100 border border-slate-300 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-slate-300 rounded-full p-1.5">
              <Clock className="h-4 w-4 text-slate-600" />
            </div>
            <h3 className="font-semibold text-slate-700">Current Time</h3>
          </div>
          <div className="text-4xl font-bold text-slate-800 mb-1">
            {results.currentWeeklyHours.toFixed(1)} hrs
          </div>
          <p className="text-slate-600 text-sm">per week on content creation</p>
        </div>

        {/* After Card */}
        <div className="bg-gradient-to-br from-emerald-50 to-green-100 border-2 border-emerald-300 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-emerald-500 rounded-full p-1.5">
              <TrendingDown className="h-4 w-4 text-white" />
            </div>
            <h3 className="font-semibold text-emerald-800">With Forge</h3>
          </div>
          <div className="text-4xl font-bold text-emerald-700 mb-1">
            {results.newWeeklyHours.toFixed(1)} hrs
          </div>
          <p className="text-emerald-700 text-sm">per week on content creation</p>
        </div>
      </div>

      {/* Visual Bar Chart */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h3 className="font-semibold text-slate-900 mb-6">Weekly Hours Comparison</h3>
        <div className="space-y-4">
          {/* Current Time Bar */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-600">Without Forge</span>
              <span className="font-mono font-semibold text-slate-700">
                {results.currentWeeklyHours.toFixed(1)} hrs
              </span>
            </div>
            <div className="h-10 bg-slate-100 rounded-lg overflow-hidden">
              <div
                className="h-full bg-slate-400 rounded-lg transition-all duration-500"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {/* With Forge Bar */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-emerald-700 font-medium">With Forge</span>
              <span className="font-mono font-semibold text-emerald-700">
                {results.newWeeklyHours.toFixed(1)} hrs
              </span>
            </div>
            <div className="h-10 bg-slate-100 rounded-lg overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg transition-all duration-500"
                style={{
                  width: `${(results.newWeeklyHours / results.currentWeeklyHours) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Time Saved Indicator */}
          <div className="flex items-center justify-center gap-3 pt-4 border-t border-slate-100">
            <div className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
              {reductionPercent}% reduction
            </div>
            <div className="px-4 py-2 bg-violet-100 text-violet-800 rounded-full text-sm font-semibold">
              {results.weeklySaved.toFixed(1)} hrs saved/week
            </div>
          </div>
        </div>
      </div>

      {/* Time Savings Summary Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Weekly */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="h-5 w-5 text-violet-600" />
            <span className="text-sm font-medium text-slate-600">Weekly</span>
          </div>
          <div className="text-3xl font-bold text-slate-900">
            {results.weeklySaved.toFixed(1)}
          </div>
          <p className="text-sm text-slate-500">hours saved</p>
        </div>

        {/* Monthly */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <CalendarDays className="h-5 w-5 text-violet-600" />
            <span className="text-sm font-medium text-slate-600">Monthly</span>
          </div>
          <div className="text-3xl font-bold text-slate-900">
            {results.monthlySaved.toFixed(0)}
          </div>
          <p className="text-sm text-slate-500">hours saved</p>
        </div>

        {/* Annual */}
        <div className="bg-gradient-to-br from-violet-50 to-purple-100 border border-violet-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-5 w-5 text-violet-600" />
            <span className="text-sm font-medium text-violet-700">Annual</span>
          </div>
          <div className="text-3xl font-bold text-violet-900">
            {results.annualSaved.toFixed(0)}
          </div>
          <p className="text-sm text-violet-700">hours saved</p>
        </div>

        {/* Per Person */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <User className="h-5 w-5 text-violet-600" />
            <span className="text-sm font-medium text-slate-600">Per Person</span>
          </div>
          <div className="text-3xl font-bold text-slate-900">
            {results.perPersonWeekly.toFixed(1)}
          </div>
          <p className="text-sm text-slate-500">hrs/week saved</p>
        </div>
      </div>

      {/* FTE Equivalent Highlight */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
              <Users className="h-6 w-6" />
              Full-Time Equivalent Freed Up
            </h3>
            <p className="text-violet-100 leading-relaxed">
              Based on a 40-hour work week, your team of {inputs.teamSize} could redirect this time
              to higher-value activities like strategy, research, or audience engagement.
            </p>
          </div>
          <div className="flex-shrink-0 text-center">
            <div className="text-5xl font-bold">{results.fteEquivalent.toFixed(1)}</div>
            <div className="text-violet-200 text-sm font-medium">FTE per week</div>
          </div>
        </div>
      </div>

      {/* What You Could Do Section */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
        <h3 className="font-semibold text-amber-900 mb-4">
          What could you do with {results.weeklySaved.toFixed(0)} extra hours per week?
        </h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="flex items-start gap-2">
            <span className="text-amber-500 font-bold">→</span>
            <span className="text-amber-800 text-sm">Develop deeper content strategies</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-amber-500 font-bold">→</span>
            <span className="text-amber-800 text-sm">Increase content output without adding headcount</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-amber-500 font-bold">→</span>
            <span className="text-amber-800 text-sm">Focus on audience research and engagement</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-amber-500 font-bold">→</span>
            <span className="text-amber-800 text-sm">Take on new projects or verticals</span>
          </div>
        </div>
      </div>
    </div>
  );
}


