import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

export const navItems = [
  { key: 'dashboard', title: 'Dashboard', href: paths.dashboard.overview, icon: 'chart-pie' },
  { key: 'appointment', title: 'Appointment', href: paths.dashboard.customers, icon: 'users' },
  { key: 'doctor', title: 'Doctor', href: paths.dashboard.doctor, icon: 'user' },
  { key: 'patient', title: 'Patient', href: paths.dashboard.patient, icon: 'users' },
  { key: 'speciality', title: 'Speciality', href: paths.dashboard.speciality, icon: 'stethoscope' },
  { key: 'qualification', title: 'Qualification', href: paths.dashboard.qualification, icon: 'graduation-cap' },
  { key: 'symptoms', title: 'Symptoms', href: paths.dashboard.symptoms, icon: 'medical-services' },
  { key: 'settings', title: 'Settings', href: paths.dashboard.settings, icon: 'gear-six' },
] satisfies NavItemConfig[];
