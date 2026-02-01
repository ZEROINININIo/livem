
import React, { useRef, useState, useEffect } from 'react';

interface VirtualJoystickProps {
  onMove: (x: number, y: number) => void;
}

const VirtualJoystick: React.FC<VirtualJoystickProps> = ({ onMove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [active, setActive] = useState(false);
  const [basePos, setBasePos] = useState({ x: 0, y: 0 });
  const [stickPos, setStickPos] = useState({ x: 0, y: 0 });
  
  const pointerId = useRef<number | null>(null);
  const maxRadius = 60; // Radius for stick movement

  useEffect(() => {
    // Robust touch detection: Check maxTouchPoints (hardware capability) OR coarse pointer
    const checkTouch = () => {
        const hasTouchHardware = navigator.maxTouchPoints > 0;
        const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
        // Enable if either is true to cover iPads with mice/pencils vs pure tablets
        setIsVisible(hasTouchHardware || isCoarsePointer);
    };
    checkTouch();
    window.addEventListener('resize', checkTouch);
    return () => window.removeEventListener('resize', checkTouch);
  }, []);

  if (!isVisible) return null;

  const handlePointerDown = (e: React.PointerEvent) => {
      // Restrict joystick to the left 60% of the screen (slightly wider for tablets)
      // This prevents accidental triggers when trying to click buttons on the far right
      if (e.clientX > window.innerWidth * 0.6) return;
      
      // Prevent default to stop scrolling/zooming
      e.preventDefault();
      e.stopPropagation();
      
      e.currentTarget.setPointerCapture(e.pointerId);
      pointerId.current = e.pointerId;
      
      setBasePos({ x: e.clientX, y: e.clientY });
      setStickPos({ x: 0, y: 0 });
      setActive(true);
      onMove(0, 0);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
      if (!active || e.pointerId !== pointerId.current) return;
      e.preventDefault();
      e.stopPropagation();

      const dx = e.clientX - basePos.x;
      const dy = e.clientY - basePos.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      const angle = Math.atan2(dy, dx);
      
      const cappedDist = Math.min(dist, maxRadius);
      const x = Math.cos(angle) * cappedDist;
      const y = Math.sin(angle) * cappedDist;
      
      // Update visual stick position
      setStickPos({ x, y });
      
      // Normalize output -1 to 1 for game logic
      onMove(x / maxRadius, y / maxRadius);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
      if (e.pointerId !== pointerId.current) return;
      e.preventDefault();
      e.stopPropagation();
      setActive(false);
      setStickPos({ x: 0, y: 0 });
      onMove(0, 0);
      pointerId.current = null;
  };

  return (
    <div 
        className="fixed inset-y-0 left-0 w-[60%] z-50 touch-none select-none outline-none"
        style={{ touchAction: 'none' }} // Inline style reinforcement
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerUp}
    >
        {active && (
            <div 
              className="absolute w-32 h-32 rounded-full border-2 border-ash-light/30 bg-ash-black/50 backdrop-blur-sm -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-fade-in"
              style={{ left: basePos.x, top: basePos.y }}
            >
                <div 
                  className="absolute w-12 h-12 rounded-full bg-ash-light shadow-[0_0_15px_rgba(255,255,255,0.5)] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 will-change-transform"
                  style={{ transform: `translate(${stickPos.x}px, ${stickPos.y}px)` }}
                />
            </div>
        )}
        {/* Optional: Visual hint for tablet users could go here if needed */}
    </div>
  );
};

export default VirtualJoystick;
