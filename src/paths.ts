export const paths = {
  home: '/',
  auth: { signIn: '/login', resetPassword: '/reset-password' },
  dashboard: {
    overview: '/dashboard',
    account: '/dashboard/account',
    doctor: '/dashboard/doctor',
    patient: '/dashboard/patient',
    speciality: '/dashboard/speciality',
    symptoms: '/dashboard/symptoms',
    customers: '/dashboard/appointment',
    integrations: '/dashboard/integrations',
    settings: '/dashboard/settings',
  },
  errors: { notFound: '/not-found' },
} as const;
