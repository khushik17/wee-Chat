import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, Heart, Users, Zap, Linkedin, Github } from "lucide-react";
import "../styles/WeeChatLanding.css";

export default function Landing() {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [currentSection, setCurrentSection] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setScrollY(scrollPosition);
      
      const windowHeight = window.innerHeight;
      const section = Math.floor(scrollPosition / (windowHeight * 0.8));
      setCurrentSection(section);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="weechat-landing">
      {/* Aurora Background */}
      <div className="aurora-background">
        <div 
          className="aurora-layer aurora-layer-1" 
          style={{ transform: `translateY(${scrollY * 0.3}px)` }}
        />
        <div 
          className="aurora-layer aurora-layer-2" 
          style={{ transform: `translateY(${scrollY * 0.2}px)` }}
        />
      </div>

      {/* Navbar with 2 Buttons */}
      <nav className="navbar">
        <div className="navbar-content">
          <div className="navbar-logo">
            <MessageCircle className="logo-icon" />
            <span className="logo-text">Wee-Chat</span>
          </div>
          
          <div className="navbar-buttons">
            <button 
              onClick={() => navigate("/sign-in")} 
              className="btn-nav btn-nav-secondary"
            >
              Login
            </button>
            <button 
              onClick={() => navigate("/sign-up")} 
              className="btn-nav btn-nav-primary"
            >
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title animate-in">
            <span className="hero-title-line">Welcome to</span>
            <span className="hero-title-brand">Wee-Chat</span>
          </h1>
          <p className="hero-subtitle animate-in delay-1">
            Share memes, connect instantly, and chat in real-time. Your new favorite social experience starts here.
          </p>
          <button 
            onClick={() => navigate("/sign-up")} 
            className="btn-hero animate-in delay-2"
          >
            Get Started
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className={`features-section ${currentSection >= 1 ? 'visible' : ''}`}>
        <div className="features-content">
          <h2 className="section-title">Why Choose Wee-Chat?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <Zap className="feature-icon" />
              </div>
              <h3>Lightning Fast</h3>
              <p>Instant messaging with zero lag. Your conversations flow naturally.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <Heart className="feature-icon" />
              </div>
              <h3>Share Everything</h3>
              <p>Memes, moments, and memories. Express yourself freely.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <Users className="feature-icon" />
              </div>
              <h3>Real Connections</h3>
              <p>Build genuine relationships with people who get you.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={`stats-section ${currentSection >= 2 ? 'visible' : ''}`}>
        <div className="stats-content">
          <h2 className="section-title">Built for You</h2>
          <div className="stats-grid">
            <div className="stat-box">
              <div className="stat-glow stat-glow-blue" />
              <div className="stat-inner">
                <MessageCircle className="stat-icon" />
                <h3 className="stat-number">Instant</h3>
                <p className="stat-text">Real-time messaging</p>
              </div>
            </div>

            <div className="stat-box">
              <div className="stat-glow stat-glow-purple" />
              <div className="stat-inner">
                <Heart className="stat-icon" />
                <h3 className="stat-number">Unlimited</h3>
                <p className="stat-text">Likes & reactions</p>
              </div>
            </div>

            <div className="stat-box">
              <div className="stat-glow stat-glow-cyan" />
              <div className="stat-inner">
                <Users className="stat-icon" />
                <h3 className="stat-number">Secure</h3>
                <p className="stat-text">Private conversations</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`cta-section ${currentSection >= 3 ? 'visible' : ''}`}>
        <div className="cta-content">
          <h2 className="cta-title">Ready to Join?</h2>
          <p className="cta-text">
            Thousands are already chatting. Don't miss out on the fun!
          </p>
          <div className="cta-buttons">
            <button 
              onClick={() => navigate("/sign-up")} 
              className="btn-cta btn-cta-primary"
            >
              Create Account
            </button>
            <button 
              onClick={() => navigate("/sign-in")} 
              className="btn-cta btn-cta-secondary"
            >
              I Have an Account
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-links">
            <a
              href="https://www.linkedin.com/in/khushi-kabra-368b8b2b3/"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
            >
              <Linkedin className="footer-icon" />
            </a>
            <a
              href="https://github.com/khushik17"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
            >
              <Github className="footer-icon" />
            </a>
          </div>
          <p className="footer-text">
            Built with ❤ by Khushi Kabra
          </p>
        </div>
      </footer>
    </div>
  );
}