import HomeNavbar from '../../components/features/home/HomeNavbar';
import HomeFooter from '../../components/features/home/HomeFooter';
import HomeContent from '../../components/features/home/HomeContent.jsx';
import useRoleRedirect from '../../hooks/useRoleRedirect';

const HomePage = () => {
    // Automatically redirect to dashboard if user is logged in
    useRoleRedirect();

    return (
        <div className="min-h-screen bg-white">
            <HomeNavbar />

            <HomeContent />

            <HomeFooter />
        </div>
    );
};

export default HomePage;
