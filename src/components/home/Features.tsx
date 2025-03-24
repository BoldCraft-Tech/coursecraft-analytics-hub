
import { ArrowRight, Book, Globe, Users, Award, Cpu, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

const features = [
  {
    icon: <Book size={40} className="text-primary" />,
    title: 'Curated Curriculum',
    description: 'Learning paths designed specifically for rural communities, focusing on practical skills and knowledge.',
  },
  {
    icon: <Globe size={40} className="text-primary" />,
    title: 'Offline Access',
    description: 'Download courses for offline learning when internet connectivity is limited or unreliable.',
  },
  {
    icon: <Users size={40} className="text-primary" />,
    title: 'Community Support',
    description: 'Connect with learners and mentors from similar backgrounds to share experiences and knowledge.',
  },
  {
    icon: <Award size={40} className="text-primary" />,
    title: 'Recognized Certificates',
    description: 'Earn certificates that showcase your skills and achievements to potential employers.',
  },
  {
    icon: <Cpu size={40} className="text-primary" />,
    title: 'AI-Powered Learning',
    description: 'Personalized learning experiences tailored to your pace, style, and interests.',
  },
  {
    icon: <MessageSquare size={40} className="text-primary" />,
    title: 'Multilingual Support',
    description: 'Access content in multiple languages to overcome language barriers in education.',
  },
];

const Features = () => {
  return (
    <section className="py-20 bg-secondary/50">
      <div className="container px-4 mx-auto">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="mb-4">Designed for Rural Learners</h2>
          <p className="text-muted-foreground text-lg">
            Our platform addresses the unique challenges and opportunities of rural education through innovative features and thoughtful design.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="glass-card p-6 rounded-xl hover-lift"
            >
              <div className="mb-5">{feature.icon}</div>
              <h3 className="text-xl font-medium mb-2">{feature.title}</h3>
              <p className="text-muted-foreground mb-4">{feature.description}</p>
              <Link to="/features" className="inline-flex items-center text-primary font-medium hover:underline">
                Learn more
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
