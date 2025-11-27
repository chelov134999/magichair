
import { supabase } from '../supabaseClient';
import { ViewAngle } from '../types';

const functionBase =
  import.meta.env.VITE_SUPABASE_FUNCTION_URL ||
  `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

/**
 * Converts a File object to a Data URL string (preserving mime type).
 */
export const fileToDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Calls the Supabase Edge Function to generate a hairstyle.
 * The Edge Function handles Gemini calls and billing/limits.
 */
export const generateHairstyle = async (
  originalImageDataUrl: string | null,
  styleDescription: string,
  colorDescription: string,
  gender: string,
  angle: ViewAngle
): Promise<string> => {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;

  const response = await fetch(`${functionBase}/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      originalImageDataUrl,
      styleDescription,
      colorDescription,
      gender,
      angle,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to generate hairstyle');
  }

  const json = await response.json();
  if (!json?.imageUrl) {
    throw new Error('No image returned from generator');
  }
  return json.imageUrl as string;
};
