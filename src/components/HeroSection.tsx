
import React from "react";
import { Button } from "@/components/ui/button";
import { Shield, Heart, Activity } from "lucide-react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="min-h-screen pt-24 pb-16 px-6 flex items-center">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 max-w-xl opacity-0 animate-fade-in" style={{ animationDelay: "0.1s", animationFillMode: "forwards" }}>
            <div className="inline-block">
              <span className="bg-she-pink/30 text-she-dark text-sm font-medium py-1 px-3 rounded-full">
                Women's Health & Safety
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-she-dark leading-tight">
              Your personal companion for{" "}
              <span className="text-she-purple">health</span> and{" "}
              <span className="text-she-indigo">safety</span>
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              Shesphere empowers women with intuitive health tracking, emergency safety tools, and a supportive community - all in one beautiful, private application.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/login">
                <Button className="hero-primary-button bg-she-purple hover:bg-she-indigo text-white rounded-full px-8 py-6 transition-all duration-300 shadow-md hover:shadow-lg text-base">
                  Get Started
                </Button>
              </Link>
              <Button variant="outline" className="border-she-lavender text-she-dark rounded-full px-8 py-6 hover:bg-she-lavender/10 transition-all duration-300 text-base">
                Learn More
              </Button>
            </div>
          </div>

          <div className="relative aspect-square max-w-lg mx-auto lg:ml-auto opacity-0 animate-fade-in" style={{ animationDelay: "0.3s", animationFillMode: "forwards" }}>
            <div className="absolute inset-0 bg-gradient-to-br from-she-pink/20 via-she-lavender/20 to-she-blue/20 rounded-full animate-pulse-soft"></div>
            <div className="absolute inset-4 bg-gradient-to-tl from-she-purple/10 via-she-indigo/10 to-she-blue/10 rounded-full animate-float"></div>
            
            {/* Feature Cards - Consistently positioned */}
            <div className="absolute top-5 left-5 glass-card p-4 rounded-xl shadow-lg opacity-0 animate-fade-in-delay-1">
              <div className="flex items-center gap-3">
                <div className="bg-she-pink/30 p-2 rounded-lg">
                  <Activity size={20} className="text-she-purple" />
                </div>
                <span className="font-medium text-she-dark">Health Tracking</span>
              </div>
            </div>
            
            <div className="absolute bottom-5 left-5 glass-card p-4 rounded-xl shadow-lg opacity-0 animate-fade-in-delay-2">
              <div className="flex items-center gap-3">
                <div className="bg-she-lavender/30 p-2 rounded-lg">
                  <Shield size={20} className="text-she-indigo" />
                </div>
                <span className="font-medium text-she-dark">Safety Tools</span>
              </div>
            </div>
            
            <div className="absolute top-1/3 right-5 glass-card p-4 rounded-xl shadow-lg opacity-0 animate-fade-in-delay-3">
              <div className="flex items-center gap-3">
                <div className="bg-she-blue/30 p-2 rounded-lg">
                  <Heart size={20} className="text-she-blue" />
                </div>
                <span className="font-medium text-she-dark">Community Support</span>
              </div>
            </div>

            {/* Central App Icon */}
            <div className="absolute inset-1/4 glass-card bg-white/90 rounded-full flex items-center justify-center shadow-xl opacity-0 animate-blur-in" style={{ animationDelay: "0.5s", animationFillMode: "forwards" }}>
              <div className="text-center">
                <div className="text-5xl font-bold bg-gradient-to-r from-she-purple to-she-indigo bg-clip-text text-transparent">S</div>
                <div className="text-xs font-medium text-she-dark mt-1">SHESPHERE</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
