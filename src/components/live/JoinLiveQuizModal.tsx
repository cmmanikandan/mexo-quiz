import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MexoModal } from '../common/MexoModal';
import { MexoInput } from '../common/MexoInput';
import { MexoButton } from '../common/MexoButton';
import { Zap, Play, QrCode } from 'lucide-react';

export const JoinLiveQuizModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState('');
  const [playerName, setPlayerName] = useState('');

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    onClose();
    navigate(`/live/${joinCode.trim().toUpperCase()}`);
  };

  return (
    <MexoModal isOpen={isOpen} onClose={onClose} title={<div className="flex items-center space-x-2"><Zap className="w-5 h-5 text-[#7C3AED]" /><span>Join Live Quiz Competition</span></div>} maxWidth="sm">
      <form onSubmit={handleJoin} className="space-y-4 pt-2">
        <MexoInput
          label="Enter 6-Digit Join Code"
          value={joinCode}
          onChange={e => setJoinCode(e.target.value.toUpperCase())}
          placeholder="e.g. MEXO-94"
          required
        />
        <MexoInput
          label="Your Player Name"
          value={playerName}
          onChange={e => setPlayerName(e.target.value)}
          placeholder="Enter nickname"
        />

        <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
          <MexoButton variant="outline" size="sm" type="button" onClick={onClose}>
            Cancel
          </MexoButton>
          <MexoButton variant="purple" size="sm" type="submit" leftIcon={<Play className="w-4 h-4" />}>
            Join Lobby
          </MexoButton>
        </div>
      </form>
    </MexoModal>
  );
};
