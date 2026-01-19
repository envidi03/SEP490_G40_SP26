import BannerCarousel from './components/BannerCarousel';
import ServicesGallery from './components/ServicesGallery';
import FeaturedServices from './components/FeaturedServices';
import DoctorsTeam from './components/DoctorsTeam';
import WhyChooseUs from './components/WhyChooseUs';
import ContactSection from './components/ContactSection';

const HomeContent = () => {
    return (
        <div>
            {/* Carousel Banner */}
            <section className="relative bg-gradient-to-r from-blue-100 to-purple-100 pt-[109px] overflow-hidden">
                <BannerCarousel />
            </section>

            {/* Services Gallery */}
            <ServicesGallery />

            {/* Featured Services */}
            <FeaturedServices />

            {/* Doctors Team */}
            <DoctorsTeam />

            {/* Why Choose Us */}
            <WhyChooseUs />

            {/* Contact Section */}
            <ContactSection />
        </div>
    );
};

export default HomeContent;