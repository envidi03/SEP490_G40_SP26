import HomeFooter from "../features/home/HomeFooter";
import HomeNavbar from "../features/home/HomeNavbar";


const PublicLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-white flex flex-col">
            <HomeNavbar />

            {/* Main content with padding top for fixed navbar */}
            <main className="flex-1 pt-20">
                {children}
            </main>

            <HomeFooter />
        </div>
    );
}

export default PublicLayout;