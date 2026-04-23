export type StylePref =
  | 'corporate'
  | 'modern'
  | 'minimal'
  | 'creative'
  | 'surprise';

export type PackageId = 'basic' | 'monthly' | 'unlimited';

export type UploadedFile = {
  name: string;
  size: number;
  type: string;
  dataUrl?: string;
};

export type OnboardingData = {
  fullName: string;
  email: string;
  phoneCountry: string;
  phoneNumber: string;
  roles: string[];
  linkedin: string;
  github: string;
  resume?: UploadedFile;
  headshot?: UploadedFile;
  style?: StylePref;
  colors: string[];
  customRequests: string;
  plan?: PackageId;
};

export const initialData: OnboardingData = {
  fullName: '',
  email: '',
  phoneCountry: '+1',
  phoneNumber: '',
  roles: [],
  linkedin: '',
  github: '',
  colors: [],
  customRequests: '',
};

export type StepMeta = {
  id: string;
  title: string;
  optional?: boolean;
};
