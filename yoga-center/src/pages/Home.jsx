import Hero from "../components/Hero";
import YogaMoments from "../components/YogaMoments";
import MeetInstructor from "../components/MeetInstructor";
import Features from "../components/Features";
import BatchSelector from "../components/BatchSelector";
import Pricing from "../components/Pricing";
import Testimonials from "../components/Testimonials";
import FAQ from "../components/FAQ";
import WhatsAppButton from "../components/WhatsAppButton";

const Home = () => {
  return (
    <div>
      <Hero />
      <YogaMoments />
      <MeetInstructor />
      <Features />
      <BatchSelector />
      <Pricing />
      <Testimonials />
      <FAQ />
      <WhatsAppButton />
    </div>
  );
};

export default Home;
