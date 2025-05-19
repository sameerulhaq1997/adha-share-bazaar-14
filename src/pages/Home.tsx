
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Beef, Bell, Clock, Users } from "lucide-react";
import { motion } from "framer-motion";

const Home = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Set Eid date - this would need to be updated each year
  useEffect(() => {
    // Example Eid date - adjust as needed
    const eidDate = new Date("2025-06-17T00:00:00");
    
    const timer = setInterval(() => {
      const now = new Date();
      const difference = eidDate.getTime() - now.getTime();
      
      if (difference <= 0) {
        clearInterval(timer);
        return;
      }
      
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      
      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  const features = [
    {
      icon: <Beef className="h-10 w-10 text-brand-600" />,
      title: "Quality Animals",
      description: "Healthy, well-fed animals that meet all Islamic requirements for Qurbani.",
      image: "https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&q=80"
    },
    {
      icon: <Users className="h-10 w-10 text-brand-600" />,
      title: "Share Options",
      description: "Book full animals or shares with others, making Qurbani accessible for everyone.",
      image: "https://images.unsplash.com/photo-1465379944081-7f47de8d74ac?auto=format&fit=crop&q=80"
    },
    {
      icon: <Clock className="h-10 w-10 text-brand-600" />,
      title: "Scheduled Slaughter",
      description: "Transparent scheduling with notification system to keep you informed.",
      image: "https://images.unsplash.com/photo-1452378174528-3090a4bba7b2?auto=format&fit=crop&q=80"
    },
    {
      icon: <Bell className="h-10 w-10 text-brand-600" />,
      title: "Multiple Animals",
      description: "Choose from cows, goats, sheep and camels for your Qurbani.",
      image: "https://images.unsplash.com/photo-1469041797191-50ace28483c3?auto=format&fit=crop&q=80"
    }
  ];

  // Animation variants for framer-motion
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
  };

  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section with better banner */}
      <section className="relative py-20 bg-no-repeat bg-cover bg-center" 
               style={{ 
                 backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('/lovable-uploads/banner.jpg')",
                 minHeight: "600px"
               }}>
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent z-0"></div>
        <div className="container px-4 sm:px-8 relative z-10 h-full flex items-center">
          <motion.div 
            className="max-w-3xl"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-white">
              Fulfill Your Qurbani With Care & Devotion
            </h1>
            <p className="text-lg md:text-xl mb-8 text-white/90">
              Book your sacrifice for Eid al-Adha with our trusted platform. 
              Quality animals, transparent process, adherence to Islamic principles.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="bg-brand-600 hover:bg-brand-700">
                <Link to="/animals">Browse Animals</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/20">
                <Link style={{color:"green"}} to="/register">Create Account</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Countdown Timer with animation */}
      <motion.section 
        className="py-12 bg-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
      >
        <div className="container px-4 sm:px-8">
          <h2 className="text-2xl md:text-3xl font-semibold text-center mb-8">
            Time Remaining Until Eid al-Adha
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <motion.div 
              className="bg-secondary rounded-lg p-6 text-center" 
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <span className="block text-3xl md:text-4xl font-bold text-brand-700">{timeLeft.days}</span>
              <span className="text-muted-foreground">Days</span>
            </motion.div>
            <motion.div 
              className="bg-secondary rounded-lg p-6 text-center"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <span className="block text-3xl md:text-4xl font-bold text-brand-700">{timeLeft.hours}</span>
              <span className="text-muted-foreground">Hours</span>
            </motion.div>
            <motion.div 
              className="bg-secondary rounded-lg p-6 text-center"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <span className="block text-3xl md:text-4xl font-bold text-brand-700">{timeLeft.minutes}</span>
              <span className="text-muted-foreground">Minutes</span>
            </motion.div>
            <motion.div 
              className="bg-secondary rounded-lg p-6 text-center"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <span className="block text-3xl md:text-4xl font-bold text-brand-700">{timeLeft.seconds}</span>
              <span className="text-muted-foreground">Seconds</span>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Features with images */}
      <section className="py-16 bg-muted">
        <div className="container px-4 sm:px-8">
          <motion.h2 
            className="text-2xl md:text-3xl font-semibold text-center mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Our Services
          </motion.h2>
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerChildren}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={fadeIn}>
                <Card className="border-brand-200 hover:border-brand-400 transition-colors overflow-hidden h-full">
                  <div className="overflow-hidden">
                    {/* <img 
                      src={feature.image} 
                      alt={feature.title}
                      className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
                    /> */}
                  </div>
                  <CardContent className="pt-6">
                    <div className="mb-4">{feature.icon}</div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA with background image */}
      <section className="py-16 bg-brand-600 text-white">
        <motion.div 
          className="container px-4 sm:px-8 text-center relative z-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-white">Ready to Book Your Qurbani?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto text-white/90">
            Don't wait until the last minute. Secure your animal now and have peace of mind for Eid al-Adha.
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-brand-600">
              <Link style={{color:"green"}} to="/animals">Browse Available Animals</Link>
            </Button>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
};

export default Home;
