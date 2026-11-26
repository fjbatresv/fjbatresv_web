import { DOCUMENT } from '@angular/common';
import { DestroyRef, Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Meta, Title } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { profilePageJsonLd } from '../seo/json-ld';

type Lang = 'en' | 'es';

const SITE_URL = 'https://fjbatresv.com';

@Injectable({ providedIn: 'root' })
export class SeoLinksService {
  private readonly document = inject(DOCUMENT);
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  init(): void {
    this.updateLinks();
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => this.updateLinks());
  }

  private updateLinks(): void {
    const lang =
      this.router.routerState.snapshot.root.firstChild?.data['lang'] === 'es' ? 'es' : 'en';
    const canonical = lang === 'es' ? `${SITE_URL}/es/` : `${SITE_URL}/`;

    this.upsertLink('canonical', canonical);
    this.upsertAlternate('en', `${SITE_URL}/`);
    this.upsertAlternate('es', `${SITE_URL}/es/`);
    this.upsertAlternate('x-default', `${SITE_URL}/`);
    this.meta.updateTag({ property: 'og:url', content: canonical });
    this.meta.updateTag({ property: 'og:locale', content: lang === 'es' ? 'es_GT' : 'en_US' });
    const pageTitle =
      lang === 'es'
        ? 'Javier Batres — Arquitecto de Soluciones y Senior Full Stack Engineer'
        : 'Javier Batres — Solutions Architect & Senior Full Stack Engineer';
    const description =
      lang === 'es'
        ? 'Arquitecto de Soluciones y Senior Full Stack Engineer con 12 años en banca, pagos, identidad digital y salud. Desde Guatemala, en remoto.'
        : 'Solutions Architect and Senior Full Stack Engineer with 12 years in banking, payments, digital identity, and healthcare. Based in Guatemala.';
    const image = `https://fjbatresv.com/og-image-${lang}.png`;
    this.title.setTitle(pageTitle);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: pageTitle });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:image', content: image });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: pageTitle });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.document.head.querySelector('#profile-jsonld')?.remove();
    const structuredData = this.document.createElement('script');
    structuredData.id = 'profile-jsonld';
    structuredData.type = 'application/ld+json';
    structuredData.textContent = JSON.stringify(profilePageJsonLd(lang));
    this.document.head.appendChild(structuredData);
  }

  private upsertLink(rel: string, href: string): void {
    const link = this.document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
    const element = link ?? this.document.createElement('link');
    element.rel = rel;
    element.href = href;
    if (!link) this.document.head.appendChild(element);
  }

  private upsertAlternate(lang: Lang | 'x-default', href: string): void {
    const link = this.document.head.querySelector<HTMLLinkElement>(
      `link[rel="alternate"][hreflang="${lang}"]`
    );
    const element = link ?? this.document.createElement('link');
    element.rel = 'alternate';
    element.hreflang = lang;
    element.href = href;
    if (!link) this.document.head.appendChild(element);
  }
}
