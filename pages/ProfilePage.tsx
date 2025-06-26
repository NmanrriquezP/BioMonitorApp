
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserSession } from '../hooks/useUserSession';
import { UserForm } from '../components/user/UserForm';
import { User } from '../types';
import { Button } from '../components/common/Button';
import { ArrowLeft, Edit3, Trash2 } from 'lucide-react';
import { COLORS } from '../constants';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, updateUser, deleteUser } = useUserSession();

  useEffect(() => {
    if (!currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  if (!currentUser) {
    return null; 
  }

  const handleSubmit = (userData: User) => {
    updateUser(userData);
    alert('Perfil actualizado exitosamente.');
    navigate('/dashboard');
  };

  const handleDelete = () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este perfil? Esta acción no se puede deshacer.')) {
      deleteUser(currentUser.id);
      navigate('/');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
       <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-4 sm:mb-6" leftIcon={<ArrowLeft size={18}/>}>
        Volver al Panel
      </Button>
      <div className="flex items-center mb-6 sm:mb-8">
        <Edit3 size={32} className={`mr-3 sm:mr-4 ${COLORS.accent}`} />
        <h1 className={`text-3xl sm:text-4xl font-bold ${COLORS.textHeading}`}>Mi Perfil</h1>
      </div>
      <p className={`${COLORS.textDefault} text-base sm:text-lg mb-6 sm:mb-8`}>
        Aquí puedes ver y actualizar tu información personal.
      </p>
      <UserForm
        initialUser={currentUser}
        onSubmit={handleSubmit as (user: Omit<User, "id"> | User) => void}
        submitButtonText="Guardar Cambios"
      />
      <div className="mt-8 sm:mt-10 pt-5 sm:pt-6 border-t border-gray-300">
        <h2 className={`text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 ${COLORS.textHeading}`}>Zona de Peligro</h2>
        <Button onClick={handleDelete} variant="danger" leftIcon={<Trash2 size={18}/>}>
          Eliminar Perfil
        </Button>
        <p className="text-xs sm:text-sm text-gray-500 mt-2">Esta acción es irreversible y eliminará todos tus datos.</p>
      </div>
    </div>
  );
};

export default ProfilePage;
