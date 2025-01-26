import React from "react";
import HotjarProvider from './components/common/HotjarProvider';

const metadata = {
  language: 'en',
  title: "Learn Looper | Boost Learning Efficiency with Pomodoro & AB Loop",
  description: "A free, browser-based learning tool combining Pomodoro timer and YouTube AB loop. Enhance study focus, time management, and learning efficiency without login or stress.",
  keywords: [
    "Pomodoro timer",
    "YouTube AB loop",
    "study tool",
    "learning efficiency",
    "free study app",
    "time management",
    "mobile learning",
    "concentration tool"
  ],
  openGraph: {
    title: "Learn Looper - Optimize Your Learning Experience",
    description: "Streamline your study sessions with our intuitive, mobile-friendly learning tool featuring Pomodoro technique and YouTube AB loop.",
    type: "website",
    url: "https://learnlooper.app",
    locale: 'en_US',
  },
  twitter: {
    card: "summary_large_image",
    title: "Learn Looper | Smart Study Tool",
    description: "Boost your learning efficiency with our free Pomodoro and AB loop tool. No login required, works on mobile and desktop!",
  },
  icons: {
    icon: "/favicon.ico",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
    },
  },
  verification: {
    google: "your-google-site-verification-code",
  }
};

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <HotjarProvider />
      </head>
      <body>{children}</body>
    </html>
  );
}

export { metadata };
