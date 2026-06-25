'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { HiChevronDown, HiCodeBracket, HiCpuChip, HiPaintBrush, HiCommandLine, HiCube, HiDocumentText } from 'react-icons/hi2';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import MatrixRain from '@/components/ui/MatrixRain';
import ParticleNetwork from '@/components/ui/ParticleNetwork';
import { getProducts, getBlogPosts } from '@/lib/api';
import type { Product, BlogPost } from '@/types';

const categoryIcons: Record<string, React.ReactNode> = {
  'web': <HiCodeBracket className="w-8 h-8" />,
  'mobile': <HiCpuChip className="w-8 h-8" />,
  'design': <HiPaintBrush className="w-8 h-8" />,
  'devops': <HiCommandLine className="w-8 h-8" />,
  'tools': <HiCube className="w-8 h-8" />,
};

function AnimatedCounter({ target, label }: { target: number; label: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 2000;
          const steps = 60;
          const increment = target / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-5xl md:text-6xl font-heading font-bold text-accent-gold mb-2">
        {count}+
      </div>
      <div className="text-text-secondary text-lg font-body">{label}</div>
    </div>
  );
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [productsRes, blogRes] = await Promise.allSettled([
          getProducts(),
          getBlogPosts(),
        ]);
        if (productsRes.status === 'fulfilled') {
          setProducts(productsRes.value.data.products.slice(0, 6));
        }
        if (blogRes.status === 'fulfilled') {
          setBlogPosts(blogRes.value.data.posts.slice(0, 3));
        }
      } catch {
        // Silently handle - show empty states
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const formatPrice = (price: number) =>
    price.toLocaleString('uz-UZ').replace(/,/g, ',') + " so'm";

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary font-body">
      <Navbar />

      {/* ═══════════ HERO SECTION ═══════════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <MatrixRain color="gold" />
        </div>
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <ParticleNetwork color="gold" />
        </div>
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-bg-primary/60 via-transparent to-bg-primary pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
          {/* Decorative top line */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-accent-gold" />
            <HiCodeBracket className="w-6 h-6 text-accent-gold" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-accent-gold" />
          </div>

          <h1 className="text-6xl sm:text-7xl md:text-8xl font-heading font-bold text-accent-gold mb-6 tracking-wider">
            iDev-Hub
          </h1>

          <p className="text-xl sm:text-2xl md:text-3xl font-heading text-text-primary/90 mb-4">
            Dasturchilar uchun premium vositalar marketplace&apos;i
          </p>

          <p className="text-text-secondary text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            Tayyor kod shablonlari, UI kitlar, dasturchilik vositalari va boshqa ko&apos;plab
            resurslarni kashf eting. Professional dasturchilar tomonidan yaratilgan,
            professional dasturchilar uchun.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/catalog"
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-lg overflow-hidden transition-all duration-300"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-accent-gold to-accent-bronze rounded-lg" />
              <span className="absolute inset-[2px] bg-bg-primary rounded-[6px] group-hover:bg-bg-secondary transition-colors duration-300" />
              <span className="relative text-accent-gold group-hover:text-accent-gold-light transition-colors">
                Katalogni ko&apos;rish
              </span>
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-lg border border-border-default text-text-secondary hover:border-border-gold hover:text-text-primary transition-all duration-300"
            >
              Batafsil
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <HiChevronDown className="w-8 h-8 text-accent-gold/60" />
        </div>
      </section>

      {/* ═══════════ FEATURED PRODUCTS ═══════════ */}
      <section className="py-20 md:py-28 bg-bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-text-primary mb-4">
              Mashhur vositalar
            </h2>
            <div className="h-1 w-24 bg-gradient-to-r from-accent-gold to-accent-bronze mx-auto rounded-full" />
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-bg-tertiary rounded-xl border border-border-default p-6 animate-pulse">
                  <div className="w-16 h-16 bg-bg-secondary rounded-lg mb-4" />
                  <div className="h-5 bg-bg-secondary rounded w-3/4 mb-3" />
                  <div className="h-4 bg-bg-secondary rounded w-1/2 mb-4" />
                  <div className="h-4 bg-bg-secondary rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/catalog/${product.id}`}
                  className="group bg-bg-tertiary rounded-xl border border-border-default p-6 hover:border-border-gold hover:shadow-[0_0_30px_rgba(201,168,76,0.1)] transition-all duration-300"
                >
                  <div className="w-16 h-16 bg-bg-secondary rounded-lg flex items-center justify-center text-accent-gold mb-4 group-hover:scale-110 transition-transform duration-300">
                    {categoryIcons[product.category?.toLowerCase() || ''] || <HiCube className="w-8 h-8" />}
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2 group-hover:text-accent-gold transition-colors">
                    {product.name}
                  </h3>
                  <span className="inline-block text-xs font-mono px-2 py-1 rounded bg-accent-gold/10 text-accent-gold border border-accent-gold/20 mb-3">
                    {product.category}
                  </span>
                  <p className="text-text-secondary text-sm line-clamp-2 mb-4">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-accent-gold font-bold text-lg">
                      {formatPrice(product.price)}
                    </span>
                    <span className="text-text-secondary text-sm group-hover:text-accent-gold transition-colors">
                      Batafsil →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-text-secondary text-lg">
              Hozircha mahsulotlar mavjud emas. Tez orada yangilanadi!
            </p>
          )}

          <div className="text-center mt-12">
            <Link
              href="/catalog"
              className="inline-flex items-center gap-2 px-6 py-3 text-accent-gold border border-border-gold rounded-lg hover:bg-accent-gold/5 transition-all duration-300"
            >
              Barcha mahsulotlarni ko&apos;rish →
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════ BLOG SECTION ═══════════ */}
      <section className="py-20 md:py-28 bg-bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-text-primary mb-4">
              Dasturchilar uchun yangiliklar
            </h2>
            <div className="h-1 w-24 bg-gradient-to-r from-accent-gold to-accent-bronze mx-auto rounded-full" />
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-bg-secondary rounded-xl border border-border-default p-6 animate-pulse">
                  <div className="w-full h-40 bg-bg-tertiary rounded-lg mb-4" />
                  <div className="h-5 bg-bg-tertiary rounded w-3/4 mb-3" />
                  <div className="h-4 bg-bg-tertiary rounded w-full mb-2" />
                  <div className="h-4 bg-bg-tertiary rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : blogPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {blogPosts.map((post) => (
                <article
                  key={post.id}
                  className="group bg-bg-secondary rounded-xl border border-border-default overflow-hidden hover:border-border-gold hover:shadow-[0_0_30px_rgba(201,168,76,0.1)] transition-all duration-300"
                >
                  <div className="w-full h-48 bg-bg-tertiary flex items-center justify-center text-accent-gold/30">
                    <HiDocumentText className="w-16 h-16" />
                  </div>
                  <div className="p-6">
                    <time className="text-xs text-text-secondary font-mono">
                      {new Date(post.createdAt).toLocaleDateString('uz-UZ', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </time>
                    <h3 className="text-lg font-semibold text-text-primary mt-2 mb-3 group-hover:text-accent-gold transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-text-secondary text-sm line-clamp-3 mb-4">
                      {post.excerpt || post.content?.substring(0, 150)}
                    </p>
                    <span className="text-accent-gold text-sm font-medium group-hover:underline">
                      O&apos;qish →
                    </span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="text-center text-text-secondary text-lg">
              Tez orada blog maqolalari qo&apos;shiladi!
            </p>
          )}
        </div>
      </section>

      {/* ═══════════ STATS SECTION ═══════════ */}
      <section className="py-20 md:py-28 bg-bg-secondary relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(201,168,76,0.3) 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }} />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-text-primary mb-4">
              Raqamlarda biz
            </h2>
            <div className="h-1 w-24 bg-gradient-to-r from-accent-gold to-accent-bronze mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-12">
            <AnimatedCounter target={100} label="Mahsulotlar" />
            <AnimatedCounter target={500} label="Dasturchilar" />
            <AnimatedCounter target={50} label="Kategoriyalar" />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
