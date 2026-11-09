import React from 'react';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import ReviewClient from './ReviewClient';

interface TelegramImportDetailPageProps {
  params: {
    id: string;
  };
}

export const revalidate = 0;

export default async function TelegramImportDetailPage({ params }: TelegramImportDetailPageProps) {
  const [importItem, categories] = await Promise.all([
    db.getTelegramImportById(params.id),
    db.getCategories(),
  ]);

  if (!importItem) {
    notFound();
  }

  return <ReviewClient initialImport={importItem} categories={categories} />;
}

