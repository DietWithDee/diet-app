import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { Minus, Plus, Edit3 } from 'lucide-react';
import { useWebHaptics } from 'web-haptics/react';
import { snapToStep } from '../utils/knowYourBodyFlow';

const TICK_PX = 12;
const HAPTIC_THROTTLE_MS = 24;

/**
 * Interactive horizontal tactile ruler scrubber with tick haptics via web-haptics
 * plus tap-to-type numeric override and fine +/- buttons.
 */
const HapticRulerSlider = ({
  label,
  icon,
  value,
  onChange,
  min,
  max,
  step = 1,
  majorEvery = 5,
  unit = '',
  formatDisplay = null,
  helperText = null
}) => {
  const { trigger } = useWebHaptics();
  const trackRef = useRef(null);
  const lastEmittedRef = useRef(snapToStep(value ?? min, step, min, max));
  const lastHapticAtRef = useRef(0);
  const programmaticScrollRef = useRef(false);
  const draggingMouseRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartScrollRef = useRef(0);

  const [isEditingDirect, setIsEditingDirect] = useState(false);
  const [directDraft, setDirectDraft] = useState('');

  const totalSteps = Math.max(1, Math.round((max - min) / step));
  const currentValue = snapToStep(value ?? min, step, min, max);
  const currentIndex = Math.round((currentValue - min) / step);

  const tickIndices = useMemo(
    () => Array.from({ length: totalSteps + 1 }, (_, i) => i),
    [totalSteps]
  );

  const scrollToIndex = useCallback((idx, smooth = false) => {
    const track = trackRef.current;
    if (!track) return;
    const clampedIdx = Math.max(0, Math.min(totalSteps, idx));
    const targetLeft = clampedIdx * TICK_PX;
    if (Math.abs(track.scrollLeft - targetLeft) < 2) return;

    programmaticScrollRef.current = true;
    track.scrollTo({
      left: targetLeft,
      behavior: smooth ? 'smooth' : 'auto'
    });
    setTimeout(() => {
      programmaticScrollRef.current = false;
    }, smooth ? 260 : 60);
  }, [totalSteps]);

  // Keep scroll position synced when props/units/defaults change from outside
  useEffect(() => {
    lastEmittedRef.current = currentValue;
    scrollToIndex(currentIndex, false);
  }, [currentIndex, currentValue, scrollToIndex]);

  const fireTickHaptic = useCallback((tickIdx) => {
    const now = performance.now();
    if (now - lastHapticAtRef.current < HAPTIC_THROTTLE_MS) return;
    lastHapticAtRef.current = now;
    try {
      const snappedVal = snapToStep(min + tickIdx * step, step, min, max);
      const isMajor = Math.abs(snappedVal % majorEvery) < 0.001;
      trigger(isMajor ? 'light' : 'selection');
    } catch {
      // Ignore if vibration/audio unavailable on host
    }
  }, [min, step, max, majorEvery, trigger]);

  const handleTrackScroll = () => {
    if (programmaticScrollRef.current || !trackRef.current) return;
    const rawIdx = Math.round(trackRef.current.scrollLeft / TICK_PX);
    const clampedIdx = Math.max(0, Math.min(totalSteps, rawIdx));
    const nextVal = snapToStep(min + clampedIdx * step, step, min, max);

    if (nextVal !== lastEmittedRef.current) {
      lastEmittedRef.current = nextVal;
      fireTickHaptic(clampedIdx);
      onChange(nextVal);
    }
  };

  const nudgeStep = (direction) => {
    const nextIdx = Math.max(0, Math.min(totalSteps, currentIndex + direction));
    const nextVal = snapToStep(min + nextIdx * step, step, min, max);
    if (nextVal !== currentValue) {
      lastEmittedRef.current = nextVal;
      fireTickHaptic(nextIdx);
      onChange(nextVal);
      scrollToIndex(nextIdx, true);
    }
  };

  const handleMouseDown = (e) => {
    if (e.pointerType !== 'mouse' || !trackRef.current) return;
    draggingMouseRef.current = true;
    dragStartXRef.current = e.clientX;
    dragStartScrollRef.current = trackRef.current.scrollLeft;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handleMouseMove = (e) => {
    if (!draggingMouseRef.current || !trackRef.current) return;
    const dx = e.clientX - dragStartXRef.current;
    trackRef.current.scrollLeft = dragStartScrollRef.current - dx;
  };

  const handleMouseUp = (e) => {
    if (!draggingMouseRef.current) return;
    draggingMouseRef.current = false;
    if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    if (trackRef.current) {
      const snappedIdx = Math.round(trackRef.current.scrollLeft / TICK_PX);
      scrollToIndex(snappedIdx, true);
    }
  };

  const commitDirectEdit = () => {
    setIsEditingDirect(false);
    const parsed = parseFloat(directDraft);
    if (Number.isFinite(parsed)) {
      const snapped = snapToStep(parsed, step, min, max);
      lastEmittedRef.current = snapped;
      onChange(snapped);
      scrollToIndex(Math.round((snapped - min) / step), true);
      try {
        trigger('light');
      } catch {
        // Ignore haptics errors
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      nudgeStep(1);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      nudgeStep(-1);
    } else if (e.key === 'PageUp') {
      e.preventDefault();
      nudgeStep(5);
    } else if (e.key === 'PageDown') {
      e.preventDefault();
      nudgeStep(-5);
    }
  };

  const formattedMain = formatDisplay
    ? formatDisplay(currentValue)
    : Number.isInteger(step)
    ? String(currentValue)
    : currentValue.toFixed(1);

  return (
    <div className="rounded-2xl border border-stone-200/90 bg-stone-50/50 p-4 sm:p-5 space-y-3">
      {/* Header Row + Live Readout */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm sm:text-base font-bold text-stone-800">
          {icon && <span className="text-emerald-700">{icon}</span>}
          <span>{label}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            aria-label={`Decrease ${label}`}
            onClick={() => nudgeStep(-1)}
            disabled={currentValue <= min}
            className="w-7 h-7 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-600 hover:border-emerald-400 hover:text-emerald-800 disabled:opacity-40 cursor-pointer transition-colors"
          >
            <Minus size={13} />
          </button>

          {isEditingDirect ? (
            <input
              type="number"
              step={step}
              min={min}
              max={max}
              autoFocus
              value={directDraft}
              onChange={(e) => setDirectDraft(e.target.value)}
              onBlur={commitDirectEdit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitDirectEdit();
                if (e.key === 'Escape') setIsEditingDirect(false);
              }}
              className="w-20 px-2 py-1 text-center font-bold text-lg text-stone-900 bg-white border-2 border-[#F6841F] rounded-xl focus:outline-none"
            />
          ) : (
            <button
              type="button"
              onClick={() => {
                setDirectDraft(String(currentValue));
                setIsEditingDirect(true);
              }}
              title="Tap to type exact number"
              className="group px-3 py-1 rounded-xl bg-white border border-stone-200 hover:border-orange-300 flex items-baseline gap-1.5 cursor-pointer transition-colors"
            >
              <span className="text-xl sm:text-2xl font-bold text-stone-900 tabular-nums">
                {formattedMain}
              </span>
              {unit && !formatDisplay && (
                <span className="text-xs font-semibold text-stone-500">{unit}</span>
              )}
              <Edit3 size={11} className="text-stone-400 group-hover:text-[#F6841F] self-center ml-0.5" />
            </button>
          )}

          <button
            type="button"
            aria-label={`Increase ${label}`}
            onClick={() => nudgeStep(1)}
            disabled={currentValue >= max}
            className="w-7 h-7 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-600 hover:border-emerald-400 hover:text-emerald-800 disabled:opacity-40 cursor-pointer transition-colors"
          >
            <Plus size={13} />
          </button>
        </div>
      </div>

      {/* Horizontal Tactile Ruler Track */}
      <div
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={currentValue}
        onKeyDown={handleKeyDown}
        className="relative h-16 rounded-xl bg-white border border-stone-200/90 overflow-hidden focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
      >
        {/* Center Hairline Indicator */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center"
        >
          <div className="w-2.5 h-2.5 rotate-45 bg-[#F6841F] -mt-1.5 rounded-[2px] shadow-xs" />
          <div className="w-[2px] flex-1 bg-[#F6841F]" />
        </div>

        {/* Left & Right Edge Fades */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-white to-transparent z-10"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-white to-transparent z-10"
        />

        {/* Scrollable Ruler Tape */}
        <div
          ref={trackRef}
          onScroll={handleTrackScroll}
          onPointerDown={handleMouseDown}
          onPointerMove={handleMouseMove}
          onPointerUp={handleMouseUp}
          onPointerCancel={handleMouseUp}
          className="h-full overflow-x-auto no-scrollbar snap-x snap-proximity flex items-end cursor-grab active:cursor-grabbing touch-pan-x"
          style={{ paddingInline: `calc(50% - ${TICK_PX / 2}px)` }}
        >
          {tickIndices.map((idx) => {
            const val = snapToStep(min + idx * step, step, min, max);
            const isMajor = Math.abs(val % majorEvery) < 0.001;
            const isMid = !isMajor && step < 1 && Math.abs(val % 1) < 0.001;
            const labelText = formatDisplay
              ? formatDisplay(val)
              : String(val);

            return (
              <div
                key={idx}
                onClick={() => {
                  const target = snapToStep(val, step, min, max);
                  if (target !== currentValue) {
                    lastEmittedRef.current = target;
                    fireTickHaptic(idx);
                    onChange(target);
                  }
                  scrollToIndex(idx, true);
                }}
                style={{ width: `${TICK_PX}px` }}
                className="shrink-0 snap-center flex flex-col items-center justify-end pb-2 h-full cursor-pointer"
              >
                {isMajor && (
                  <span className="text-[10px] font-semibold text-stone-400 mb-1.5 whitespace-nowrap select-none">
                    {labelText}
                  </span>
                )}
                <div
                  className={`rounded-full transition-colors ${
                    isMajor
                      ? 'w-[2px] h-5 bg-stone-500'
                      : isMid
                      ? 'w-[1.5px] h-3.5 bg-stone-300'
                      : 'w-[1px] h-2.5 bg-stone-300/90'
                  }`}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-stone-500">
        <span>Slide sideways or tap the number to type</span>
        {helperText && <span className="font-semibold text-emerald-700">{helperText}</span>}
      </div>
    </div>
  );
};

export default HapticRulerSlider;
