'use client';

import { X } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description: string | null;
}

interface ProjectListModalProps {
  project: Project;
  onClose: () => void;
}

export function ProjectListModal({ project, onClose }: ProjectListModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl p-6 w-full max-w-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{project.name}</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white">
            <X size={20} />
          </button>
        </div>
        <p className="text-white/40 text-sm">
          {project.description || 'No description provided.'}
        </p>
      </div>
    </div>
  );
}
