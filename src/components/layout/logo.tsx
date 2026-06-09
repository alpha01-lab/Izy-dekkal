import React from 'react';

export function Logo({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Container de l'icône - Fond sombre comme sur l'image de référence */}
      <div className="w-10 h-10 rounded-[10px] bg-[#0E1420] flex items-center justify-center shadow-sm relative overflow-hidden flex-shrink-0">
        <svg viewBox="0 0 48 48" className="w-[28px] h-[28px]" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Base Verte (Racines et bas du tronc) */}
          <path d="M12 36C17 36 20 32 21 26H27C28 32 31 36 36 36H12Z" fill="#00853F" />
          <path d="M17 36C15 34 14 36 14 36H17Z" fill="#00853F" />
          <path d="M31 36C33 34 34 36 34 36H31Z" fill="#00853F" />
          
          {/* Tronc Jaune (Milieu et branches principales) */}
          <path d="M21 26.5L19 18L24 22L29 18L27 26.5H21Z" fill="#FDEF42" />
          <path d="M19 18L14 12M19 18L21 12M24 22L24 12M29 18L27 12M29 18L34 12" stroke="#FDEF42" strokeWidth="2.5" strokeLinecap="round" />
          
          {/* Branches Rouges (Haut de l'arbre) */}
          {/* Gauche */}
          <path d="M14 12L10 6M14 12L16 6M12 9L8 8M15 9L18 5" stroke="#E31B23" strokeWidth="2" strokeLinecap="round" />
          {/* Centre Gauche */}
          <path d="M21 12L19 5M21 12L22 6M20 8L17 5M21.5 8L24 4" stroke="#E31B23" strokeWidth="2" strokeLinecap="round" />
          {/* Centre Droit */}
          <path d="M27 12L29 5M27 12L26 6M28 8L31 5M26.5 8L24 4" stroke="#E31B23" strokeWidth="2" strokeLinecap="round" />
          {/* Droit */}
          <path d="M34 12L38 6M34 12L32 6M36 9L40 8M33 9L30 5" stroke="#E31B23" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>

      {/* Texte du logo avec le point orange */}
      <div className="flex items-baseline">
        <span className="font-extrabold text-[22px] tracking-tight text-[#111827]">Dëkkal</span>
        <span className="w-2 h-2 rounded-full bg-[#FF6B00] ml-[3px] mb-[3px]"></span>
      </div>
    </div>
  );
}
