
export type Gender = 'male' | 'female';

export interface HairstyleOption {
  id: string;
  name: string;
  description: string;
  previewColor: string;
  imageUrl: string;
  gender: Gender | 'both';
}

export interface HairColorOption {
  id: string;
  name: string;
  hex: string;
  promptValue: string;
}

export enum ViewAngle {
  FRONT = 'Front',
  SIDE = 'Side',
  BACK = 'Back'
}

export interface GeneratedImage {
  url: string; // Base64 or Blob URL
  angle: ViewAngle;
  styleId: string;
  colorId: string;
}

export type LoadingState = 'idle' | 'uploading' | 'processing' | 'error' | 'success';

export type Language = 'en' | 'zh' | 'jp' | 'kr' | 'es' | 'de' | 'fr';

export interface User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  isSubscribed: boolean;
  subscriptionType?: 'monthly' | 'yearly';
  freeTrialsRemaining: number;
}
