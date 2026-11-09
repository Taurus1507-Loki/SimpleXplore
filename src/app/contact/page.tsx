import React from 'react';
import ContactForm from './ContactForm';
import PageHeader from '@/components/PageHeader';

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <PageHeader
        crumbs={[{ name: 'Contact', path: '/contact' }]}
        eyebrow="Get in touch"
        title="Contact us"
        description="Questions, partnership enquiries, or a price that looks out of date? We read every message."
      />
      <ContactForm />
    </div>
  );
}
