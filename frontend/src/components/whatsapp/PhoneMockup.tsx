import React from 'react';

interface PhoneMockupProps {
  message: string;
}

const PhoneMockup: React.FC<PhoneMockupProps> = ({ message }) => {
  return (
    <div className="relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[600px] w-[300px] shadow-xl">
      <div className="h-[32px] w-[3px] bg-gray-800 absolute -left-[17px] top-[72px] rounded-l-lg"></div>
      <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[124px] rounded-l-lg"></div>
      <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[178px] rounded-l-lg"></div>
      <div className="h-[64px] w-[3px] bg-gray-800 absolute -right-[17px] top-[142px] rounded-r-lg"></div>
      <div className="rounded-[2rem] overflow-hidden w-full h-full bg-[#E5DDD5] flex flex-col">
        {/* WhatsApp Header */}
        <div className="bg-[#075E54] p-4 text-white flex items-center gap-3">
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          <div className="w-8 h-8 rounded-full bg-gray-300"></div>
          <div>
            <p className="text-xs font-bold leading-tight">University Group</p>
            <p className="text-[8px] opacity-70">online</p>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="bg-[#DCF8C6] p-3 rounded-lg rounded-tr-none shadow-sm ml-auto max-w-[90%] relative">
            <p className="text-[10px] text-gray-800 whitespace-pre-wrap leading-tight">
              {message}
            </p>
            <p className="text-[8px] text-gray-500 text-right mt-1">12:45 PM ✓✓</p>
          </div>
        </div>

        {/* WhatsApp Input */}
        <div className="p-2 bg-[#F0F0F0] flex items-center gap-2">
          <div className="flex-1 bg-white rounded-full px-4 py-2 text-[10px] text-gray-400">Type a message</div>
          <div className="w-8 h-8 rounded-full bg-[#128C7E] flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-sm">mic</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhoneMockup;
