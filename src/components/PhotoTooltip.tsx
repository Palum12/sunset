import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { formatRange, getPhotoWindows } from '../utils/time';

type PhotoWindows = ReturnType<typeof getPhotoWindows>;

interface PhotoTooltipProps {
  ariaLabel: string;
  title: string;
  goldenLabel: string;
  blueLabel: string;
  morningLabel: string;
  eveningLabel: string;
  photoWindows: PhotoWindows;
  timeZone: string;
  align?: 'left' | 'right';
  className?: string;
}

const CameraIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden focusable="false">
    <path
      d="M9.5 6.5 11 4.5h2l1.5 2H18a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h3.5Z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="13" r="3.25" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="17.25" cy="8.75" r="0.75" fill="currentColor" />
  </svg>
);

const PhotoTooltip = ({
  ariaLabel,
  title,
  goldenLabel,
  blueLabel,
  morningLabel,
  eveningLabel,
  photoWindows,
  timeZone,
  align = 'right',
  className,
}: PhotoTooltipProps) => {
  const tooltipId = useId();
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const updatePosition = useCallback(() => {
    const button = buttonRef.current;
    const tooltip = tooltipRef.current;
    if (!button || !tooltip) return;

    const buttonRect = button.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    const spacing = 8;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let left = align === 'left' ? buttonRect.left : buttonRect.right - tooltipRect.width;
    let top = buttonRect.bottom + spacing;

    if (top + tooltipRect.height > viewportHeight - spacing) {
      top = buttonRect.top - tooltipRect.height - spacing;
    }

    left = Math.min(Math.max(left, spacing), viewportWidth - tooltipRect.width - spacing);
    top = Math.min(Math.max(top, spacing), viewportHeight - tooltipRect.height - spacing);

    setPosition({ top, left });
  }, [align]);

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;
    const handleUpdate = () => updatePosition();
    window.addEventListener('scroll', handleUpdate, true);
    window.addEventListener('resize', handleUpdate);
    return () => {
      window.removeEventListener('scroll', handleUpdate, true);
      window.removeEventListener('resize', handleUpdate);
    };
  }, [open, updatePosition]);

  const classes = [
    'photo-tooltip',
    align === 'left' ? 'align-left' : 'align-right',
    open ? 'is-open' : null,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        ref={buttonRef}
        type="button"
        className="icon-button"
        aria-label={ariaLabel}
        title={ariaLabel}
        aria-describedby={tooltipId}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        <CameraIcon />
      </button>
      <div
        ref={tooltipRef}
        id={tooltipId}
        className="tooltip-panel"
        role="tooltip"
        aria-hidden={!open}
        style={{ top: position.top, left: position.left }}
      >
        <p className="tooltip-title">{title}</p>
        <div className="tooltip-row">
          <span className="tooltip-label">{goldenLabel}</span>
          <div className="tooltip-times">
            <span>
              <span className="tooltip-meta">{morningLabel}</span>
              {formatRange(photoWindows.morningGolden.start, photoWindows.morningGolden.end, timeZone)}
            </span>
            <span className="tooltip-muted">
              <span className="tooltip-meta">{eveningLabel}</span>
              {formatRange(photoWindows.eveningGolden.start, photoWindows.eveningGolden.end, timeZone)}
            </span>
          </div>
        </div>
        <div className="tooltip-row">
          <span className="tooltip-label">{blueLabel}</span>
          <div className="tooltip-times">
            <span>
              <span className="tooltip-meta">{morningLabel}</span>
              {formatRange(photoWindows.morningBlue.start, photoWindows.morningBlue.end, timeZone)}
            </span>
            <span className="tooltip-muted">
              <span className="tooltip-meta">{eveningLabel}</span>
              {formatRange(photoWindows.eveningBlue.start, photoWindows.eveningBlue.end, timeZone)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoTooltip;
