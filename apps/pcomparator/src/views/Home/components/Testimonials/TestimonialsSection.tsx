"use client";

import { Trans } from "@lingui/react/macro";
import type { ReactNode } from "react";

interface TestimonialProps {
  quote: React.ReactNode;
  author: string;
  title: ReactNode;
  initials: string;
}

function Testimonial({ quote, author, title, initials }: TestimonialProps) {
  return (
    <figure className="relative p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-sm">
      <blockquote className="relative">
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">{quote}</p>
      </blockquote>
      <figcaption className="relative flex items-center justify-start">
        <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 dark:text-primary-400 font-medium">
          {initials}
        </div>
        <div className="ml-4">
          <div className="text-base font-semibold">{author}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">{title}</div>
        </div>
      </figcaption>
    </figure>
  );
}

export function TestimonialsSection() {
  return (
    <div className="py-16 md:py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-center text-3xl md:text-4xl font-bold mb-6">
          <Trans>What our users say</Trans>
        </h2>
        <p className="text-center text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-16">
          <Trans>Discover how Deazl helps our users save on their groceries every day.</Trans>
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Testimonial
            quote={
              <>
                "
                <Trans>
                  Thanks to Deazl, I save an average of €20 per week on my groceries. The app is very easy to
                  use!
                </Trans>
                ""
              </>
            }
            author="Sophie M."
            initials="SM"
            title={<Trans>User for 6 months</Trans>}
          />
          <Testimonial
            quote={
              <>
                "<Trans>The list sharing is awesome! I can easily coordinate shopping with my family.</Trans>"
              </>
            }
            author="Thomas L."
            initials="TL"
            title={<Trans>User for 1 year</Trans>}
          />
          <Testimonial
            quote={
              <>
                "<Trans>The price tracking helps me spot the best deals. It's really convenient!</Trans>"
              </>
            }
            author="Marie L."
            initials="ML"
            title={<Trans>User for 3 months</Trans>}
          />
        </div>
      </div>
    </div>
  );
}
