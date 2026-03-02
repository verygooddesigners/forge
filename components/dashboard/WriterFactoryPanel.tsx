'use client';

import { useState, useEffect } from 'react';
import { WriterFactoryModal } from '@/components/modals/WriterFactoryModal';

interface WriterModel {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

interface WriterFactoryPanelProps {
  userId: string;
}

export function WriterFactoryPanel({ userId }: WriterFactoryPanelProps) {
  const [models, setModels] = useState<WriterModel[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  async function fetchModels() {
    try {
      const res = await fetch('/api/writer-models');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setModels(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchModels(); }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Writer Models</h2>
        <button
          onClick={() => setShowModal(true)}
          className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg"
        >
          New Model
        </button>
      </div>
      {loading ? (
        <p className="text-white/40 text-sm">Loading...</p>
      ) : models.length === 0 ? (
        <p className="text-white/40 text-sm">No writer models yet.</p>
      ) : (
        <div className="space-y-2">
          {models.map((model) => (
            <div key={model.id} className="bg-white/5 rounded-lg p-3">
              <p className="font-medium text-sm">{model.name}</p>
              {model.description && <p className="text-white/40 text-xs mt-1">{model.description}</p>}
            </div>
          ))}
        </div>
      )}
      {showModal && (
        <WriterFactoryModal
          userId={userId}
          onClose={() => setShowModal(false)}
          onCreated={() => { setShowModal(false); fetchModels(); }}
        />
      )}
    </div>
  );
}
