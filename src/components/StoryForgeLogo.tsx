import React from 'react';

interface LogoProps {
  size?: 'small' | 'default' | 'large';
  className?: string;
  showTagline?: boolean;
}

export const StoryForgeLogo: React.FC<LogoProps> = ({ 
  size = 'default', 
  className = '', 
  showTagline = true 
}) => {
  const dimensions = size === 'small' ? 'w-8 h-8' : size === 'large' ? 'w-12 h-12' : 'w-10 h-10';

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Cinematic Film Frame + Story Anvil Spark SVG */}
      <div className={`relative ${dimensions} rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-400 p-[1.5px] shadow-lg shadow-violet-500/25 flex-shrink-0 group`}>
        <div className="w-full h-full bg-[#0E1018] rounded-[10px] flex items-center justify-center overflow-hidden relative">
          <svg viewBox="0 0 32 32" fill="none" className="w-5/6 h-5/6 text-white transform group-hover:scale-105 transition-transform" xmlns="http://www.w3.org/2000/svg">
            {/* Outer Cinematic Film Frame */}
            <rect x="3" y="4" width="26" height="24" rx="4" stroke="currentColor" strokeWidth="2" strokeOpacity="0.85" />
            {/* Film Perforations / Spool marks */}
            <path d="M3 10H29M3 22H29" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" strokeOpacity="0.45"/>
            <path d="M9 4V10M16 4V10M23 4V10M9 22V28M16 22V28M23 22V28" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.45"/>
            {/* Stylized Storytelling Spark & Forge Anvil Quill */}
            <path d="M16 9L18.2 13.8L23 16L18.2 18.2L16 23L13.8 18.2L9 16L13.8 13.8L16 9Z" fill="url(#forgeGrad)" />
            <circle cx="16" cy="16" r="1.5" fill="#FFFFFF" />
            <defs>
              <linearGradient id="forgeGrad" x1="9" y1="9" x2="23" y2="23" gradientUnits="userSpaceOnUse">
                <stop stopColor="#06B6D4" />
                <stop offset="0.5" stopColor="#8B5CF6" />
                <stop offset="1" stopColor="#F59E0B" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-1.5 leading-none">
          <span className="font-display font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-cyan-400 text-base sm:text-lg">
            STORYFORGE
          </span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-400 border border-violet-500/30">
            AI
          </span>
        </div>
        {showTagline && (
          <p className="text-[10px] font-medium text-slate-400 tracking-widest uppercase mt-1">
            Imagine • Create • Animate
          </p>
        )}
      </div>
    </div>
  );
};
