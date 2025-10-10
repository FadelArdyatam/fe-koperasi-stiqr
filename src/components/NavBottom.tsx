import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAffiliation } from '@/hooks/useAffiliation';
import { Home, ScanQrCode, CreditCard, FileText, UserRound } from 'lucide-react';
import { useState, useEffect } from 'react';

const NavBottom = () => {
    const { data: affiliation } = useAffiliation();
    const { pathname } = useLocation();
    const [isNavbarVisible, setIsNavbarVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    // Define dynamic paths based on affiliation
    const isIndukKoperasi = affiliation?.affiliation === 'KOPERASI_INDUK';
    const katalogPath = isIndukKoperasi ? '/induk/manajemen-katalog' : '/catalog';

    // Auto-hide navbar on scroll
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            
            // Show navbar when scrolling up or at top
            if (currentScrollY < lastScrollY || currentScrollY < 10) {
                setIsNavbarVisible(true);
            } 
            // Hide navbar when scrolling down (but not at the very top)
            else if (currentScrollY > lastScrollY && currentScrollY > 100) {
                setIsNavbarVisible(false);
            }
            
            setLastScrollY(currentScrollY);
        };

        // Throttle scroll events for better performance
        let ticking = false;
        const throttledHandleScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', throttledHandleScroll, { passive: true });
        
        return () => {
            window.removeEventListener('scroll', throttledHandleScroll);
        };
    }, [lastScrollY]);

    // Show navbar on mouse move near bottom
    useEffect(() => {
        let timeoutId: NodeJS.Timeout;
        
        const handleMouseMove = (e: MouseEvent) => {
            const windowHeight = window.innerHeight;
            const mouseY = e.clientY;
            
            // Show navbar when mouse is near bottom (last 120px)
            if (mouseY > windowHeight - 120) {
                setIsNavbarVisible(true);
                // Clear any pending hide timeout
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }
            } else {
                // Hide navbar after a delay when mouse moves away from bottom
                timeoutId = setTimeout(() => {
                    setIsNavbarVisible(false);
                }, 2000); // 2 second delay
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, []);

    // Show navbar on keyboard navigation (accessibility)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Show navbar when user presses Tab (navigation) or Escape
            if (e.key === 'Tab' || e.key === 'Escape') {
                setIsNavbarVisible(true);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    // Show navbar on touch events (mobile)
    useEffect(() => {
        const handleTouchStart = () => {
            setIsNavbarVisible(true);
        };

        const handleTouchMove = (e: TouchEvent) => {
            const touch = e.touches[0];
            const windowHeight = window.innerHeight;
            const touchY = touch.clientY;
            
            // Show navbar when touch is near bottom
            if (touchY > windowHeight - 120) {
                setIsNavbarVisible(true);
            }
        };

        window.addEventListener('touchstart', handleTouchStart, { passive: true });
        window.addEventListener('touchmove', handleTouchMove, { passive: true });
        
        return () => {
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchmove', handleTouchMove);
        };
    }, []);

    return (
        <>
            {/* This Outlet will render the actual page component (e.g., Dashboard, Profile) */}
            <Outlet />

            {/* Shared Bottom Navbar */}
            <div 
                id="navbar" 
                className={`w-full flex items-end gap-5 justify-between px-3 py-2 bg-white text-xs fixed bottom-0 border z-50 safe-area-pb transition-all duration-300 ease-in-out shadow-lg ${
                    isNavbarVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
                }`}
                onMouseEnter={() => setIsNavbarVisible(true)}
                onMouseLeave={(e) => {
                    // Only hide if user is not near bottom
                    const mouseY = e.clientY;
                    const windowHeight = window.innerHeight;
                    if (mouseY < windowHeight - 120) {
                        // Add a small delay before hiding
                        setTimeout(() => {
                            setIsNavbarVisible(false);
                        }, 500);
                    }
                }}
            >
                <Link to={'/dashboard'} className={`flex gap-3 flex-col items-center ${pathname === '/dashboard' ? 'text-orange-400' : ''}`}>
                    <Home />
                    <p className="uppercase">Home</p>
                </Link>
                <Link to={'/qr-code'} className={`flex gap-3 flex-col items-center ${pathname === '/qr-code' ? 'text-orange-400' : ''}`}>
                    <ScanQrCode />
                    <p className="uppercase">Qr Code</p>
                </Link>
                <Link to={'/settlement'} data-cy='penarikan-btn' className="flex relative gap-3 flex-col items-center">
                    <div className="absolute -top-20 shadow-md text-white w-16 h-16 rounded-full bg-orange-400 flex items-center justify-center">
                        <CreditCard />
                    </div>
                    <p className="uppercase">Penarikan</p>
                </Link>
                <Link to={katalogPath} className={`flex gap-3 flex-col items-center ${pathname === katalogPath ? 'text-orange-400' : ''}`}>
                    <FileText />
                    <p className="uppercase">Catalog</p>
                </Link>
                <Link to={'/profile'} className={`flex gap-3 flex-col items-center ${pathname === '/profile' ? 'text-orange-400' : ''}`} data-cy="profile-link">
                    <UserRound />
                    <p className="uppercase">Profile</p>
                </Link>
            </div>
        </>
    );
};

export default NavBottom;
