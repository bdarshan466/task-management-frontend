import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Team } from '../types';

interface Props {
  team: Team | null;
  onClose: () => void;
  onSave: (id: string, newName: string) => void;
}

export default function EditTeamModal({ team, onClose, onSave }: Props) {
  const [name, setName] = useState('');

  useEffect(() => {
    if (team) {
      setName(team.name);
    }
  }, [team]);

  if (!team) return null;

  const handleUpdate = () => {
    if (name.trim()) {
      onSave(team.id, name.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-zinc-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-zinc-50">
          <h2 className="text-lg font-semibold text-zinc-900">Edit Team</h2>
          <button 
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 p-1.5 rounded-md hover:bg-zinc-200 transition-colors bg-white border border-zinc-200 shadow-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="p-8">
          <label className="block text-sm font-semibold text-zinc-700 mb-2">Team Name</label>
          <input 
            autoFocus
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-zinc-300 rounded-md px-4 py-2.5 text-[15px] outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors text-zinc-900 font-medium"
            placeholder="Enter team name..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleUpdate();
              if (e.key === 'Escape') onClose();
            }}
          />
          <p className="text-xs text-zinc-500 mt-2">Display name for your team workspace.</p>
        </div>
        
        <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-100 flex justify-end gap-3">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="bg-white border-zinc-300 text-zinc-700 hover:bg-zinc-100 font-semibold"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleUpdate}
            className="bg-blue-600 text-white hover:bg-blue-700 font-semibold"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
