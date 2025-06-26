
import React, { useState, useEffect } from 'react';
import { User, Gender, BloodType } from '../../types';
import { GENDERS, BLOOD_TYPES, COLORS } from '../../constants';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { Save, UserPlus } from 'lucide-react';

interface UserFormProps {
  onSubmit: (user: Omit<User, 'id'> | User) => void;
  initialUser?: User;
  submitButtonText?: string;
}

export const UserForm: React.FC<UserFormProps> = ({ onSubmit, initialUser, submitButtonText = "Registrar Usuario" }) => {
  const [formData, setFormData] = useState<Omit<User, 'id'>>({
    name: '',
    surname: '',
    birthDate: '',
    gender: Gender.PREFER_NOT_TO_SAY,
    bloodType: BloodType.UNKNOWN,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof User, string>>>({});

  useEffect(() => {
    if (initialUser) {
      setFormData(initialUser);
    }
  }, [initialUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof User]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof User, string>> = {};
    if (!formData.name.trim()) newErrors.name = "El nombre es obligatorio.";
    if (!formData.surname.trim()) newErrors.surname = "El apellido es obligatorio.";
    if (!formData.birthDate) newErrors.birthDate = "La fecha de nacimiento es obligatoria.";
    else {
        const birthYear = new Date(formData.birthDate).getFullYear();
        if (birthYear > new Date().getFullYear() || birthYear < 1900) {
            newErrors.birthDate = "Fecha de nacimiento inválida.";
        }
    }
    // Add more validations if needed for gender, bloodtype
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      if (initialUser) {
        onSubmit({ ...initialUser, ...formData });
      } else {
        onSubmit(formData);
      }
    }
  };

  const genderOptions = GENDERS.map(g => ({ value: g, label: g }));
  const bloodTypeOptions = BLOOD_TYPES.map(b => ({ value: b, label: b }));

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-white shadow-lg rounded-xl border border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <Input
          label="Nombre(s)"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          maxLength={50}
          required
        />
        <Input
          label="Apellido(s)"
          id="surname"
          name="surname"
          value={formData.surname}
          onChange={handleChange}
          error={errors.surname}
          maxLength={50}
          required
        />
      </div>
      <Input
        label="Fecha de Nacimiento"
        id="birthDate"
        name="birthDate"
        type="date"
        value={formData.birthDate}
        onChange={handleChange}
        error={errors.birthDate}
        required
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <Select
          label="Género"
          id="gender"
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          options={genderOptions}
          error={errors.gender}
          required
        />
        <Select
          label="Grupo Sanguíneo"
          id="bloodType"
          name="bloodType"
          value={formData.bloodType}
          onChange={handleChange}
          options={bloodTypeOptions}
          error={errors.bloodType}
          required
        />
      </div>
      <div className="pt-4 flex justify-end">
        <Button type="submit" size="lg" leftIcon={initialUser ? <Save size={20}/> : <UserPlus size={20}/>}>
          {submitButtonText}
        </Button>
      </div>
    </form>
  );
};
    