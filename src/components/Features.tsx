
import React from "react";
import {
  Calendar,
  Bell,
  Shield,
  Users,
  Activity,
  Lock,
} from "lucide-react";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}

const FeatureCard = ({ icon, title, description, delay }: FeatureCardProps) => {
  return (
    <div 
      className="glass-card rounded-xl p-6 hover:shadow-lg transition-all duration-300 h-full opacity-0 animate-fade-in"
      style={{ animationDelay: `${delay}s`, animationFillMode: "forwards" }}
    >
      <div className="bg-gradient-to-br from-she-pink to-she-lavender w-12 h-12 rounded-lg flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3 text-she-dark">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

const Features = () => {
  const features = [
    {
      icon: <Calendar className="text-white" />,
      title: "Period Tracking",
      description:
        "Easily track your cycle with our intuitive calendar, predictions, and customizable reminders.",
      delay: 0.1,
    },
    {
      icon: <Activity className="text-white" />,
      title: "Health Insights",
      description:
        "Monitor symptoms, moods, and health metrics to gain valuable insights about your wellbeing.",
      delay: 0.2,
    },
    {
      icon: <Shield className="text-white" />,
      title: "Safety Alerts",
      description:
        "Set up emergency contacts and quick alerts for when you need help or feel unsafe.",
      delay: 0.3,
    },
    {
      icon: <Bell className="text-white" />,
      title: "Smart Reminders",
      description:
        "Personalized notifications for medications, appointments, and other important health events.",
      delay: 0.4,
    },
    {
      icon: <Users className="text-white" />,
      title: "Community Support",
      description:
        "Connect with a supportive community of women sharing experiences and advice.",
      delay: 0.5,
    },
    {
      icon: <Lock className="text-white" />,
      title: "Privacy First",
      description:
        "Your data is encrypted and private, giving you complete control over your information.",
      delay: 0.6,
    },
  ];

  return (
    <section id="features" className="py-20 px-6">
      <div className="container mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16 opacity-0 animate-fade-in" style={{ animationDelay: "0.05s", animationFillMode: "forwards" }}>
          <span className="bg-she-pink/30 text-she-dark text-sm font-medium py-1 px-3 rounded-full">
            Features
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-6 text-she-dark">
            Everything you need in one place
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Shesphere combines essential health tracking tools with innovative safety features, 
            all wrapped in a beautiful, intuitive interface designed specifically for women.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
