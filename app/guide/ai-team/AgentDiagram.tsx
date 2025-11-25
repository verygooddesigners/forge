'use client';

import React, { useState } from 'react';

interface AgentNode {
  id: number;
  name: string;
  shortName: string;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  capabilities: string[];
}

const agents: AgentNode[] = [
  {
    id: 1,
    name: 'Content Generation',
    shortName: 'Content',
    color: 'text-violet-900',
    bgColor: 'bg-violet-500',
    borderColor: 'border-violet-500',
    description: 'Primary writer that generates articles from briefs and keywords',
    capabilities: ['Article Generation', 'Streaming Output', 'SEO Integration'],
  },
  {
    id: 2,
    name: 'Writer Training',
    shortName: 'Training',
    color: 'text-blue-900',
    bgColor: 'bg-blue-500',
    borderColor: 'border-blue-500',
    description: 'Analyzes writing samples to extract style and voice patterns',
    capabilities: ['Style Analysis', 'Voice Extraction', 'Pattern Recognition'],
  },
  {
    id: 3,
    name: 'SEO Optimization',
    shortName: 'SEO',
    color: 'text-green-900',
    bgColor: 'bg-green-500',
    borderColor: 'border-green-500',
    description: 'Analyzes content for keywords and search engine best practices',
    capabilities: ['Keyword Analysis', 'SEO Scoring', 'Optimization Tips'],
  },
  {
    id: 4,
    name: 'Quality Assurance',
    shortName: 'QA',
    color: 'text-orange-900',
    bgColor: 'bg-orange-500',
    borderColor: 'border-orange-500',
    description: 'Reviews grammar, readability, and consistency',
    capabilities: ['Grammar Check', 'Readability Score', 'Consistency Review'],
  },
  {
    id: 5,
    name: 'Persona & Tone',
    shortName: 'Persona',
    color: 'text-pink-900',
    bgColor: 'bg-pink-500',
    borderColor: 'border-pink-500',
    description: 'Adapts content to match specific voices and tones',
    capabilities: ['Tone Matching', 'Voice Adaptation', 'Style Consistency'],
  },
  {
    id: 6,
    name: 'Creative Features',
    shortName: 'Creative',
    color: 'text-indigo-900',
    bgColor: 'bg-indigo-500',
    borderColor: 'border-indigo-500',
    description: 'Orchestrates complex multi-agent workflows',
    capabilities: ['Workflow Management', 'Multi-Agent Tasks', 'Data Transform'],
  },
  {
    id: 7,
    name: 'Visual Extraction',
    shortName: 'Visual',
    color: 'text-cyan-900',
    bgColor: 'bg-cyan-500',
    borderColor: 'border-cyan-500',
    description: 'Extracts structured data from images and screenshots',
    capabilities: ['Image Analysis', 'Data Extraction', 'Table Parsing'],
  },
];

