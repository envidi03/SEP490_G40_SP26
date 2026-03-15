import BannerCarousel from './components/BannerCarousel';
import ServicesGallery from './components/ServicesGallery';
import DoctorsTeam from './components/DoctorsTeam';
import WhyChooseUs from './components/WhyChooseUs';

const HomeContent = () => {
    return (
        <div>
            {/* Carousel Banner */}
            <section className="relative bg-gradient-to-r from-blue-100 to-purple-100 pt-[109px] overflow-hidden">
                <BannerCarousel />
            </section>

            {/* Services Gallery */}
            <ServicesGallery />

            {/* Doctors Team */}
            <DoctorsTeam />

            {/* Why Choose Us */}
            <WhyChooseUs />

        </div>
    );
};

export default HomeContent;