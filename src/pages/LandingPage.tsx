import { Link } from 'react-router-dom';
import {
  Sparkles,
  Store,
  Package,
  Wand2,
  Globe,
  ArrowRight,
  Check,
} from 'lucide-react';

const STEPS = [
  {
    icon: Store,
    title: 'Create your profile',
    desc: 'Add your business name, what you do, and where you are.',
  },
  {
    icon: Package,
    title: 'Add your products',
    desc: 'List your products or services with prices and photos.',
  },
  {
    icon: Wand2,
    title: 'Generate content',
    desc: 'Let AI write descriptions, taglines, and FAQs — you approve everything.',
  },
  {
    icon: Globe,
    title: 'Publish & share',
    desc: 'Get a public link to send to your customers.',
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Nav */}
      <nav className="sticky top-0 z-30 border-b border-stone-200/70 bg-stone-50/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-700 text-white">
              <Sparkles size={18} />
            </div>
            <span className="text-lg font-semibold tracking-tight text-stone-900">
              BizKit
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              to="/login"
              className="px-3 py-1.5 text-sm font-medium text-stone-600 transition hover:text-stone-900"
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-800">
                <Sparkles size={13} />
                Digital starter kit for small businesses
              </span>
              <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-stone-900 sm:text-5xl">
                Turn your small business into a professional online presence.
              </h1>
              <p className="mt-5 text-lg leading-relaxed text-stone-600">
                Create your profile, showcase your products, choose how
                customers contact you, and publish your business online —
                without needing technical skills.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 hover:shadow-md"
                >
                  Create My Business
                  <ArrowRight size={16} />
                </Link>
                <Link
                  to="/b/example"
                  className="inline-flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-6 py-3 text-sm font-semibold text-stone-800 transition hover:bg-stone-100"
                >
                  See Example
                </Link>
              </div>
              <p className="mt-4 text-xs text-stone-400">
                No credit card needed. Free during the MVP.
              </p>
            </div>

            {/* Example preview card */}
            <div className="relative">
              <div className="rounded-3xl border border-stone-200 bg-white p-2 shadow-2xl shadow-stone-300/40">
                <div className="rounded-2xl overflow-hidden">
                  <div className="bg-teal-700 px-6 py-8 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-white/25 text-xl font-bold text-white">
                      ZB
                    </div>
                    <h3 className="mt-3 text-xl font-bold text-white">
                      Zuckerbowl
                    </h3>
                    <p className="text-sm text-white/90">
                      Fresh homemade treats for every occasion.
                    </p>
                    <div className="mt-4 inline-flex rounded-full bg-white px-4 py-2 text-xs font-semibold text-teal-700">
                      Chat on WhatsApp
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="text-sm font-bold uppercase tracking-wide text-stone-400">
                      Our Menu
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      {[
                        { name: 'Chocolate Cake', price: '₹699' },
                        { name: 'Brownie Box', price: '₹399' },
                      ].map((item) => (
                        <div
                          key={item.name}
                          className="rounded-xl border border-stone-200 p-3"
                        >
                          <div className="flex h-16 items-center justify-center rounded-lg bg-teal-50 text-sm font-bold text-teal-700">
                            {item.name.slice(0, 2).toUpperCase()}
                          </div>
                          <p className="mt-2 text-sm font-semibold text-stone-800">
                            {item.name}
                          </p>
                          <p className="text-sm font-bold text-teal-700">
                            {item.price}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -right-3 -top-3 rounded-xl bg-amber-400 px-3 py-1.5 text-xs font-bold text-amber-900 shadow-lg">
                Live preview
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-stone-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-stone-900">
              How it works
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-stone-600">
              Four simple steps from signing up to sharing your business with
              the world.
            </p>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <div key={step.title} className="text-center">
                <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                  <step.icon size={24} />
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-teal-700 text-xs font-bold text-white">
                    {i + 1}
                  </span>
                </div>
                <h3 className="mt-4 font-semibold text-stone-900">
                  {step.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-stone-500">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who is it for */}
      <section className="bg-stone-50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-stone-900">
              Built for small businesses
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-stone-600">
              Whether you sell from your kitchen or your shop, BizKit gives you
              a professional page in minutes.
            </p>
          </div>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {[
              'Home bakeries',
              'Small restaurants',
              'Salons & spas',
              'Tutors',
              'Freelancers',
              'Clothing businesses',
              'Handmade sellers',
              'Local shops',
            ].map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-teal-700">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-20">
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Ready to take your business online?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-teal-100">
            Set up your free business page today and share it with your
            customers in minutes.
          </p>
          <Link
            to="/signup"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-teal-700 shadow-sm transition hover:scale-105"
          >
            Create My Business
            <ArrowRight size={16} />
          </Link>
          <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-teal-100">
            {['No technical skills needed', 'You stay in control', 'Share instantly'].map(
              (item) => (
                <span key={item} className="inline-flex items-center gap-1.5">
                  <Check size={15} />
                  {item}
                </span>
              )
            )}
          </div>
        </div>
      </section>

      <footer className="border-t border-teal-800 bg-teal-800 py-8 text-center text-sm text-teal-200">
        BizKit · A digital starter kit for small businesses
      </footer>
    </div>
  );
}