export default function AgentDiagram() {
  const [hoveredAgent, setHoveredAgent] = useState<AgentNode | null>(null);

  return (
    <div className="relative">
      {/* Main Diagram Container */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-2xl p-8 overflow-hidden">
        {/* Title */}
        <h4 className="text-center text-lg font-semibold text-slate-700 mb-8">
          Agent Collaboration Flow
        </h4>

        {/* Desktop Layout */}
        <div className="hidden lg:block">
          <svg viewBox="0 0 900 500" className="w-full h-auto">
            {/* Background Grid Pattern */}
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
              </pattern>
              {/* Arrow marker */}
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
              </marker>
              <marker
                id="arrowhead-violet"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#8b5cf6" />
              </marker>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Central Hub - Content Generation Agent */}
            <g transform="translate(450, 250)">
              <circle r="60" fill="#8b5cf6" className="drop-shadow-lg" />
              <text
                x="0"
                y="-10"
                textAnchor="middle"
                fill="white"
                fontSize="14"
                fontWeight="bold"
              >
                Content
              </text>
              <text
                x="0"
                y="10"
                textAnchor="middle"
                fill="white"
                fontSize="14"
                fontWeight="bold"
              >
                Generation
              </text>
              <text x="0" y="30" textAnchor="middle" fill="white" fontSize="11" opacity="0.9">
                Agent #1
              </text>
            </g>

            {/* Writer Training - Top Left */}
            <g transform="translate(200, 120)">
              <circle r="45" fill="#3b82f6" className="drop-shadow-md" />
              <text x="0" y="-5" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">
                Writer
              </text>
              <text x="0" y="10" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">
                Training
              </text>
              <text x="0" y="25" textAnchor="middle" fill="white" fontSize="10" opacity="0.9">
                #2
              </text>
            </g>
            {/* Arrow from Writer Training to Content */}
            <path
              d="M 240 150 Q 340 180 400 220"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeDasharray="5,3"
              markerEnd="url(#arrowhead)"
            />
            <text x="300" y="170" fill="#3b82f6" fontSize="10" fontStyle="italic">
              style context
            </text>

            {/* SEO Optimization - Top Right */}
            <g transform="translate(700, 120)">
              <circle r="45" fill="#22c55e" className="drop-shadow-md" />
              <text x="0" y="-5" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">
                SEO
              </text>
              <text x="0" y="10" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">
                Optimization
              </text>
              <text x="0" y="25" textAnchor="middle" fill="white" fontSize="10" opacity="0.9">
                #3
              </text>
            </g>
            {/* Arrow from SEO to Content */}
            <path
              d="M 660 150 Q 560 180 500 220"
              fill="none"
              stroke="#22c55e"
              strokeWidth="2"
              strokeDasharray="5,3"
              markerEnd="url(#arrowhead)"
            />
            <text x="590" y="170" fill="#22c55e" fontSize="10" fontStyle="italic">
              keywords
            </text>

            {/* Persona & Tone - Left */}
            <g transform="translate(150, 280)">
              <circle r="45" fill="#ec4899" className="drop-shadow-md" />
              <text x="0" y="-5" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">
                Persona
              </text>
              <text x="0" y="10" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">
                & Tone
              </text>
              <text x="0" y="25" textAnchor="middle" fill="white" fontSize="10" opacity="0.9">
                #5
              </text>
            </g>
            {/* Bidirectional arrow with Persona */}
            <path
              d="M 195 270 L 390 255"
              fill="none"
              stroke="#ec4899"
              strokeWidth="2"
              markerEnd="url(#arrowhead)"
            />
            <path
              d="M 390 265 L 195 280"
              fill="none"
              stroke="#8b5cf6"
              strokeWidth="2"
              markerEnd="url(#arrowhead-violet)"
            />
            <text x="280" y="250" fill="#ec4899" fontSize="10" fontStyle="italic">
              tone adjust
            </text>

            {/* Quality Assurance - Right */}
            <g transform="translate(750, 280)">
              <circle r="45" fill="#f97316" className="drop-shadow-md" />
              <text x="0" y="-5" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">
                Quality
              </text>
              <text x="0" y="10" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">
                Assurance
              </text>
              <text x="0" y="25" textAnchor="middle" fill="white" fontSize="10" opacity="0.9">
                #4
              </text>
            </g>
            {/* Arrow from Content to QA */}
            <path
              d="M 510 260 L 700 275"
              fill="none"
              stroke="#8b5cf6"
              strokeWidth="2"
              markerEnd="url(#arrowhead)"
            />
            <text x="600" y="255" fill="#f97316" fontSize="10" fontStyle="italic">
              review
            </text>

            {/* Creative Features - Bottom Left */}
            <g transform="translate(250, 420)">
              <circle r="45" fill="#6366f1" className="drop-shadow-md" />
              <text x="0" y="-5" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">
                Creative
              </text>
              <text x="0" y="10" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">
                Features
              </text>
              <text x="0" y="25" textAnchor="middle" fill="white" fontSize="10" opacity="0.9">
                #6
              </text>
            </g>
            {/* Arrow from Creative to Content */}
            <path
              d="M 290 390 Q 360 340 410 300"
              fill="none"
              stroke="#6366f1"
              strokeWidth="2"
              strokeDasharray="5,3"
              markerEnd="url(#arrowhead)"
            />
            <text x="320" y="360" fill="#6366f1" fontSize="10" fontStyle="italic">
              orchestrate
            </text>

            {/* Visual Extraction - Bottom Right */}
            <g transform="translate(650, 420)">
              <circle r="45" fill="#06b6d4" className="drop-shadow-md" />
              <text x="0" y="-5" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">
                Visual
              </text>
              <text x="0" y="10" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">
                Extraction
              </text>
              <text x="0" y="25" textAnchor="middle" fill="white" fontSize="10" opacity="0.9">
                #7
              </text>
            </g>
            {/* Arrow from Visual to Creative */}
            <path
              d="M 605 420 L 300 420"
              fill="none"
              stroke="#06b6d4"
              strokeWidth="2"
              strokeDasharray="5,3"
              markerEnd="url(#arrowhead)"
            />
            <text x="450" y="410" fill="#06b6d4" fontSize="10" fontStyle="italic">
              extracted data
            </text>

            {/* Output Arrow */}
            <g transform="translate(450, 350)">
              <path
                d="M 0 0 L 0 80"
                fill="none"
                stroke="#8b5cf6"
                strokeWidth="3"
                markerEnd="url(#arrowhead-violet)"
              />
              <rect x="-60" y="90" width="120" height="40" rx="8" fill="#8b5cf6" />
              <text x="0" y="115" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">
                Final Content
              </text>
            </g>

            {/* Input Arrow */}
            <g transform="translate(450, 120)">
              <rect x="-50" y="-50" width="100" height="35" rx="8" fill="#64748b" />
              <text x="0" y="-27" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">
                User Brief
              </text>
              <path
                d="M 0 -10 L 0 60"
                fill="none"
                stroke="#64748b"
                strokeWidth="3"
                markerEnd="url(#arrowhead)"
              />
            </g>
          </svg>
        </div>

        {/* Mobile Layout - Simplified vertical flow */}
        <div className="lg:hidden">
          <div className="flex flex-col items-center space-y-4">
            {/* Input */}
            <div className="bg-slate-500 text-white px-6 py-3 rounded-lg font-semibold">
              User Brief
            </div>
            <div className="w-0.5 h-6 bg-slate-400" />

            {/* Supporting Agents Row */}
            <div className="grid grid-cols-3 gap-2 w-full max-w-sm">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                  #2
                </div>
                <span className="text-xs mt-1 text-center">Training</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                  #3
                </div>
                <span className="text-xs mt-1 text-center">SEO</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                  #5
                </div>
                <span className="text-xs mt-1 text-center">Persona</span>
              </div>
            </div>

            {/* Arrows down */}
            <div className="flex justify-center space-x-8">
              <div className="w-0.5 h-4 bg-blue-400" />
              <div className="w-0.5 h-4 bg-green-400" />
              <div className="w-0.5 h-4 bg-pink-400" />
            </div>

            {/* Central Agent */}
            <div className="w-24 h-24 bg-violet-500 rounded-full flex flex-col items-center justify-center text-white shadow-lg">
              <span className="font-bold text-sm">Content</span>
              <span className="font-bold text-sm">Gen #1</span>
            </div>

            <div className="w-0.5 h-4 bg-violet-400" />

            {/* QA Agent */}
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                QA #4
              </div>
            </div>

            <div className="w-0.5 h-4 bg-violet-400" />

            {/* Output */}
            <div className="bg-violet-500 text-white px-6 py-3 rounded-lg font-semibold">
              Final Content
            </div>

            {/* Supporting Workflow Agents */}
            <div className="mt-6 pt-6 border-t border-slate-300 w-full">
              <p className="text-xs text-center text-slate-500 mb-3">
                Specialized Workflow Agents
              </p>
              <div className="flex justify-center space-x-4">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                    #6
                  </div>
                  <span className="text-xs mt-1">Creative</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                    #7
                  </div>
                  <span className="text-xs mt-1">Visual</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Agent Legend / Interactive Details */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {agents.map((agent) => (
          <button
            key={agent.id}
            className={`p-3 rounded-lg border-2 transition-all duration-200 text-left hover:scale-105 ${
              hoveredAgent?.id === agent.id
                ? `${agent.borderColor} bg-white shadow-lg`
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
            onMouseEnter={() => setHoveredAgent(agent)}
            onMouseLeave={() => setHoveredAgent(null)}
            onClick={() => setHoveredAgent(hoveredAgent?.id === agent.id ? null : agent)}
          >
            <div className="flex items-center gap-2 mb-1">
              <div
                className={`w-6 h-6 ${agent.bgColor} rounded-full flex items-center justify-center text-white text-xs font-bold`}
              >
                {agent.id}
              </div>
              <span className="font-medium text-sm truncate">{agent.shortName}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Hovered Agent Details */}
      {hoveredAgent && (
        <div
          className={`mt-4 p-4 rounded-lg border-l-4 ${hoveredAgent.borderColor} bg-white shadow-md animate-in fade-in duration-200`}
        >
          <div className="flex items-center gap-3 mb-2">
            <div
              className={`w-10 h-10 ${hoveredAgent.bgColor} rounded-full flex items-center justify-center text-white font-bold`}
            >
              {hoveredAgent.id}
            </div>
            <div>
              <h5 className={`font-bold ${hoveredAgent.color}`}>{hoveredAgent.name} Agent</h5>
              <p className="text-sm text-slate-600">{hoveredAgent.description}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {hoveredAgent.capabilities.map((cap) => (
              <span
                key={cap}
                className={`px-2 py-1 ${hoveredAgent.bgColor} bg-opacity-20 ${hoveredAgent.color} rounded text-xs font-medium`}
              >
                {cap}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

