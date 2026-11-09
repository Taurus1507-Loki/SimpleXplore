import React from 'react';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import ReviewClient from './ReviewClient';

interface TelegramImportDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export const revalidate = 0;

export default async function TelegramImportDetailPage(props: TelegramImportDetailPageProps) {
  const params = await props.params;
  const [importItem, categories] = await Promise.all([
    db.getTelegramImportById(params.id),
    db.getCategories(),
  ]);

  if (!importItem) {
    notFound();
  }

  return <ReviewClient initialImport={importItem} categories={categories} />;
}

