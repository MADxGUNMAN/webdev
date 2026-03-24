export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/teacher/', '/profile/', '/login', '/register', '/update'],
    },
    sitemap: 'https://www.webdevcodes.xyz/sitemap.xml',
  };
}
