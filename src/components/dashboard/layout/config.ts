import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

export const navItems = [
  { key: 'overview', title: 'Overview', href: paths.dashboard.overview, icon: 'chart-pie' },
  { key: 'appointment', title: 'Appointment', href: paths.dashboard.customers, icon: 'users' },
  { key: 'doctor', title: 'Doctor', href: paths.dashboard.doctor, icon: 'user' },
  { key: 'patient', title: 'Patient', href: paths.dashboard.patient, icon: 'users' },
  { key: 'speciality', title: 'Speciality', href: paths.dashboard.speciality, icon: 'local-pharmacy' },
  { key: 'symptoms', title: 'Symptoms', href: paths.dashboard.symptoms, icon: 'medical-services' },
  { key: 'integrations', title: 'Integrations', href: paths.dashboard.integrations, icon: 'plugs-connected' },
  { key: 'settings', title: 'Settings', href: paths.dashboard.settings, icon: 'gear-six' },
  { key: 'error', title: 'Error', href: paths.errors.notFound, icon: 'x-square' },
] satisfies NavItemConfig[];
