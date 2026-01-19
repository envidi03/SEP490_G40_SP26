import React from 'react';

import TopBarNav from './TopBarNav';
import MainNavigation from './MainNavigation';

const HomeNavbar = () => {
    return (
        <nav className="bg-white fixed w-full top-0 z-50 shadow-sm">
            {/* Subtle top bar */}
            <TopBarNav />
            {/* Main navigation */}
            <div className="bg-white">
                <MainNavigation />
            </div>
        </nav>
    );
};

export default HomeNavbar;
