'use client';

import { useState, useEffect } from 'react';
import { ProjectCreationModal } from '@/components/modals/ProjectCreationModal';
import { ProjectListModal } from '@/components/modals/ProjectListModal';

interface Project {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

interface ProjectsPanelProps {
  userId: string;
}

export function ProjectsPanel({ userId }: ProjectsPanelProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchProjects() {
    try {
      const supabase = (await import('@/lib/supabase/client')).createClient();
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchProjects(); }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Projects</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg"
        >
          New Project
        </button>
      </div>
      {loading ? (
        <p className="text-white/40 text-sm">Loading...</p>
      ) : projects.length === 0 ? (
        <p className="text-white/40 text-sm">No projects yet.</p>
      ) : (
        <div className="grid gap-3">
          {projects.map((project) => (
            <button
              key={project.id}
              onClick={() => setSelectedProject(project)}
              className="bg-white/5 hover:bg-white/10 rounded-lg p-4 text-left transition-colors"
            >
              <p className="font-medium">{project.name}</p>
              {project.description && (
                <p className="text-white/40 text-sm mt-1">{project.description}</p>
              )}
            </button>
          ))}
        </div>
      )}
      {showCreateModal && (
        <ProjectCreationModal
          userId={userId}
          onClose={() => setShowCreateModal(false)}
          onCreated={(project) => {
            setShowCreateModal(false);
            setProjects((prev) => [{ ...project, description: null, created_at: new Date().toISOString() }, ...prev]);
          }}
        />
      )}
      {selectedProject && (
        <ProjectListModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </div>
  );
}
