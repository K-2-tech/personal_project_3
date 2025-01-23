import React from "react";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
export const metadata = {
  title: "LearnLooper | Boost Learning Efficiency with Pomodoro & AB Loop",
  description:
    "LearnLooper combines a Pomodoro timer and YouTube AB loop for better focus and study efficiency. A free, easy-to-use tool designed to simplify learning!",
  icons: {
    icon: "/favicon.ico",
  },
};
