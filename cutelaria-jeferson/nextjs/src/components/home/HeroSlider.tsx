'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import Image from 'next/image';
import Link from 'next/link';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { HERO_SLIDES } from '@/data/products';

export default function HeroSlider() {
  return (
    <section className="mt-[110px] relative" style={{ height: 'min(85vh, 700px)' }}>
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        autoplay={{ delay: 5500, disableOnInteraction: false, pauseOnMouseEnter: true }}
        pagination={{ clickable: true }}
        navigation
        loop
        className="h-full w-full"
      >
        {HERO_SLIDES.map((slide, i) => (
          <SwiperSlide key={i}>
            <div className="relative h-full w-full">
              {/* Background */}
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                priority={i === 0}
                sizes="100vw"
                className="object-cover"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-hero-overlay" />

              {/* Content */}
              <div className="absolute inset-0 flex items-center">
                <div className="max-w-screen-xl mx-auto px-8 md:px-12 max-w-xl">
                  <span className="badge-red mb-4 inline-block animate-fade-up">
                    {slide.badge}
                  </span>
                  <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-4 animate-fade-up"
                      style={{ animationDelay: '0.1s' }}>
                    {slide.title.split('\n').map((line, j) => {
                      const parts = line.split(slide.titleHighlight);
                      return (
                        <span key={j}>
                          {parts[0]}
                          {line.includes(slide.titleHighlight) && (
                            <span className="text-gradient-gold">{slide.titleHighlight}</span>
                          )}
                          {parts[1]}
                          {j < slide.title.split('\n').length - 1 && <br />}
                        </span>
                      );
                    })}
                  </h1>
                  <p className="text-white/80 text-base md:text-lg mb-8 animate-fade-up" style={{ animationDelay: '0.2s' }}>
                    {slide.subtitle}
                  </p>
                  <div className="flex gap-4 flex-wrap animate-fade-up" style={{ animationDelay: '0.3s' }}>
                    <Link href={slide.btnPrimary.href} className="btn-primary">
                      {slide.btnPrimary.text} →
                    </Link>
                    <Link href={slide.btnSecondary.href} className="btn-outline">
                      {slide.btnSecondary.text}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
