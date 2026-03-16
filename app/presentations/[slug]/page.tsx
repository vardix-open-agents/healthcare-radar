'use client';

import { useState, useEffect } from 'react';
import SlideDeck from '@/components/SlideDeck';
import Slide, { ContentSlide, DataSlide, TitleSlide } from '@/components/Slide';

interface SlideData {
  id: string;
  title: string;
  content: string;
  type: string;
}

interface PresentationData {
  slug: string;
  title: string;
  slides: SlideData[];
}

export default function PresentationDetailPage({ params }: { params: { slug: string } }) {
  const [presentation, setPresentation] = useState<PresentationData | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In production, this would fetch from API
    // For now, generate a demo presentation
    const demoPresentation: PresentationData = {
      slug: params.slug,
      title: params.slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      slides: [
        {
          id: '1',
          title: 'Healthcare Radar Overview',
          type: 'title',
          content: 'Market Intelligence for Varden',
        },
        {
          id: '2',
          title: 'Key Findings',
          type: 'content',
          content: 'AI documentation is exploding globally\nNordic market underserved by US-centric solutions\nSwedish-language focus is key differentiator',
        },
        {
          id: '3',
          title: 'Top Opportunities',
          type: 'content',
          content: 'Abridge - Best in KLAS 2025 & 2026\nTandem Health - Nordic AI scribing\nDoctrin - Digital patient communication',
        },
        {
          id: '4',
          title: 'Metrics',
          type: 'data',
          content: JSON.stringify({
            entries: 400,
            themes: 15,
            opportunities: 50,
            discoveries: 25
          }),
        },
        {
          id: '5',
          title: 'Next Steps',
          type: 'content',
          content: 'Deep dive into top 10 opportunities\nPartner outreach to Tandem Health\nBuild vs Buy analysis for AI scribing',
        },
      ],
    };

    setPresentation(demoPresentation);
    setLoading(false);
  }, [params.slug]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center text-zinc-400">Loading presentation...</div>
      </div>
    );
  }

  if (!presentation) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-zinc-100 mb-4">Presentation not found</h1>
          <p className="text-zinc-400">The requested presentation could not be loaded.</p>
        </div>
      </div>
    );
  }

  const renderSlide = (slide: SlideData) => {
    switch (slide.type) {
      case 'title':
        return <TitleSlide title={slide.title} subtitle={slide.content} />;
      
      case 'content':
        return (
          <ContentSlide
            title={slide.title}
            points={slide.content.split('\n').filter(Boolean)}
          />
        );
      
      case 'data':
        try {
          const data = JSON.parse(slide.content);
          const dataPoints = Object.entries(data).map(([label, value]) => ({
            label: label.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            value: value as string | number,
          }));
          return <DataSlide title={slide.title} data={dataPoints} />;
        } catch {
          return <Slide title={slide.title}>{slide.content}</Slide>;
        }
      
      default:
        return (
          <Slide title={slide.title}>
            <div className="whitespace-pre-wrap">{slide.content}</div>
          </Slide>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <SlideDeck
        title={presentation.title}
        currentSlide={currentSlide}
        onSlideChange={setCurrentSlide}
      >
        {presentation.slides.map((slide) => (
          <div key={slide.id}>
            {renderSlide(slide)}
          </div>
        ))}
      </SlideDeck>
    </div>
  );
}
