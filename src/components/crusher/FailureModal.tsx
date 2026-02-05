import { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FailureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FailureModal = ({ isOpen, onClose }: FailureModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-red-950 border-2 border-red-500 rounded-2xl p-6 text-center animate-pulse">
        <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-red-400" />
        </div>
        
        <h2 className="text-2xl font-bold text-red-400 mb-4">Session Incomplete!</h2>
        
        <div className="bg-red-900/50 rounded-xl p-4 mb-6">
          <p className="text-red-200 text-lg leading-relaxed">
            "Itna lazy hogayi kya tum? Aise milega BMCRI? Jaaag jaaa, yeh makaaari karna band karde and padhai pe dyaan de. Chal punishment milegi tumhe uske liye text karo then punishment lo aaaj ka."
          </p>
        </div>
        
        <p className="text-zinc-400 text-sm mb-6">
          Yesterday's session was not completed. Start fresh today!
        </p>
        
        <Button
          onClick={onClose}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-6 text-lg"
        >
          I Understand - Start Fresh
        </Button>
      </div>
    </div>
  );
};

export default FailureModal;
