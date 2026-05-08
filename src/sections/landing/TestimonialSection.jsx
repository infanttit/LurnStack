import React, { useRef, useState, useEffect } from 'react';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "UX Designer",
    company: "CreativeStudio",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
    text: "The courses at LurnStack completely transformed my career. The hands-on projects and expert mentors gave me the confidence to switch from graphic design to UX design.",
    rating: 5
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Full Stack Developer",
    company: "TechStart",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
    text: "Best investment I've made in my career. The curriculum is up-to-date with industry standards, and the community support is incredible.",
    rating: 5
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    role: "Product Manager",
    company: "InnovateLabs",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
    text: "The flexibility of learning at my own pace while working full-time was a game-changer. The instructors are industry experts.",
    rating: 5
  },
  {
    id: 4,
    name: "David Kim",
    role: "Data Scientist",
    company: "AI Solutions",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
    text: "From zero to job-ready in 6 months. The structured learning paths and regular assessments kept me motivated.",
    rating: 5
  },
  {
    id: 5,
    name: "Priya Sharma",
    role: "Digital Marketer",
    company: "GrowthHub",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop",
    text: "The practical assignments and real-world projects made all the difference. I was able to build a portfolio that impressed employers.",
    rating: 5
  },
  {
    id: 6,
    name: "James Wilson",
    role: "Software Engineer",
    company: "TechCorp",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
    text: "The instructors are amazing and the support from the community is unparalleled. Highly recommend LurnStack to anyone looking to upskill.",
    rating: 5
  }
];

// Card width in pixels
const CARD_WIDTH = 380;
// Duration for one full loop (seconds)
const DURATION = 35;

function TestimonialCard({ testimonial }) {
  return (
    <div
      className="relative flex-shrink-0 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
      style={{ width: CARD_WIDTH, height: "100%" }}
    >
      {/* Decorative quote background */}
      <div className="absolute top-4 right-4 text-primary/5">
        <Quote size={80} strokeWidth={1} />
      </div>

      <div className="p-6 flex flex-col h-full">
        {/* Rating stars */}
        <div className="flex gap-1 mb-4">
          {[...Array(testimonial.rating)].map((_, i) => (
            <Star key={i} size={18} className="fill-yellow-400 text-yellow-400" />
          ))}
        </div>

        {/* Testimonial text */}
        <p className="text-gray-700 text-base leading-relaxed mb-6 flex-grow">
          "{testimonial.text}"
        </p>

        {/* Author info */}
        <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
          <img
            src={testimonial.image}
            alt={testimonial.name}
            className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20"
          />
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-gray-900 text-sm truncate">
              {testimonial.name}
            </h4>
            <p className="text-gray-500 text-xs truncate">
              {testimonial.role} at {testimonial.company}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PauseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="white" aria-hidden="true">
      <rect x="3" y="2" width="3" height="12" rx="1" />
      <rect x="10" y="2" width="3" height="12" rx="1" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="white" aria-hidden="true">
      <polygon points="3,2 13,8 3,14" />
    </svg>
  );
}

export default function TestimonialSection() {
  const trackRef = useRef(null);
  const [paused, setPaused] = useState(false);

  // Duplicate the list for seamless looping
  const slides = [...testimonials, ...testimonials];

  // Toggle animation-play-state when paused changes
  useEffect(() => {
    if (trackRef.current) {
      trackRef.current.style.animationPlayState = paused ? "paused" : "running";
    }
  }, [paused]);

  return (
    <section className="relative py-20 bg-gradient-to-br from-gray-50 via-white to-gray-50 overflow-hidden">
      {/* Section header */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="text-center">
         
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            What Our Students Say
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join thousands of successful students who transformed their careers with LurnStack
          </p>
        </div>
      </div>

      {/* Slider container */}
      <div className="relative w-full overflow-hidden select-none" style={{ height: 280 }}>
        {/* Keyframe animation */}
        <style>{`
          @keyframes testimonialMarquee {
            0%   { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>

        {/* Scrolling track */}
        <div
          ref={trackRef}
          className="flex h-full gap-6"
          style={{
            width: slides.length * (CARD_WIDTH + 24), // 24px gap
            animation: `testimonialMarquee ${DURATION}s linear infinite`,
          }}
        >
          {slides.map((testimonial, i) => (
            <TestimonialCard key={`${testimonial.id}-${i}`} testimonial={testimonial} />
          ))}
        </div>

        {/* Gradient overlays for smooth edges */}
        <div className="absolute top-0 left-0 w-20 h-full bg-gradient-to-r from-gray-50 to-transparent pointer-events-none z-10" />
        <div className="absolute top-0 right-0 w-20 h-full bg-gradient-to-l from-gray-50 to-transparent pointer-events-none z-10" />

        {/* Pause/Play button */}
        <button
          onClick={() => setPaused((prev) => !prev)}
          aria-label={paused ? "Play slider" : "Pause slider"}
          className="absolute bottom-4 right-4 z-20 w-9 h-9 rounded-full
                     flex items-center justify-center
                     border border-white/25 cursor-pointer
                     hover:bg-white/20 transition-colors duration-200"
          style={{
            background: "rgba(30,30,30,0.75)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
          }}
        >
          {paused ? <PlayIcon /> : <PauseIcon />}
        </button>
      </div>

      {/* Stats section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center p-6 bg-white/50 rounded-2xl backdrop-blur-sm">
            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">10K+</div>
            <div className="text-gray-600 text-sm">Active Students</div>
          </div>
          <div className="text-center p-6 bg-white/50 rounded-2xl backdrop-blur-sm">
            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">95%</div>
            <div className="text-gray-600 text-sm">Job Placement Rate</div>
          </div>
          <div className="text-center p-6 bg-white/50 rounded-2xl backdrop-blur-sm">
            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">500+</div>
            <div className="text-gray-600 text-sm">Expert Instructors</div>
          </div>
          <div className="text-center p-6 bg-white/50 rounded-2xl backdrop-blur-sm">
            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">4.9</div>
            <div className="text-gray-600 text-sm">Student Rating</div>
          </div>
        </div>
      </div>
    </section>
  );
}
