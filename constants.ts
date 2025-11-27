
import { HairstyleOption, HairColorOption } from './types';

export const HAIRSTYLES: HairstyleOption[] = [
  // Female Styles - 2024-2025 Trends
  { 
    id: 'butterfly-cut', 
    name: '蝴蝶層次剪', 
    description: 'Voluminous, face-framing layers like butterfly wings', 
    previewColor: 'bg-gradient-to-br from-rose-100 to-rose-300', 
    imageUrl: 'https://images.unsplash.com/photo-1596430364998-d874c76b107b?auto=format&fit=crop&w=300&q=80',
    gender: 'female' 
  },
  { 
    id: 'kitty-cut', 
    name: '貓系鎖骨髮', 
    description: 'Collarbone-length with subtle, feline layers', 
    previewColor: 'bg-gradient-to-br from-amber-100 to-orange-200', 
    imageUrl: 'https://images.unsplash.com/photo-1512413327311-53697960144f?auto=format&fit=crop&w=300&q=80',
    gender: 'female' 
  },
  { 
    id: 'hush-cut', 
    name: '高層次哈許剪', 
    description: 'Soft, airy, high-layered Hush cut', 
    previewColor: 'bg-gradient-to-br from-stone-200 to-stone-400', 
    imageUrl: 'https://images.unsplash.com/photo-1492106087820-71f171ce71d0?auto=format&fit=crop&w=300&q=80',
    gender: 'female' 
  },
  { 
    id: 'hippie-perm', 
    name: '嬉皮羊毛捲', 
    description: 'Bohemian style tight curls from root to tip', 
    previewColor: 'bg-gradient-to-br from-orange-100 to-amber-300', 
    imageUrl: 'https://images.unsplash.com/photo-1582095133179-bfd08e2fc6b3?auto=format&fit=crop&w=300&q=80',
    gender: 'female' 
  },
  { 
    id: 'glass-hair', 
    name: '琉璃直髮', 
    description: 'Ultra-shiny, sharp blunt bob', 
    previewColor: 'bg-gradient-to-br from-emerald-100 to-teal-300', 
    imageUrl: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=300&q=80',
    gender: 'female' 
  },
  { 
    id: 'wavy-long', 
    name: '浪漫大波浪', 
    description: 'Classic long romantic waves', 
    previewColor: 'bg-gradient-to-br from-pink-100 to-rose-300', 
    imageUrl: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=300&q=80',
    gender: 'female' 
  },
  
  // Male Styles - 2024-2025 Trends
  { 
    id: 'leaf-cut', 
    name: '韓系葉子頭', 
    description: 'Leaf cut with airy middle part flow', 
    previewColor: 'bg-gradient-to-br from-indigo-100 to-blue-300', 
    imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80',
    gender: 'male' 
  },
  { 
    id: 'ivy-league', 
    name: '美式常春藤', 
    description: 'Modern Ivy League crew cut', 
    previewColor: 'bg-gradient-to-br from-blue-100 to-sky-300', 
    imageUrl: 'https://images.unsplash.com/photo-1618077553739-4bb48dd6e133?auto=format&fit=crop&w=300&q=80',
    gender: 'male' 
  },
  { 
    id: 'spanish-crop', 
    name: '西班牙微蓋', 
    description: 'Spanish Crop with textured fringe', 
    previewColor: 'bg-gradient-to-br from-slate-200 to-gray-400', 
    imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80',
    gender: 'male' 
  },
  { 
    id: 'drop-fade', 
    name: '漸層削邊', 
    description: 'Sharp drop fade with textured top', 
    previewColor: 'bg-gradient-to-br from-neutral-200 to-stone-400', 
    imageUrl: 'https://images.unsplash.com/photo-1504257432389-52343af06ae3?auto=format&fit=crop&w=300&q=80',
    gender: 'male' 
  },
  { 
    id: 'guile-cut', 
    name: '紳士蓋爾頭', 
    description: 'Guile cut with distinct split hairline', 
    previewColor: 'bg-gradient-to-br from-gray-200 to-zinc-400', 
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    gender: 'male' 
  },
  { 
    id: 'wolf-mullet', 
    name: '潮流狼尾', 
    description: 'Edgy Wolf cut mullet style', 
    previewColor: 'bg-gradient-to-br from-zinc-200 to-neutral-500', 
    imageUrl: 'https://images.unsplash.com/photo-1605497788044-9a8006d8d568?auto=format&fit=crop&w=300&q=80',
    gender: 'male' 
  },
];

export const HAIR_COLORS: HairColorOption[] = [
  { id: 'black', name: '自然黑', hex: '#1a1a1a', promptValue: 'natural black hair' },
  { id: 'dark-brown', name: '深棕色', hex: '#4A3728', promptValue: 'dark brown hair' },
  { id: 'chestnut', name: '栗子棕', hex: '#8B4513', promptValue: 'chestnut brown hair' },
  { id: 'blonde', name: '亞麻金', hex: '#E6C288', promptValue: 'ash blonde hair' },
  { id: 'silver', name: '霧面銀', hex: '#C0C0C0', promptValue: 'silver gray hair' },
  { id: 'red', name: '酒紅色', hex: '#800020', promptValue: 'burgundy red hair' },
  { id: 'pink', name: '櫻花粉', hex: '#FFB6C1', promptValue: 'pastel pink hair' },
  { id: 'blue', name: '午夜藍', hex: '#191970', promptValue: 'midnight blue hair' },
];

export const INITIAL_PROMPT_SUFFIX = "Ensure high realism, cinematic lighting, and maintain the original face identity exactly.";
