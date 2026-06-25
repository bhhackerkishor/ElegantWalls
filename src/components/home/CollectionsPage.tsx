// src/app/collections/page.tsx
import Link from 'next/link';

const COLLECTIONS = [
  { title: 'Anime', slug: 'anime', image: '/collections/anime.jpg' },
  { title: 'Cars', slug: 'car', image: '/collections/car.jpg' },
  { title: 'Movies', slug: 'movie', image: '/collections/movie.jpg' },
];

export default function CollectionsPage() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8">
      {COLLECTIONS.map((col) => (
        <Link href={`/collections/${col.slug}`} key={col.slug} className="group relative overflow-hidden rounded-xl aspect-[3/4]">
          <img src={col.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
            <h2 className="text-white text-xl font-bold uppercase">{col.title}</h2>
          </div>
        </Link>
      ))}
    </div>
  );
}