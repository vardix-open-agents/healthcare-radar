'use client';

import { ReactNode } from 'react';

interface SlideProps {
  title: string;
  children: ReactNode;
  type?: 'title' | 'content' | 'split' | 'data';
  className?: string;
}

export default function Slide({ 
  title, 
  children, 
  type = 'content',
  className = '' 
}: SlideProps) {
  const typeStyles = {
    title: 'text-center',
    content: '',
    split: 'grid grid-cols-2 gap-8',
    data: '',
  };

  return (
    <div className={`${typeStyles[type]} ${className}`}>
      {/* Slide Title */}
      {type === 'title' ? (
        <h2 className="text-4xl font-bold gradient-text mb-8">{title}</h2>
      ) : (
        <h2 className="text-2xl font-semibold text-zinc-100 mb-6 pb-4 border-b border-zinc-700">
          {title}
        </h2>
      )}

      {/* Slide Content */}
      <div className="text-zinc-300 leading-relaxed">
        {children}
      </div>
    </div>
  );
}

// Specialized slide types
export function TitleSlide({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <Slide title={title} type="title">
      {subtitle && (
        <p className="text-xl text-zinc-400 mt-4">{subtitle}</p>
      )}
    </Slide>
  );
}

export function ContentSlide({ title, points }: { title: string; points: string[] }) {
  return (
    <Slide title={title} type="content">
      <ul className="space-y-3">
        {points.map((point, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="text-cyan-500 mt-1">•</span>
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </Slide>
  );
}

export function DataSlide({ 
  title, 
  data 
}: { 
  title: string; 
  data: { label: string; value: string | number; change?: string }[] 
}) {
  return (
    <Slide title={title} type="data">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {data.map((item, i) => (
          <div key={i} className="bg-zinc-700/50 rounded-lg p-4">
            <div className="text-zinc-400 text-sm mb-1">{item.label}</div>
            <div className="text-2xl font-bold text-zinc-100">{item.value}</div>
            {item.change && (
              <div className={`text-sm mt-1 ${
                item.change.startsWith('+') ? 'text-emerald-400' : 
                item.change.startsWith('-') ? 'text-red-400' : 'text-zinc-400'
              }`}>
                {item.change}
              </div>
            )}
          </div>
        ))}
      </div>
    </Slide>
  );
}
