import { PublicBusinessPage } from '@/components/PublicBusinessPage';
import type { Business, Product } from '@/lib/types';

const EXAMPLE_BUSINESS: Business = {
  id: 'example',
  owner_id: '',
  name: 'Zuckerbowl',
  tagline: 'Fresh homemade treats for every occasion.',
  description:
    'We make homemade cakes, brownies and cookies for every occasion. Every treat is baked fresh to order using quality ingredients — no preservatives, no shortcuts. Just the kind of baking you would do at home, if you had the time.',
  industry: 'Home Bakery',
  location: 'Vijayawada',
  logo_url: null,
  primary_color: '#b45309',
  contact_method: 'whatsapp',
  contact_value: '+91 98765 43210',
  published: true,
  faqs: [
    {
      question: 'How do I place an order?',
      answer:
        'Just tap the WhatsApp button above and send us a message with what you would like. We will confirm the price and pickup time.',
    },
    {
      question: 'How much advance notice do you need?',
      answer:
        'For cakes we ask for at least 2 days notice. Brownies and cookies can usually be ready within a day.',
    },
    {
      question: 'Do you offer delivery?',
      answer:
        'We offer free delivery within Vijayawada for orders above ₹1000. For smaller orders a small delivery fee applies.',
    },
    {
      question: 'Can you customize cakes for occasions?',
      answer:
        'Absolutely! Share your theme, colours, or a reference photo on WhatsApp and we will design something for you.',
    },
  ],
  created_at: '',
  updated_at: '',
};

const EXAMPLE_PRODUCTS: Product[] = [
  {
    id: 'p1',
    business_id: 'example',
    name: 'Chocolate Cake',
    description:
      'Rich chocolate cake made fresh to order. Two layers of moist sponge with silky chocolate ganache.',
    price: 699,
    image_url: null,
    created_at: '',
    updated_at: '',
  },
  {
    id: 'p2',
    business_id: 'example',
    name: 'Brownie Box',
    description:
      'A box of 6 fudhy chocolate brownies with a crackly top. Perfect for gifting or treating yourself.',
    price: 399,
    image_url: null,
    created_at: '',
    updated_at: '',
  },
  {
    id: 'p3',
    business_id: 'example',
    name: 'Cookie Box',
    description:
      'A mix of 12 homemade cookies — chocolate chip, butter, and oatmeal raisin. Baked fresh daily.',
    price: 299,
    image_url: null,
    created_at: '',
    updated_at: '',
  },
];

export function ExamplePage() {
  return <PublicBusinessPage business={EXAMPLE_BUSINESS} products={EXAMPLE_PRODUCTS} />;
}
