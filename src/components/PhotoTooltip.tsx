import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { PhotoWindows } from '../types';
import { formatRange } from '../utils/time';

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

interface TooltipPosition {
  top: number;
  left: number;
  placement: 'top' | 'bottom';
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
  const [position, setPosition] = useState<TooltipPosition>({
    top: 0,
    left: 0,
    placement: 'top',
  });

  const updatePosition = useCallback(() => {
    const button = buttonRef.current;
    const tooltip = tooltipRef.current;
    if (!button || !tooltip) return;

    const buttonRect = button.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    const spacing = 10;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let left = align === 'left' ? buttonRect.left : buttonRect.right - tooltipRect.width;
    left = Math.min(Math.max(left, spacing), viewportWidth - tooltipRect.width - spacing);

    let placement: TooltipPosition['placement'] = 'top';
    let top = buttonRect.top - tooltipRect.height - spacing;

    if (top < spacing) {
      placement = 'bottom';
      top = buttonRect.bottom + spacing;
    }

    if (top + tooltipRect.height > viewportHeight - spacing) {
      top = Math.max(spacing, viewportHeight - tooltipRect.height - spacing);
    }

    setPosition({ top, left, placement });
  }, [align]);

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;

    const handleOutsidePress = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (buttonRef.current?.contains(target) || tooltipRef.current?.contains(target)) {
        return;
      }

      setOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    const handleViewportChange = () => updatePosition();

    document.addEventListener('mousedown', handleOutsidePress);
    document.addEventListener('touchstart', handleOutsidePress);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('scroll', handleViewportChange, true);

    return () => {
      document.removeEventListener('mousedown', handleOutsidePress);
      document.removeEventListener('touchstart', handleOutsidePress);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('scroll', handleViewportChange, true);
    };
  }, [open, updatePosition]);

  const classes = ['photo-tooltip', align === 'left' ? 'align-left' : 'align-right', className]
    .filter(Boolean)
    .join(' ');

  const popup = open
    ? createPortal(
        <div className="tooltip-layer">
          <div
            ref={tooltipRef}
            id={tooltipId}
            className={`tooltip-panel tooltip-panel-${position.placement}`}
            role="tooltip"
            style={{ top: position.top, left: position.left }}
          >
            <p className="tooltip-title">{title}</p>

            <section className="tooltip-section">
              <p className="tooltip-section-title">{goldenLabel}</p>
              <p className="tooltip-line">
                <span className="tooltip-line-label">{morningLabel}:</span>
                <span className="tooltip-line-value">
                  {formatRange(photoWindows.morningGolden.start, photoWindows.morningGolden.end, timeZone)}
                </span>
              </p>
              <p className="tooltip-line">
                <span className="tooltip-line-label">{eveningLabel}:</span>
                <span className="tooltip-line-value">
                  {formatRange(photoWindows.eveningGolden.start, photoWindows.eveningGolden.end, timeZone)}
                </span>
              </p>
            </section>

            <section className="tooltip-section">
              <p className="tooltip-section-title">{blueLabel}</p>
              <p className="tooltip-line">
                <span className="tooltip-line-label">{morningLabel}:</span>
                <span className="tooltip-line-value">
                  {formatRange(photoWindows.morningBlue.start, photoWindows.morningBlue.end, timeZone)}
                </span>
              </p>
              <p className="tooltip-line">
                <span className="tooltip-line-label">{eveningLabel}:</span>
                <span className="tooltip-line-value">
                  {formatRange(photoWindows.eveningBlue.start, photoWindows.eveningBlue.end, timeZone)}
                </span>
              </p>
            </section>
          </div>
        </div>,
        document.body,
      )
    : null;

  return (
    <>
      <div className={classes}>
        <button
          ref={buttonRef}
          type="button"
          className={`icon-button ${open ? 'is-active' : ''}`}
          aria-label={ariaLabel}
          aria-describedby={open ? tooltipId : undefined}
          aria-expanded={open}
          aria-controls={open ? tooltipId : undefined}
          onClick={() => setOpen((current) => !current)}
        >
          <CameraIcon />
        </button>
      </div>
      {popup}
    </>
  );
};

export default PhotoTooltip;
