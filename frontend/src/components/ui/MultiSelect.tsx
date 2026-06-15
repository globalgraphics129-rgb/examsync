import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MultiSelectProps {
  options: string[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  label: string;
}

const MultiSelect: React.FC<MultiSelectProps> = ({ options, selectedValues, onChange, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleOption = (option: string) => {
    if (selectedValues.includes(option)) {
      onChange(selectedValues.filter(v => v !== option));
    } else {
      onChange([...selectedValues, option]);
    }
  };

  const handleRemove = (e: React.MouseEvent, option: string) => {
    e.stopPropagation();
    onChange(selectedValues.filter(v => v !== option));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = inputValue.trim().toUpperCase();
      if (val && !selectedValues.includes(val)) {
        onChange([...selectedValues, val]);
      }
      setInputValue('');
    }
  };

  return (
    <div className="space-y-1.5" ref={containerRef}>
      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</label>
      <div 
        className="relative w-full bg-white/5 border border-white/10 rounded-xl min-h-[50px] p-2 flex flex-wrap gap-2 cursor-pointer focus-within:border-emerald-500 focus-within:bg-white/10 transition-all"
        onClick={() => setIsOpen(true)}
      >
        {selectedValues.map(val => (
          <span key={val} className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1">
            {val}
            <button type="button" onClick={(e) => handleRemove(e, val)} className="hover:text-emerald-300 transition-colors">
              <span className="material-symbols-outlined text-[14px]">close</span>
            </button>
          </span>
        ))}
        <input 
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={selectedValues.length === 0 ? "Type your course and press Enter..." : "Type another and press Enter..."}
          className="flex-1 bg-transparent min-w-[200px] text-sm text-white placeholder:text-gray-500 focus:outline-none py-1.5 px-2"
        />
        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" onClick={() => setIsOpen(!isOpen)}>
          expand_more
        </span>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="absolute z-50 mt-2 w-full max-h-60 overflow-y-auto bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl scrollbar-thin scrollbar-thumb-white/10"
          >
            {options.length === 0 ? (
              <div className="p-4 text-sm text-gray-500 text-center">No options available</div>
            ) : (
              options.map(option => {
                const isSelected = selectedValues.includes(option);
                return (
                  <div
                    key={option}
                    onClick={() => handleToggleOption(option)}
                    className={`px-4 py-3 text-sm cursor-pointer transition-colors flex items-center justify-between ${isSelected ? 'bg-emerald-500/10 text-emerald-400' : 'text-gray-300 hover:bg-white/5'}`}
                  >
                    <span>{option}</span>
                    {isSelected && <span className="material-symbols-outlined text-[18px]">check</span>}
                  </div>
                );
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MultiSelect;
