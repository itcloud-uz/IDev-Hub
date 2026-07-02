import React from 'react';

export const metadata = {
  title: 'iDev-Hub Admin Panel',
  description: 'iDev-Hub administrator control panel',
};

export default function AdminLayoutFile({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
