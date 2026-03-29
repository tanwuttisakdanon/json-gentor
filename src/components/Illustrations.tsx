// ภาพ SVG สำหรับหน้าต่างที่ยังไม่มีข้อมูล (Empty State)
export const EmptyBoxGraphic = ({ className = "w-48 h-48" }: { className?: string }) => (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M100 145L45 115V55L100 85L155 55V115L100 145Z" fill="#F4F4F5" stroke="#E4E4E7" strokeWidth="4" strokeLinejoin="round" />
        <path d="M100 85L45 55L100 25L155 55L100 85Z" fill="#FAFAFA" stroke="#D4D4D8" strokeWidth="4" strokeLinejoin="round" />
        <path d="M100 85V145" stroke="#D4D4D8" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="100" cy="55" r="8" fill="#A3B18A" />
        <path d="M70 110L85 118" stroke="#A3B18A" strokeWidth="4" strokeLinecap="round" />
    </svg>
);

// ภาพ SVG สำหรับหน้า Welcome/Hero
export const DataGraphic = ({ className = "w-64 h-64" }: { className?: string }) => (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <rect x="30" y="40" width="140" height="120" rx="12" fill="#FAFAFA" stroke="#E4E4E7" strokeWidth="4" />
        <path d="M30 75H170" stroke="#E4E4E7" strokeWidth="4" />
        <circle cx="50" cy="57.5" r="5.5" fill="#D4D4D8" />
        <circle cx="70" cy="57.5" r="5.5" fill="#D4D4D8" />
        <rect x="50" y="100" width="100" height="8" rx="4" fill="#E4E4E7" />
        <rect x="50" y="120" width="60" height="8" rx="4" fill="#A3B18A" />
        <rect x="50" y="140" width="80" height="8" rx="4" fill="#E4E4E7" />
        <path d="M140 124L150 124" stroke="#A3B18A" strokeWidth="4" strokeLinecap="round" />
    </svg>
);