import { create } from 'zustand';

export const useUserStore = create((set) => ({
  user: {
    uid: 'usr_ananya_01',
    fullName: 'Ananya Sharma',
    email: 'ananya.sharma@safesphere.ai',
    phoneNumber: '+1 (555) 382-9102',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    guardians: [
      {
        guardianId: 'grd_father_01',
        name: 'Rajesh Sharma',
        relation: 'Father',
        phoneNumber: '+1 (555) 982-1049',
        fcmToken: 'token_fcm_father_x882',
        status: 'ACTIVE_GUARD'
      },
      {
        guardianId: 'grd_sister_02',
        name: 'Priya Sharma',
        relation: 'Sister',
        phoneNumber: '+1 (555) 441-2093',
        fcmToken: 'token_fcm_sister_p991',
        status: 'ACTIVE_GUARD'
      }
    ],
    preferences: {
      safetyThreshold: 60,
      hapticWarnings: true,
      autoAlertGuardians: true,
      audioPrompts: true,
    }
  },

  addGuardian: (guardian) => set((state) => ({
    user: {
      ...state.user,
      guardians: [...state.user.guardians, { ...guardian, guardianId: `grd_${Date.now()}` }]
    }
  })),

  removeGuardian: (guardianId) => set((state) => ({
    user: {
      ...state.user,
      guardians: state.user.guardians.filter((g) => g.guardianId !== guardianId)
    }
  })),

  updatePreferences: (newPrefs) => set((state) => ({
    user: {
      ...state.user,
      preferences: { ...state.user.preferences, ...newPrefs }
    }
  }))
}));
