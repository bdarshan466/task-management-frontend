import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string) => void;
}

export default function AddTeamModal({ isOpen, onClose, onAdd }: Props) {
  const [name, setName] = useState('');

  if (!isOpen) return null;

  const handleCreate = () => {
    if (name.trim()) {
      onAdd(name.trim());
      setName('');
    }
  };

  const handleClose = () => {
    setName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-zinc-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-zinc-50">
          <h2 className="text-lg font-semibold text-zinc-900">Create New Team</h2>
          <button 
            onClick={handleClose}
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
            placeholder="e.g. Graphic Design Team"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreate();
              if (e.key === 'Escape') handleClose();
            }}
          />
        </div>
        
        <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-100 flex justify-end gap-3">
          <Button 
            variant="outline" 
            onClick={handleClose}
            className="bg-white border-zinc-300 text-zinc-700 hover:bg-zinc-100 font-semibold"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreate}
            className="bg-blue-600 text-white hover:bg-blue-700 font-semibold"
          >
            Create Team
          </Button>
        </div>
      </div>
    </div>
  );
}
