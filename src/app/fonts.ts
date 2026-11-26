import { Science_Gothic, Golos_Text, Martian_Mono } from 'next/font/google';

export const scienceGothic = Science_Gothic({
  subsets: ['latin', 'cyrillic'],
  axes: ['wdth'],
  display: 'swap',
  preload: true,
  variable: '--ff-science-gothic',
});

export const golos = Golos_Text({
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  variable: '--ff-golos',
});

export const martian = Martian_Mono({
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  preload: false,
  variable: '--ff-martian',
});
