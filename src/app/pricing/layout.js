import { generateMetadata } from '@/lib/seo';

export const metadata = generateMetadata({
  title: "Pricing",
  description: "Transparent pricing for ConsistencyGrid. Free plan available. Unlimited habits & goals on Pro. Track your life and build unstoppable consistency.",
  url: "https://consistencygrid.com/pricing"
});

export default function PricingLayout({ children }) {
  return children;
}
