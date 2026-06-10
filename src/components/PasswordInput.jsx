import React from 'react';

export default function PasswordInput({
  useSame, onUseSameChange, globalPassword, onGlobalPasswordChange,
  showPassword, onToggleShow, files, onFilePasswordChange, processing,
}) {
  return (
    <div className="card p-5 space-y-4 animate-slide-up">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Password</span>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <span className="text-xs text-gray-500 dark:text-gray-400">Same for all</span>
          <div className="relative">
            <input type="checkbox" checked={useSame} onChange={(e) => onUseSameChange(e.target.checked)} className="sr-only peer" />
            <div className={`w-8 h-5 rounded-full transition-colors ${useSame ? 'bg-accent-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
              <div className={`w-3.5 h-3.5 bg-white rounded-full shadow-sm transform transition-transform mt-0.75 ml-0.75 ${useSame ? 'translate-x-3.5' : ''}`} />
            </div>
          </div>
        </label>
      </div>

      {useSame ? (
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <input type={showPassword ? 'text' : 'password'} value={globalPassword}
                 onChange={(e) => onGlobalPasswordChange(e.target.value)}
                 placeholder="Enter PDF password" disabled={processing}
                 className="input-field pl-11 pr-12 text-sm" />
          <button type="button" onClick={onToggleShow}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1">
            {showPassword ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {files.map((file, i) => (
            <div key={i} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
              <span className="text-xs text-gray-500 dark:text-gray-400 truncate flex-1 min-w-0">{file.name}</span>
              <input type="password" value={file.password}
                     onChange={(e) => onFilePasswordChange(i, e.target.value)}
                     placeholder="Password" disabled={processing}
                     className="input-field w-40 text-sm" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
