"use client";

import { useState } from 'react';

export default function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [message, setMessage] = useState("");

  const toggleChat = () => setIsOpen(!isOpen);
  const toggleFullScreen = () => setIsFullScreen(!isFullScreen);

  return (
    <>
      {/* FLOATING ICON */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="fixed bottom-6 right-6 p-4 bg-[#5F7A7B] text-white rounded-full shadow-2xl hover:scale-110 transition-all z-[60] group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
          </svg>
          <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-white text-[#5F7A7B] text-[10px] px-2 py-1 rounded-md shadow-sm opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest whitespace-nowrap">
            Clinical Assistant
          </span>
        </button>
      )}

      {/* CHAT WINDOW */}
      {isOpen && (
        <div 
          className={`fixed transition-all duration-500 ease-in-out z-[60] bg-white shadow-2xl flex flex-col border border-gray-100
            ${isFullScreen 
              ? 'inset-4 rounded-[2rem]' 
              : 'bottom-6 right-6 w-[350px] h-[500px] rounded-[2rem]'
            }`}
        >
          {/* Header */}
          <div className="p-5 border-b border-gray-50 flex justify-between items-center bg-[#F9F9F7] rounded-t-[2rem]">
            <div>
              <h3 className="text-sm font-medium text-gray-800">Cognify AI</h3>
              <p className="text-[10px] text-[#5F7A7B] uppercase tracking-widest">Active Insight Mode</p>
            </div>
            <div className="flex gap-2">
              <button onClick={toggleFullScreen} className="p-1.5 hover:bg-gray-200 rounded-md transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                </svg>
              </button>
              <button onClick={toggleChat} className="p-1.5 hover:bg-gray-200 rounded-md transition-colors text-gray-400">&times;</button>
            </div>
          </div>

          {/* Chat Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white">
            <div className="bg-[#F9F9F7] p-3 rounded-2xl rounded-tl-none max-w-[80%]">
              <p className="text-xs text-gray-600 leading-relaxed">
                Hello. I can help analyze your journaling entries or explain your cognitive task results. How are you feeling today?
              </p>
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-50">
            <div className="flex items-center gap-2 bg-[#F9F9F7] px-4 py-2 rounded-2xl border border-transparent focus-within:border-gray-200 transition-all">
              {/* Attachment Button */}
              <label className="cursor-pointer p-1 hover:text-[#5F7A7B] text-gray-400 transition-colors">
                <input type="file" className="hidden" />
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32a1.5 1.5 0 0 1-2.121-2.121l10.517-10.517" />
                </svg>
              </label>

              <input 
                type="text" 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a clinical inquiry..."
                className="flex-1 bg-transparent border-none text-xs outline-none text-gray-700 placeholder:text-gray-400"
              />

              <button className="text-[#5F7A7B] hover:scale-110 transition-transform disabled:opacity-30" disabled={!message}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}