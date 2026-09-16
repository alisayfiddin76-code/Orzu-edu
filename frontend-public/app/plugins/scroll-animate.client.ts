// plugins/scroll-animate.client.ts
// Tashqi kutubxonasiz AOS - Intersection Observer yordamida

export default defineNuxtPlugin(() => {
  if (typeof window === 'undefined') return;

  const initScrollAnimations = () => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            el.classList.add('ao-visible');
            // Bir marta ishlagandan keyin kuzatishni to'xtatish
            observer.unobserve(el);
          }
        });
      },
      {
        threshold: 0.1,     // 10% ko'ringanda ishga tushadi
        rootMargin: '0px 0px -60px 0px'  // Pastdan 60px oldin
      }
    );

    // [data-ao] atributiga ega barcha elementlarni kuzatish
    const elements = document.querySelectorAll('[data-ao]');
    elements.forEach((el) => {
      observer.observe(el);
    });
  };
  // Nuxt hooks: faqat Vue to'liq render bo'lgach ishga tushirish (Hydration mismatch bo'lmasligi uchun)
  const nuxtApp = useNuxtApp();
  
  nuxtApp.hook('app:mounted', () => {
    setTimeout(initScrollAnimations, 50);
  });

  nuxtApp.hook('page:finish', () => {
    setTimeout(initScrollAnimations, 50);
  });
});
