
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserForm } from '../components/user/UserForm';
import { useUserSession } from '../hooks/useUserSession';
import { User } from '../types';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { Button } from '../components/common/Button';
import { COLORS } from '../constants';

const RegisterUserPage: React.FC = () => {
  const navigate = useNavigate();
  const { addUser, currentUser } = useUserSession();

  useEffect(() => {
    // This effect handles redirection if currentUser is set (e.g., after registration)
    // or if a logged-in user tries to access this page.
    if (currentUser) {
      navigate('/welcome');
    }
  }, [currentUser, navigate]);


  const handleSubmit = (userData: Omit<User, 'id'>) => {
    addUser(userData);
    // The useEffect above will handle navigation to /welcome once currentUser is updated.
  };

  // The conditional rendering `if (currentUser && !window.location.pathname.endsWith('/register'))`
  // was removed as the useEffect hook adequately handles redirection scenarios.

  return (
    <div className="max-w-2xl mx-auto">
      <Button variant="ghost" onClick={() => navigate('/')} className="mb-4 sm:mb-6" leftIcon={<ArrowLeft size={18}/>}>
        Volver al Inicio
      </Button>
      <div className="flex items-center mb-6 sm:mb-8">
        <UserPlus size={32} className={`mr-3 sm:mr-4 ${COLORS.accent}`} />
        <h1 className={`text-3xl sm:text-4xl font-bold ${COLORS.textHeading}`}>Registrar Nuevo Usuario</h1>
      </div>
      <p className={`${COLORS.textDefault} text-base sm:text-lg mb-6 sm:mb-8`}>
        Completa tus datos para crear un perfil. Esta información nos ayudará a personalizar tu experiencia.
      </p>
      <UserForm onSubmit={handleSubmit} submitButtonText="Crear Perfil y Continuar"/>
    </div>
  );
};

export default RegisterUserPage;