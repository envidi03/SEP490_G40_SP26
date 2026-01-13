import HomeNavbar from '../../components/layout/home_page/HomeNavbar';
import HomeFooter from '../../components/layout/home_page/HomeFooter';
import HomeContent from '../../components/layout/home_page/HomeContent';

const HomePage = () => {


    return (
        <div className="min-h-screen bg-white">
            <HomeNavbar />

            <HomeContent />

            <HomeFooter />
        </div>
    );
};

export default HomePage;
