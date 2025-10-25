import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Heart, Users, Linkedin, Github } from 'lucide-react';

export default function WeeChatLanding() {
  const navigate = useNavigate();

  const [scrollY, setScrollY] = useState(0);
  const [visibleSections, setVisibleSections] = useState({});
  const sectionRefs = useRef({});

  // Scroll tracking for aurora
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // IntersectionObserver for fade in/out
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setVisibleSections((prev) => ({
            ...prev,
            [entry.target.dataset.section]: entry.isIntersecting,
          }));
        });
      },
      { threshold: 0.1 }
    );

    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const sectionStyle = (section) => ({
    opacity: visibleSections[section] ? 1 : 0,
    transform: visibleSections[section] ? 'translateY(0)' : 'translateY(48px)',
    transition: 'opacity 1s ease-in-out, transform 1s ease-in-out',
  });

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Northern Lights Aurora Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0">
          <div
            className="absolute top-0 left-0 w-full h-full opacity-60"
            style={{
              background: `
                radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0, 255, 170, 0.3), transparent),
                radial-gradient(ellipse 60% 40% at 30% 10%, rgba(100, 200, 255, 0.25), transparent),
                radial-gradient(ellipse 70% 50% at 70% 5%, rgba(180, 100, 255, 0.3), transparent),
                radial-gradient(ellipse 50% 30% at 45% 15%, rgba(255, 100, 200, 0.2), transparent)
              `,
              filter: 'blur(60px)',
              transform: `translateY(${scrollY * 0.3}px)`,
              animation: 'aurora 20s ease-in-out infinite',
            }}
          />
          <div
            className="absolute top-0 left-0 w-full h-full opacity-40"
            style={{
              background: `
                radial-gradient(ellipse 90% 60% at 20% 0%, rgba(0, 255, 170, 0.25), transparent),
                radial-gradient(ellipse 70% 50% at 80% 5%, rgba(180, 100, 255, 0.25), transparent),
                radial-gradient(ellipse 60% 40% at 50% 10%, rgba(100, 200, 255, 0.2), transparent)
              `,
              filter: 'blur(80px)',
              transform: `translateY(${scrollY * 0.2}px)`,
              animation: 'aurora2 25s ease-in-out infinite',
            }}
          />
        </div>
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50">
        <div className="relative backdrop-blur-2xl bg-gradient-to-r from-black/60 via-black/70 to-black/60 border-b border-white/20 shadow-lg shadow-black/50">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between relative">
            <div className="flex items-center space-x-2">
              <MessageCircle className="w-8 h-8 text-blue-400" />
              <span className="text-2xl font-bold">Wee-Chat</span>
            </div>

            <div className="flex items-center space-x-4">
              <button className="px-6 py-2 rounded-full backdrop-blur-xl bg-white/10 border border-white/30 hover:bg-white/20 hover:border-white/40 transition-all duration-300 shadow-lg shadow-black/20"
              onClick={() => navigate('/sign-in')}>
                Login
              </button>
              <button className="px-6 py-2 rounded-full backdrop-blur-xl bg-gradient-to-r from-blue-500/80 to-purple-500/80 border border-white/30 hover:from-blue-400/80 hover:to-purple-400/80 transition-all duration-300 shadow-xl shadow-blue-500/30"
               onClick={() => navigate('/sign-up')}>
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        ref={(el) => (sectionRefs.current.hero = el)}
        data-section="hero"
        className="relative min-h-screen flex items-center justify-center px-6 pt-20"
        style={sectionStyle('hero')}
      >
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <h1 className="text-7xl md:text-9xl font-bold mb-6 leading-tight">
            <span className="block">Welcome to</span>
            <span
              className="block mt-2 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent"
              style={{ fontFamily: "'Dancing Script', cursive" }}
            >
              Wee-Chat
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Share memes, connect instantly, and chat in real-time. Your new favorite social experience starts here.
          </p>
          <button className="px-10 py-4 text-lg rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition-all duration-300 shadow-2xl shadow-blue-500/50 hover:scale-105 transform">
            Get Started
          </button>
        </div>
      </section>

      {/* Experience Section */}
      <section
        ref={(el) => (sectionRefs.current.experience = el)}
        data-section="experience"
        className="relative py-32 px-6"
        style={sectionStyle('experience')}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-7xl font-bold mb-12 bg-gradient-to-r from-blue-200 via-purple-200 to-cyan-200 bg-clip-text text-transparent">
            Connect. Share. Laugh.
          </h2>
          <p className="text-2xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
            A space where memes bring people together, conversations flow naturally, and every moment feels instant.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section
        ref={(el) => (sectionRefs.current.stats = el)}
        data-section="stats"
        className="relative py-32 px-6"
        style={sectionStyle('stats')}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12 text-center">
            {[
              { icon: Heart, title: 'Unlimited', subtitle: 'Likes & Reactions', color: 'blue' },
              { icon: Users, title: 'Real-Time', subtitle: 'Connections', color: 'purple' },
              { icon: MessageCircle, title: 'Instant', subtitle: 'Messaging', color: 'cyan' },
            ].map(({ icon: Icon, title, subtitle, color }, idx) => (
              <div className="relative" key={idx}>
                <div className={`absolute inset-0 bg-${color}-500/10 blur-3xl rounded-full`} />
                <div className="relative">
                  <Icon className={`w-12 h-12 text-${color}-400 mx-auto mb-4`} />
                  <h3
                    className={`text-5xl font-bold mb-2 bg-gradient-to-r from-${color}-400 to-blue-400 bg-clip-text text-transparent`}
                  >
                    {title}
                  </h3>
                  <p className="text-gray-400">{subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        ref={(el) => (sectionRefs.current.cta = el)}
        data-section="cta"
        className="relative py-32 px-6"
        style={sectionStyle('cta')}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-6">Ready to start?</h2>
          <p className="text-xl text-gray-300 mb-10">Join the community and start sharing</p>
          <button className="px-12 py-5 text-xl rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition-all duration-300 shadow-2xl shadow-blue-500/50 hover:scale-105 transform">
            Create Account
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center space-x-6">
              <a
                href="https://www.linkedin.com/in/khushi-kabra-368b8b2b3/"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-400 transition-colors duration-300"
              >
                <Linkedin className="w-6 h-6" />
              </a>
              <a
                href="https://github.com/khushik17"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-purple-400 transition-colors duration-300"
              >
                <Github className="w-6 h-6" />
              </a>
            </div>
            <p className="text-gray-400 text-center">Built for the community with ❤ by Khushi Kabra</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap');

        @keyframes aurora {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.6; }
          25% { transform: translateY(-10px) translateX(10px); opacity: 0.5; }
          50% { transform: translateY(-5px) translateX(-5px); opacity: 0.7; }
          75% { transform: translateY(-15px) translateX(5px); opacity: 0.55; }
        }

        @keyframes aurora2 {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.4; }
          33% { transform: translateY(-8px) translateX(-8px); opacity: 0.5; }
          66% { transform: translateY(-12px) translateX(8px); opacity: 0.35; }
        }
      `}</style>
    </div>
  );
}
