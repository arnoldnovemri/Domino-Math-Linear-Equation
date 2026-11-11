import React, { useState } from 'react';
import { ChatMessage } from '../types/game';
import { sounds } from '../services/soundEffects';
import { Send, Smile, MessageCircle, X } from 'lucide-react';

interface Props {
  messages: ChatMessage[];
  onSendMessage: (text: string, isEmote?: boolean) => void;
  playerName: string;
}

const QUICK_CHATS = [
  'Halo semua! 👋',
  'Pikir dulu ya... 🤔',
  'Tinggal 1 kartu nih! 🔥',
  'Strategi bagus! 👏',
  'Aduh, jalannya buntu! 😅',
  'Ayo cepat jalan! ⏳',
  'GG Semuanya! 🏆',
];

const EMOJIS = ['🔥', '🐱', '🤔', '🏆', '👏', '🤣', '⚡', '📐', '😎', '💀'];

export const InGameChat: React.FC<Props> = ({
  messages,
  onSendMessage,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    sounds.playClick();
    onSendMessage(inputText.trim(), false);
    setInputText('');
  };

  const handleQuickChat = (text: string) => {
    sounds.playClick();
    onSendMessage(text, false);
  };

  const handleEmoteSelect = (emoji: string) => {
    sounds.playClick();
    onSendMessage(emoji, true);
    setShowEmojiPicker(false);
  };

  return (
    <div className="relative">
      {/* Toggle Button */}
      <button
        onClick={() => {
          sounds.playClick();
          setIsOpen(!isOpen);
        }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold shadow-md transition-all active:scale-95"
        title="Buka Obrolan"
      >
        <MessageCircle className="w-4 h-4 text-cyan-400" />
        <span>Chat</span>
        {messages.length > 0 && (
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
        )}
      </button>

      {/* Chat Popover Window */}
      {isOpen && (
        <div className="absolute bottom-10 right-0 w-80 sm:w-96 bg-slate-950/95 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-lg flex flex-col z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-900/90 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-slate-200">Obrolan Permainan</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Chat Row */}
          <div className="p-2 border-b border-slate-800/80 bg-slate-900/40 overflow-x-auto flex gap-1.5 no-scrollbar">
            {QUICK_CHATS.map((qc, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickChat(qc)}
                className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-indigo-600/70 text-[11px] font-medium text-slate-300 hover:text-white border border-slate-700/60 transition-colors"
              >
                {qc}
              </button>
            ))}
          </div>

          {/* Message List */}
          <div className="h-48 overflow-y-auto p-3 space-y-2 text-xs flex flex-col-reverse">
            {[...messages].reverse().map((msg) => (
              <div
                key={msg.id}
                className={`p-2 rounded-xl max-w-[85%] break-words ${
                  msg.isEmote
                    ? 'bg-transparent text-2xl self-center'
                    : 'bg-slate-900 border border-slate-800 self-start text-slate-200'
                }`}
              >
                {!msg.isEmote && (
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5 gap-2 font-semibold">
                    <span className="text-cyan-400">{msg.senderName}</span>
                    <span>{msg.time}</span>
                  </div>
                )}
                <span>{msg.text}</span>
              </div>
            ))}
          </div>

          {/* Emoji Picker Popover */}
          {showEmojiPicker && (
            <div className="p-2 bg-slate-900 border-t border-slate-800 grid grid-cols-5 gap-1.5 place-items-center">
              {EMOJIS.map((emoji, i) => (
                <button
                  key={i}
                  onClick={() => handleEmoteSelect(emoji)}
                  className="text-xl p-1.5 hover:bg-slate-800 rounded-lg transition-transform active:scale-125"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          {/* Input Bar */}
          <form
            onSubmit={handleSend}
            className="p-2.5 bg-slate-900/80 border-t border-slate-800 flex items-center gap-1.5"
          >
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-1.5 text-slate-400 hover:text-amber-300 rounded-lg transition-colors"
              title="Pilih Emote"
            >
              <Smile className="w-5 h-5" />
            </button>
            <input
              type="text"
              placeholder="Tulis pesan..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-slate-950 font-bold rounded-xl transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
