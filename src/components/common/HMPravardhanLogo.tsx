import React from 'react';

interface HMPravardhanLogoProps {
  className?: string;
  size?: number;
}

/**
 * HM Pravardhan Logo:
 * Represents Education (open book base), Growth/Progress (ascending sprout),
 * and School Leadership (apex star of excellence).
 */
export const HMPravardhanLogo: React.FC<HMPravardhanLogoProps> = ({
  className = 'w-6 h-6',
  size,
}) => {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      width={size}
      height={size}
      aria-label="HM Pravardhan Logo"
    >
      {/* Education: Open Book base */}
      <path
        d="M4 23C8 21.2 12 21.2 15.5 22.8V12.5C12 11 8 11 4 12.8V23Z"
        fill="currentColor"
        fillOpacity="0.2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M28 23C24 21.2 20 21.2 16.5 22.8V12.5C20 11 24 11 28 12.8V23Z"
        fill="currentColor"
        fillOpacity="0.2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 12V23.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      {/* Growth & Progress: Ascending sprout / leaves ("Pravardhan") */}
      <path
        d="M16 17C12.6 14.2 12.2 10.2 15.6 7.2C15.6 10.4 14.4 13.6 16 17Z"
        fill="currentColor"
      />
      <path
        d="M16 17C19.4 14.2 19.8 10.2 16.4 7.2C16.4 10.4 17.6 13.6 16 17Z"
        fill="currentColor"
      />

      {/* School Leadership: Apex Star of Excellence */}
      <path
        d="M16 2.2L17.1 4.7L19.8 5.6L17.1 6.5L16 9L14.9 6.5L12.2 5.6L14.9 4.7L16 2.2Z"
        fill="currentColor"
      />
    </svg>
  );
};
