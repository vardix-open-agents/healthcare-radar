'use client';

import { ReactNode } from 'react';

interface SlideDeckProps {
  children: ReactNode;
  title?: string;
  currentSlide?: number;
  onSlideChange?: (index: number) => void;
}

export default function SlideDeck({ 
  children, 
  title,
  currentSlide = 0,
  onSlideChange 
}: SlideDeckProps) {
  const slides = Array.isArray(children) ? children : [children];
  const totalSlides = slides.length;

  const goToNext = () => {
    if (currentSlide < totalSlides - 1 && onSlideChange) {
      onSlideChange(currentSlide + 1);
    }
  };

  const goToPrev = () => {
    if (currentSlide > 0 && onSlideChange) {
      onSlideChange(currentSlide - 1);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Title */}
      {title && (
        <h1 className="text-2xl font-bold text-zinc-100 mb-6">{title}</h1>
      )}

      {/* Slides Container */}
      <div className="relative bg-zinc-800/50 border border-zinc-700 rounded-xl overflow-hidden">
        {/* Current Slide */}
        <div className="min-h-[400px] p-8">
          {slides[currentSlide]}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between p-4 border-t border-zinc-700 bg-zinc-800/50">
          <button
            onClick={goToPrev}
            disabled={currentSlide === 0}
            className="px-4 py-2 text-sm bg-zinc-700 rounded-lg text-zinc-300 hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ← Previous
          </button>
          
          <div className="flex items-center gap-2">
            {Array.from({ length: totalSlides }).map((_, i) => (
              <button
                key={i}
                onClick={() => onSlideChange?.(i)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === currentSlide
                    ? 'bg-cyan-500'
                    : 'bg-zinc-600 hover:bg-zinc-500'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={goToNext}
            disabled={currentSlide === totalSlides - 1}
            className="px-4 py-2 text-sm bg-zinc-700 rounded-lg text-zinc-300 hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next →
          </button>
        </div>
      </div>

      {/* Slide Counter */}
      <div className="text-center text-zinc-500 text-sm mt-4">
        Slide {currentSlide + 1} of {totalSlides}
      </div>
    </div>
  );
}
