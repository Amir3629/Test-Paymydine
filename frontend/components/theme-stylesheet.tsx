"use client";
import Head from "next/head";

export default function ThemeStylesheet({ themeKey }: { themeKey: string }) {
  const href = `/themes/${themeKey}.css`;
  return (
    <Head>
      <link rel="preload" as="style" href={href} />
      <link rel="stylesheet" href={href} />
    </Head>
  );
}