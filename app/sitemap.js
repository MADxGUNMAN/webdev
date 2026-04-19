export default function sitemap() {
  const baseUrl = 'https://www.webdevcodes.xyz';
  
  const routes = [
    '',
    '/about',
    '/contact',
    '/courses',
    '/teachers',
    '/playlist',
    '/watch-video',
    '/teacher-profile',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' || route === '/courses' ? 'daily' : 'weekly',
    priority: route === '' ? 1 : 0.8,
  }));

  return [...routes];
}
