import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import Logo from '../assets/LOGO.webp';

// Map each badge ID to a specific beautiful gradient and accent color
const BADGE_STYLES = {
    'first-step': {
        bg: 'linear-gradient(135deg, #0f766e 0%, #042f2e 100%)', // Teal to dark teal
        accent: '#2dd4bf',
        blur1: '#14b8a6',
        blur2: '#0f766e'
    },
    'goal-setter': {
        bg: 'linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%)', // Blue to dark blue
        accent: '#60a5fa',
        blur1: '#3b82f6',
        blur2: '#1d4ed8'
    },
    'first-log': {
        bg: 'linear-gradient(135deg, #6d28d9 0%, #4c1d95 100%)', // Purple to dark purple
        accent: '#a78bfa',
        blur1: '#8b5cf6',
        blur2: '#7c3aed'
    },
    'streak-7': {
        bg: 'linear-gradient(135deg, #b45309 0%, #78350f 100%)', // Orange/Fire to dark brown
        accent: '#fbbf24',
        blur1: '#f59e0b',
        blur2: '#d97706'
    },
    'dedicated': {
        bg: 'linear-gradient(135deg, #0369a1 0%, #082f49 100%)', // Sky blue to deep navy
        accent: '#38bdf8',
        blur1: '#0ea5e9',
        blur2: '#0284c7'
    },
    'committed': {
        bg: 'linear-gradient(135deg, #be185d 0%, #831843 100%)', // Pink/Ruby to dark maroon
        accent: '#f472b6',
        blur1: '#ec4899',
        blur2: '#db2777'
    },
    'consultation': {
        bg: 'linear-gradient(135deg, #0f172a 0%, #172554 100%)', // Midnight blue to navy
        accent: '#38bdf8',
        blur1: '#1e40af',
        blur2: '#1e3a8a'
    },
    'purchaser': {
        bg: 'linear-gradient(135deg, #713f12 0%, #422006 100%)', // Deep bronze/gold
        accent: '#facc15',
        blur1: '#a16207',
        blur2: '#854d0e'
    },
    // Default fallback
    'default': {
        bg: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)', // Original green
        accent: '#34d399',
        blur1: '#34d399',
        blur2: '#10b981'
    }
};

/**
 * An invisible component that renders a high-fidelity glassmorphism card,
 * captures it with html2canvas, and triggers a download.
 */
function AchievementShareCard({ badge, userName, date, onComplete }) {
    const cardRef = useRef(null);

    const handleDownload = async () => {
        if (!cardRef.current) return;

        try {
            const canvas = await html2canvas(cardRef.current, {
                scale: 2, // 2x resolution for crisp social sharing
                backgroundColor: null, 
                useCORS: true,
                logging: false,
                onclone: (clonedDoc) => {
                    const styles = clonedDoc.querySelectorAll('style, link[rel="stylesheet"]');
                    styles.forEach(s => s.remove());
                }
            });

            const url = canvas.toDataURL('image/png', 1.0);
            const link = document.createElement('a');
            link.download = `dietwithdee-${badge.id}-achievement.png`;
            link.href = url;
            link.click();
            
        } catch (err) {
            console.error('Failed to generate sharing image:', err);
        } finally {
            if (onComplete) onComplete();
        }
    };

    React.useEffect(() => {
        const timer = setTimeout(() => {
            handleDownload();
        }, 300);
        return () => clearTimeout(timer);
    }, []);

    const style = BADGE_STYLES[badge.id] || BADGE_STYLES['default'];

    return (
        <div style={{ position: 'fixed', left: '-9999px', top: 0 }}>
            {/* The actual 1080x1080 canvas container */}
            <div
                ref={cardRef}
                style={{
                    width: '1080px',
                    height: '1080px',
                    background: style.bg,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    fontFamily: 'Arial, Helvetica, sans-serif',
                    overflow: 'hidden'
                }}
            >
                {/* Decorative background elements matching the badge's color scheme */}
                <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '500px', height: '500px', background: style.blur1, borderRadius: '50%', filter: 'blur(100px)', opacity: 0.3 }} />
                <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '600px', height: '600px', background: style.blur2, borderRadius: '50%', filter: 'blur(120px)', opacity: 0.4 }} />
                
                {/* Additional light flare for premium feel */}
                <div style={{ position: 'absolute', top: '20%', right: '10%', width: '300px', height: '300px', background: '#ffffff', borderRadius: '50%', filter: 'blur(150px)', opacity: 0.15 }} />

                {/* Glassmorphism Panel */}
                <div
                    style={{
                        background: 'rgba(255, 255, 255, 0.08)',
                        backdropFilter: 'blur(24px)',
                        WebkitBackdropFilter: 'blur(24px)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        borderTop: '1px solid rgba(255, 255, 255, 0.5)',
                        borderLeft: '1px solid rgba(255, 255, 255, 0.5)',
                        borderRadius: '40px',
                        padding: '100px 80px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.5), inset 0 0 0 1px rgba(255,255,255,0.1)',
                        zIndex: 10,
                        width: '75%',
                        maxWidth: '800px'
                    }}
                >
                    <div style={{ fontSize: '150px', lineHeight: 1, marginBottom: '40px', filter: 'drop-shadow(0 15px 25px rgba(0,0,0,0.3))' }}>
                        {badge.emoji}
                    </div>
                    
                    <h1 style={{ color: 'white', fontSize: '72px', fontWeight: 800, margin: '0 0 20px 0', letterSpacing: '-1px', textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
                        {badge.title}
                    </h1>
                    
                    <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '32px', margin: '0 0 60px 0', fontWeight: 500 }}>
                        {badge.description}
                    </p>

                    <div style={{ width: '80px', height: '5px', background: style.accent, borderRadius: '3px', marginBottom: '60px', boxShadow: `0 0 15px ${style.accent}` }} />

                    <div style={{ color: 'white', fontSize: '28px', fontWeight: 600 }}>
                        Earned by <span style={{ color: style.accent, textShadow: `0 0 20px ${style.accent}40` }}>{userName}</span>
                    </div>
                    
                    <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '24px', marginTop: '12px', fontWeight: 500 }}>
                        {date}
                    </div>
                </div>

                {/* Footer branding */}
                <div style={{ position: 'absolute', bottom: '50px', display: 'flex', alignItems: 'center', gap: '20px', zIndex: 10 }}>
                    <img src={Logo} alt="DietWithDee" style={{ width: '64px', height: 'auto', borderRadius: '14px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }} />
                    <div style={{ color: 'rgba(255, 255, 255, 0.95)', fontSize: '28px', fontWeight: 700, letterSpacing: '1px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>
                        DietWithDee
                        <span style={{ color: 'rgba(255, 255, 255, 0.4)', margin: '0 16px', fontWeight: 300 }}>|</span>
                        <span style={{ color: style.accent, fontWeight: 500 }}>dietwithdee.org</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AchievementShareCard;
