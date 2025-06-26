
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, UserCircle, LogOut, Activity, ListChecks, MapPin, Menu, X } from 'lucide-react'; // Added Menu, X
import { APP_NAME, COLORS } from '../../constants';
import { useUserSession } from '../../hooks/useUserSession';
import { Button } from '../common/Button'; // Added Button import

interface PageLayoutProps {
  children: React.ReactNode;
}

export const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, clearCurrentUser, users } = useUserSession();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const handleLogout = () => {
    clearCurrentUser();
    setIsMobileNavOpen(false);
    navigate('/');
  };
  
  const showUserHeader = currentUser; 
  const showMainNavHorizontal = currentUser && ['/dashboard', '/measure', '/history', '/profile', '/medical-centers'].includes(location.pathname);

  const navItems = [
    { path: '/dashboard', label: 'Panel Principal', icon: <Home size={20}/> },
    { path: '/measure', label: 'Medir Signos', icon: <Activity size={20}/> },
    { path: '/history', label: 'Historial', icon: <ListChecks size={20}/> },
    { path: '/medical-centers', label: 'Centros Médicos', icon: <MapPin size={20}/> },
  ];

  // Close mobile nav on route change
  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className={`shadow-md ${COLORS.primary} ${COLORS.primaryText} sticky top-0 z-50`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <Link to={currentUser ? "/dashboard" : "/"} className="text-2xl sm:text-3xl font-bold flex items-center">
            <Activity size={30} className="mr-2 sm:mr-3 text-pink-light" />
            {APP_NAME}
          </Link>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            {showUserHeader && (
              <>
                <div className="items-center space-x-2 text-base sm:text-lg hidden md:flex"> {/* Hide "Hola, " on sm and below */}
                  <span>
                    Hola, <span className="font-semibold">{currentUser?.name}</span>
                  </span>
                </div>
                <Link to="/profile" title="Mi Perfil" className={`p-2 hover:bg-turquoise-dark rounded-full transition-colors ${location.pathname === '/profile' ? 'bg-turquoise-dark' : ''}`}>
                  <UserCircle size={24} />
                </Link>
                <button
                  onClick={handleLogout}
                  title="Cerrar Sesión"
                  className={`p-2 hover:bg-turquoise-dark rounded-full transition-colors ${COLORS.primaryText}`}
                >
                  <LogOut size={24} />
                </button>
              </>
            )}
            { (location.pathname === '/' && users.length === 0 && !currentUser) && (
             <span className="text-sm sm:text-lg text-center">Bienvenido. Registra un usuario.</span>
            )}
            { (location.pathname === '/' && users.length > 0 && !currentUser) && (
             <span className="text-sm sm:text-lg text-center">Selecciona o registra un usuario.</span>
            )}
            {showMainNavHorizontal && ( // Hamburger Menu Button for secondary nav
                <div className="md:hidden">
                    <Button
                        variant="ghost"
                        className="p-2 !shadow-none !bg-transparent !border-none hover:!bg-turquoise-dark"
                        onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
                        aria-label="Abrir menú de navegación"
                    >
                        {isMobileNavOpen ? <X size={28} /> : <Menu size={28} />}
                    </Button>
                </div>
            )}
          </div>
        </div>
      </header>

      {/* Horizontal Main Navigation for md and larger screens */}
      {showMainNavHorizontal && (
        <nav className="bg-white shadow-sm sticky top-16 md:top-20 z-40 hidden md:block"> {/* Adjust top based on header height */}
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-center sm:justify-start space-x-2 sm:space-x-4 py-3 overflow-x-auto">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 px-3 py-2 text-sm sm:text-base font-medium rounded-md transition-colors
                  ${location.pathname === item.path 
                    ? `${COLORS.secondary} ${COLORS.secondaryText}` 
                    : `text-gray-600 hover:bg-turquoise-light hover:text-turquoise-dark`}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>
      )}
      
      {/* Mobile Navigation Menu (Dropdown) */}
      {showMainNavHorizontal && isMobileNavOpen && (
        <div className="md:hidden bg-white shadow-lg absolute top-16 left-0 right-0 z-30 border-t border-gray-200">
          <nav className="flex flex-col space-y-1 p-4">
            {navItems.map(item => (
              <Link
                key={`mobile-${item.path}`}
                to={item.path}
                onClick={() => setIsMobileNavOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 text-base font-medium rounded-md transition-colors
                  ${location.pathname === item.path 
                    ? `${COLORS.secondary} ${COLORS.secondaryText}` 
                    : `text-gray-700 hover:bg-turquoise-light hover:text-turquoise-dark`}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
             <div className="border-t border-gray-200 pt-4 mt-2">
                <div className="flex items-center space-x-2 text-gray-700 px-4 py-2">
                    <UserCircle size={22} className={COLORS.accent}/>
                    <span className="font-medium">
                        {currentUser?.name} {currentUser?.surname}
                    </span>
                </div>
             </div>
          </nav>
        </div>
      )}
      
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>

      <footer className="bg-gray-800 text-gray-300 text-center p-4">
        <p className="text-sm">&copy; {new Date().getFullYear()} {APP_NAME}. Todos los derechos reservados.</p>
        <p className="text-xs mt-1">Esta aplicación es una herramienta de seguimiento personal y no sustituye el consejo médico profesional.</p>
      </footer>
    </div>
  );
};
