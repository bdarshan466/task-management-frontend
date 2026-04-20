import { useState, useRef, useEffect } from 'react';
import { X, ChevronDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { User } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (userId: string) => void;
}

const mockUsers: User[] = [
  { id: 'u1', name: 'Alice Smith', color: 'bg-red-500' },
  { id: 'u2', name: 'Bob Johnson', color: 'bg-blue-500' },
  { id: 'u3', name: 'Darshan', color: 'bg-purple-600' },
  { id: 'u4', name: 'Emily Clark', color: 'bg-green-500' },
  { id: 'u5', name: 'Michael Brown', color: 'bg-amber-500' }
];

export default function AddMemberModal({ isOpen, onClose, onAdd }: Props) {
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const handleCreate = () => {
    if (selectedUserId) {
      onAdd(selectedUserId);
      setSelectedUserId('');
      onClose();
    }
  };

  const selectedUser = mockUsers.find(u => u.id === selectedUserId);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200 border border-zinc-200 flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-zinc-50 rounded-t-xl">
          <h2 className="text-lg font-semibold text-zinc-900">Add Team Member</h2>
          <button 
            onClick={() => { setSelectedUserId(''); onClose(); }}
            className="text-zinc-400 hover:text-zinc-600 p-1.5 rounded-md hover:bg-zinc-200 transition-colors bg-white border border-zinc-200 shadow-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="p-8">
          <label className="block text-sm font-semibold text-zinc-700 mb-2">Select User</label>
          
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between bg-white border-2 border-zinc-200 rounded-md px-4 py-2.5 text-[15px] outline-none focus:ring-0 focus:border-blue-500 transition-colors text-zinc-900 font-medium"
            >
              {selectedUser ? (
                <div className="flex items-center gap-3">
                  <span>{selectedUser.name}</span>
                </div>
              ) : (
                <span className="text-zinc-400">Choose a user...</span>
              )}
              <ChevronDown className="w-4 h-4 text-zinc-400" />
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-1.5 w-full max-h-48 overflow-y-auto bg-white border border-zinc-200 shadow-xl rounded-md z-50 animate-in fade-in zoom-in-95 duration-100 py-1 custom-scrollbar">
                {mockUsers.map(user => (
                  <button
                    key={user.id}
                    onClick={() => { setSelectedUserId(user.id); setIsDropdownOpen(false); }}
                    className="w-full flex items-center justify-between px-4 py-2 hover:bg-zinc-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold ${user.color}`}>
                        {user.name.charAt(0)}
                      </div>
                      <span className="text-[14px] font-medium text-zinc-800">{user.name}</span>
                    </div>
                    {selectedUserId === user.id && <Check className="w-4 h-4 text-blue-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-100 flex justify-end gap-3 rounded-b-xl mt-auto">
          <Button 
            variant="outline" 
            onClick={() => { setSelectedUserId(''); onClose(); }}
            className="bg-white border-zinc-300 text-zinc-700 hover:bg-zinc-100 font-semibold"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreate}
            disabled={!selectedUserId}
            className="bg-blue-600 text-white hover:bg-blue-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
