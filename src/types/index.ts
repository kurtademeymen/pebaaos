export type ProfileType = "personal" | "team";

export interface BaseProfile {
  id?: string;
  uid: string; // The strictly authenticated user's ID
  username?: string; // Custom URL slug
  profileType: ProfileType;
  bio: string;
  skills: string[];
  lookingFor: string[];
  contactType: "Instagram" | "E-posta" | "Discord" | "Diğer";
  contactValue: string;
  isApproved: boolean; // Managed by admin
  isVisible: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createdAt: any;
}

export interface PersonalProfile extends BaseProfile {
  profileType: "personal";
  displayName: string;
  grade: "9" | "10" | "11" | "12" | "Mezun";
  interests: string[];
  availability: "Düşük (1-3 Saat)" | "Orta (3-8 Saat)" | "Yüksek (8+ Saat)";
  isActivelyLooking: boolean;
}

export interface TeamProfile extends BaseProfile {
  profileType: "team";
  teamName: string;
  projectStage: "Fikir Aşaması" | "Prototip" | "Geliştirme" | "Yayınlandı";
}

export type UserProfile = PersonalProfile | TeamProfile;

export interface ReferenceKey {
  id?: string;
  code: string;
  isUsed: boolean;
  usedBy?: string; // UID of user who used it
  createdBy: string; // Admin UID
  role: "admin" | "user";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createdAt: any;
}
