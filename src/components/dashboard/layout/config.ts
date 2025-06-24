import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';
import { useState, useEffect } from "react";
import { Utility } from "@/utils";

export const navItems = [
  { key: 'dashboard', title: 'Dashboard', href: paths.dashboard.overview, icon: 'chart-pie' },
  { key: 'appointment', title: 'Appointment', href: paths.dashboard.appointment, icon: 'users' },
  { key: 'doctor', title: 'Doctor', href: paths.dashboard.doctor, icon: 'user' },
  { key: 'patient', title: 'Patient', href: paths.dashboard.patient, icon: 'users' },
  { key: 'speciality', title: 'Specialization', href: paths.dashboard.specialization, icon: 'stethoscope' },
  { key: 'qualification', title: 'Qualification', href: paths.dashboard.qualification, icon: 'graduation-cap' },
  { key: 'symptoms', title: 'Symptom', href: paths.dashboard.symptom, icon: 'medical-services' },
  { key: 'settings', title: 'Settings', href: paths.dashboard.settings, icon: 'gear-six' },
  { key: 'activeRooms', title: 'Active Rooms', href: paths.dashboard.activeRooms, icon: 'Video' },
] satisfies NavItemConfig[];

const getNavItemsByRole = (): NavItemConfig[] => {
  const { decodedToken } = Utility();
  const role = decodedToken()?.role;

  if (role === "doctor") {
    return navItems.filter(item =>
      ["dashboard", "appointment", "activeRooms"].includes(item.key)
    );
  }
  return navItems;
};

// **Hook to dynamically update nav items based on role**
export function useNavItems() {
  const [filteredNavItems, setFilteredNavItems] = useState<NavItemConfig[]>(getNavItemsByRole());

  useEffect(() => {
    const updateNavItems = () => {
      setFilteredNavItems(getNavItemsByRole());
    };

    window.addEventListener("storage", updateNavItems);
    return () => {
      window.removeEventListener("storage", updateNavItems);
    };
  }, []);

  return filteredNavItems;
}
