
import React, { useEffect } from "react";
import HeroSection from "@/components/HeroSection";
import Features from "@/components/Features";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  let navigate;
  
  try {
    navigate = useNavigate();
  } catch (error) {
    console.error("Router context error in Index:", error);
    // Fallback when router context isn't available
  }
  
  useEffect(() => {
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId && targetId !== '#') {
          const targetElement = document.querySelector(targetId);
          if (targetElement) {
            targetElement.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }
        }
      });
    });

    return () => {
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.removeEventListener('click', function() {});
      });
    };
  }, []);

  // Direct hero buttons to login page
  useEffect(() => {
    if (!navigate) return; // Skip if navigate isn't available
    
    const heroButtons = document.querySelectorAll('.hero-primary-button');
    heroButtons.forEach(button => {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        navigate('/login');
      });
    });

    return () => {
      heroButtons.forEach(button => {
        button.removeEventListener('click', function() {});
      });
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-she-light via-white to-she-lavender/10">
      <HeroSection />
      
      {/* Call to Action section moved below hero section */}
      <div className="container mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-she-dark">Ready to start your journey?</h2>
        <p className="text-gray-600 max-w-2xl mx-auto mb-10">
          Join thousands of women who are already experiencing the benefits of Shesphere's comprehensive health and safety companion.
        </p>
        <Link to="/login">
          <Button className="bg-she-purple hover:bg-she-indigo text-white rounded-full px-8 py-6 transition-all duration-300 shadow-md hover:shadow-lg text-base">
            Get Started Now
          </Button>
        </Link>
      </div>
      
      <Features />
    </div>
  );
};

export default Index;
