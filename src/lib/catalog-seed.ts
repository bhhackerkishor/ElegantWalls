import type { ProductCategory, ProductVariant } from '@/types';
import { generateSku, slugify } from './utils';

/* ── Pricing tables ── */
const POSTER_SIZES: Record<string, number> = { A5: 149, A4: 249, A3: 399, A2: 699 };
const POSTER_MATERIALS: Record<string, number> = {
  'Matte Paper': 0,
  'Glossy Film': 30,
  'Premium Matte Paper': 50,
};
const FRAME_ADDONS: Record<string, number> = {
  'No Frame': 0,
  'Black Frame': 150,
  'White Frame': 150,
  'Wooden Frame': 250,
};

const FRAME_SIZES: Record<string, number> = {
  '4×4 Inch': 120,
  '6×4 Inch': 150,
  '6×8 Inch': 170,
  '8×6 Inch': 170,
  '10×8 Inch': 250,
  '12×8 Inch': 300,
  '12×10 Inch': 370,
  '12×12 Inch': 440,
  '12×15 Inch': 540,
  '12×18 Inch': 620,
  '10×15 Inch': 400,
  '16×20 Inch': 1100,
  '16×24 Inch': 1450,
};

const FRAME_FINISHES = ['Natural Oak', 'Black Matte', 'White Classic', 'Walnut Wood'];
const STICKER_SIZES: Record<string, number> = { Small: 199, Medium: 349, Large: 499 };
const CANVAS_SIZES: Record<string, number> = { Small: 899, Medium: 1299, Large: 1699 };

const IMG = {
  anime: 'https://images.unsplash.com/photo-1608889175123-8ec330b86f84?q=80&w=800',
  movie: 'https://images.unsplash.com/photo-1501183007986-d0d080b147f9?q=80&w=800',
  gaming: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=800',
  motivational: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=800',
  family: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=800',
  couple: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800',
  baby: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=800',
  custom: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=800',
  quote: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800',
  nature: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800',
  kids: 'https://images.unsplash.com/photo-1608889175123-8ec330b86f84?q=80&w=800',
  office: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800',
  abstract: 'https://images.unsplash.com/photo-1549490349-8643362247b5?q=80&w=800',
  luxury: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800',
};

interface CatalogItem {
  title: string;
  subcategory: string;
  category: ProductCategory;
  shortDescription: string;
  longDescription: string;
  imageKey: keyof typeof IMG;
  isBestSeller?: boolean;
  isTrending?: boolean;
}

function v(
  slug: string,
  size: string,
  frame: string,
  material: string,
  orientation: string,
  price: number,
  stock = 100
): ProductVariant {
  return {
    sku: generateSku(slug, size, frame, material, orientation),
    size,
    frame,
    material,
    orientation,
    price,
    stockCount: stock,
  };
}

function posterVariants(slug: string): ProductVariant[] {
  const variants: ProductVariant[] = [];
  for (const [size, base] of Object.entries(POSTER_SIZES)) {
    for (const [material, matAdd] of Object.entries(POSTER_MATERIALS)) {
      for (const [frame, frameAdd] of Object.entries(FRAME_ADDONS)) {
        variants.push(
          v(slug, size, frame, material, 'Portrait', base + matAdd + frameAdd)
        );
      }
    }
  }
  return variants;
}

function photoFrameVariants(slug: string): ProductVariant[] {
  const variants: ProductVariant[] = [];
  for (const [size, price] of Object.entries(FRAME_SIZES)) {
    for (const finish of FRAME_FINISHES) {
      variants.push(v(slug, size, finish, 'Premium Cardstock', 'Portrait', price));
    }
  }
  return variants;
}

function stickerVariants(slug: string): ProductVariant[] {
  return Object.entries(STICKER_SIZES).map(([size, price]) =>
    v(slug, size, 'None', 'Vinyl Sticker', 'Portrait', price)
  );
}

function canvasVariants(slug: string): ProductVariant[] {
  return Object.entries(CANVAS_SIZES).map(([size, price]) =>
    v(slug, size, 'None', 'Canvas Print', 'Landscape', price)
  );
}

function customVariants(slug: string, category: ProductCategory): ProductVariant[] {
  if (category === 'poster') return posterVariants(slug);
  if (category === 'sticker') return stickerVariants(slug);
  if (category === 'canvas') return canvasVariants(slug);
  return photoFrameVariants(slug);
}

function buildProduct(item: CatalogItem) {
  const slug = slugify(item.title);
  const image = IMG[item.imageKey];
  const variantBuilders: Record<ProductCategory, () => ProductVariant[]> = {
    poster: () => posterVariants(slug),
    frame: () => photoFrameVariants(slug),
    sticker: () => stickerVariants(slug),
    canvas: () => canvasVariants(slug),
    custom: () => customVariants(slug, item.subcategory.includes('Sticker') ? 'sticker' : item.subcategory.includes('Canvas') ? 'canvas' : item.subcategory.includes('Frame') ? 'frame' : 'poster'),
  };

  return {
    title: item.title,
    slug,
    shortDescription: item.shortDescription,
    description: item.longDescription,
    category: item.category,
    subcategory: item.subcategory,
    seoMetaTitle: `${item.title} | Buy Online – Elegant Walls India`,
    seoMetaDescription: `${item.shortDescription} Premium quality wall decor with fast delivery across India.`,
    image,
    images: [image, IMG.custom],
    videos: [],
    variants: variantBuilders[item.category](),
    isBestSeller: item.isBestSeller ?? false,
    isTrending: item.isTrending ?? false,
  };
}

const CATALOG: CatalogItem[] = [
  /* Anime Posters */
  { title: 'Naruto Sage Mode Poster', subcategory: 'Anime Posters', category: 'poster', imageKey: 'anime', shortDescription: 'Epic Naruto Sage Mode artwork for anime fans.', longDescription: 'High-definition Naruto Sage Mode poster printed on premium 280 GSM paper. Vibrant colours, fade-resistant ink, and crisp detail make this the perfect centrepiece for any anime room.', isBestSeller: true, isTrending: true },
  { title: 'Itachi Uchiha Poster', subcategory: 'Anime Posters', category: 'poster', imageKey: 'anime', shortDescription: 'Dark and iconic Itachi Uchiha wall art.', longDescription: 'A striking Itachi Uchiha poster featuring the legendary shinobi. Available in multiple sizes with matte, glossy, or premium matte finishes and optional framing.', isTrending: true },
  { title: 'Gojo Satoru Poster', subcategory: 'Anime Posters', category: 'poster', imageKey: 'anime', shortDescription: 'Jujutsu Kaisen Gojo Satoru limited edition print.', longDescription: 'Showcase the strongest sorcerer with this Gojo Satoru poster. Ultra-sharp print quality with deep blacks and vivid blues for a premium anime aesthetic.', isBestSeller: true },
  { title: 'Monkey D. Luffy Poster', subcategory: 'Anime Posters', category: 'poster', imageKey: 'anime', shortDescription: 'One Piece Luffy adventure poster.', longDescription: 'Set sail with Monkey D. Luffy! This One Piece poster captures the spirit of adventure with bold colours and gallery-grade print quality.', isTrending: true },
  { title: 'Levi Ackerman Poster', subcategory: 'Anime Posters', category: 'poster', imageKey: 'anime', shortDescription: 'Attack on Titan Levi Ackerman poster.', longDescription: 'Humanity\'s strongest soldier on your wall. Levi Ackerman poster with razor-sharp detail, perfect for Attack on Titan collectors.', },
  /* Movie Posters */
  { title: 'Interstellar Minimal Poster', subcategory: 'Movie Posters', category: 'poster', imageKey: 'movie', shortDescription: 'Minimalist Interstellar cinematic art.', longDescription: 'A beautifully minimal Interstellar poster inspired by Christopher Nolan\'s masterpiece. Clean lines and cosmic tones for modern interiors.', isBestSeller: true },
  { title: 'The Dark Knight Poster', subcategory: 'Movie Posters', category: 'poster', imageKey: 'movie', shortDescription: 'Batman Dark Knight iconic poster.', longDescription: 'The Dark Knight rises on your wall. Premium movie poster with deep contrast printing for a dramatic bedroom or home theatre setup.', isTrending: true },
  { title: 'John Wick Poster', subcategory: 'Movie Posters', category: 'poster', imageKey: 'movie', shortDescription: 'John Wick action movie poster.', longDescription: 'Baba Yaga approved. High-impact John Wick poster with bold typography and cinematic colour grading.', },
  { title: 'Avengers Endgame Poster', subcategory: 'Movie Posters', category: 'poster', imageKey: 'movie', shortDescription: 'Marvel Avengers Endgame ensemble poster.', longDescription: 'Celebrate the epic finale with this Avengers Endgame poster. Rich colours and fine detail on premium archival paper.', isBestSeller: true },
  { title: 'Joker Art Poster', subcategory: 'Movie Posters', category: 'poster', imageKey: 'movie', shortDescription: 'Artistic Joker movie poster print.', longDescription: 'A hauntingly beautiful Joker art poster. Perfect for film buffs who appreciate bold, expressive wall art.', isTrending: true },
  /* Gaming Posters */
  { title: 'GTA VI Poster', subcategory: 'Gaming Posters', category: 'poster', imageKey: 'gaming', shortDescription: 'Grand Theft Auto VI teaser poster.', longDescription: 'Get ready for Vice City with this GTA VI poster. Vibrant neon aesthetics printed on premium paper for your gaming setup.', isTrending: true },
  { title: 'Red Dead Redemption Poster', subcategory: 'Gaming Posters', category: 'poster', imageKey: 'gaming', shortDescription: 'RDR2 western gaming poster.', longDescription: 'Ride into the sunset with this Red Dead Redemption poster. Rustic tones and cinematic composition for gaming rooms.', },
  { title: 'Valorant Jett Poster', subcategory: 'Gaming Posters', category: 'poster', imageKey: 'gaming', shortDescription: 'Valorant Jett agent poster.', longDescription: 'Jett diff on your wall. Dynamic Valorant poster with sharp agent artwork and esports-ready print quality.', isBestSeller: true },
  { title: 'Minecraft Adventure Poster', subcategory: 'Gaming Posters', category: 'poster', imageKey: 'gaming', shortDescription: 'Minecraft block world poster.', longDescription: 'Build your dream room with this Minecraft adventure poster. Pixel-perfect colours on premium matte or glossy paper.', },
  { title: 'God of War Ragnarok Poster', subcategory: 'Gaming Posters', category: 'poster', imageKey: 'gaming', shortDescription: 'Kratos God of War Ragnarok poster.', longDescription: 'Father and son, gods and monsters. God of War Ragnarok poster with epic Nordic imagery and premium HD printing.', isTrending: true },
  /* Motivational Posters */
  { title: 'Dream Big Poster', subcategory: 'Motivational Posters', category: 'poster', imageKey: 'motivational', shortDescription: 'Inspirational Dream Big typography poster.', longDescription: 'Start every morning with ambition. Clean typography on premium paper — ideal for offices, studios, and study rooms.', isBestSeller: true },
  { title: 'Discipline Equals Freedom Poster', subcategory: 'Motivational Posters', category: 'poster', imageKey: 'motivational', shortDescription: 'Discipline Equals Freedom quote poster.', longDescription: 'Jocko-inspired motivation for your workspace. Bold letterpress-style design on archival-quality paper.', isTrending: true },
  { title: 'Never Give Up Poster', subcategory: 'Motivational Posters', category: 'poster', imageKey: 'motivational', shortDescription: 'Never Give Up motivational wall art.', longDescription: 'Push through challenges with this powerful Never Give Up poster. Minimal design, maximum impact.', },
  { title: 'Hustle Mode Poster', subcategory: 'Motivational Posters', category: 'poster', imageKey: 'motivational', shortDescription: 'Hustle Mode entrepreneur poster.', longDescription: 'Fuel your grind. Hustle Mode poster designed for founders, creators, and go-getters.', },
  { title: 'Success Mindset Poster', subcategory: 'Motivational Posters', category: 'poster', imageKey: 'motivational', shortDescription: 'Success Mindset daily affirmation poster.', longDescription: 'Train your mind for success. Elegant typography poster that elevates any professional space.', },
  /* Photo Frames */
  { title: 'Family Memories Frame', subcategory: 'Family Frames', category: 'frame', imageKey: 'family', shortDescription: 'Classic family photo frame with glass front.', longDescription: 'Preserve cherished family moments in our handcrafted photo frame. Premium optical glass, solid timber construction, and secure wall-mount hardware included.', isBestSeller: true },
  { title: 'Happy Moments Frame', subcategory: 'Family Frames', category: 'frame', imageKey: 'family', shortDescription: 'Warm oak family memories frame.', longDescription: 'Celebrate joy with the Happy Moments frame. Available in 13 sizes from 4×4 to 16×24 inches with multiple finish options.', isTrending: true },
  { title: 'Vintage Family Frame', subcategory: 'Family Frames', category: 'frame', imageKey: 'family', shortDescription: 'Vintage-style family portrait frame.', longDescription: 'Rustic vintage finish for timeless family portraits. Hand-finished edges and anti-reflective glass.', },
  { title: 'Forever Together Frame', subcategory: 'Couple Frames', category: 'frame', imageKey: 'couple', shortDescription: 'Romantic couple photo frame.', longDescription: 'Perfect for anniversaries and weddings. The Forever Together frame pairs elegant design with museum-quality glass.', isBestSeller: true },
  { title: 'Love Story Frame', subcategory: 'Couple Frames', category: 'frame', imageKey: 'couple', shortDescription: 'Love Story dual-photo frame.', longDescription: 'Tell your love story on the wall. Premium couple frame with deep profile and rich wood grain finish.', isTrending: true },
  { title: 'Wedding Memory Frame', subcategory: 'Couple Frames', category: 'frame', imageKey: 'couple', shortDescription: 'Wedding day keepsake frame.', longDescription: 'Your special day deserves a special frame. Wedding Memory frame with gold-accent option and secure backing.', },
  { title: 'Baby Milestone Frame', subcategory: 'Baby Frames', category: 'frame', imageKey: 'baby', shortDescription: 'Baby milestone photo frame.', longDescription: 'Capture every giggle and first step. Soft-finish baby milestone frame safe for nursery walls.', isBestSeller: true },
  { title: 'Newborn Memories Frame', subcategory: 'Baby Frames', category: 'frame', imageKey: 'baby', shortDescription: 'Newborn portrait premium frame.', longDescription: 'Welcome your little one with the Newborn Memories frame. Acid-free matting protects precious prints for years.', isTrending: true },
  { title: 'Upload Your Photo Frame', subcategory: 'Custom Photo Frames', category: 'frame', imageKey: 'custom', shortDescription: 'Upload your photo — we print & frame it.', longDescription: 'Upload any JPEG or PNG and we\'ll print, frame, and deliver. Choose from 13 sizes and 4 premium finishes. The easiest custom frame experience in India.', isBestSeller: true, isTrending: true },
  { title: 'Custom Collage Frame', subcategory: 'Custom Photo Frames', category: 'frame', imageKey: 'custom', shortDescription: 'Multi-photo collage custom frame.', longDescription: 'Combine up to 9 photos in one stunning collage frame. Perfect for gallery walls and gift giving.', },
  /* Wall Stickers */
  { title: 'Believe In Yourself Sticker', subcategory: 'Quotes', category: 'sticker', imageKey: 'quote', shortDescription: 'Motivational quote wall sticker.', longDescription: 'Peel-and-stick vinyl quote decal. Removable, bubble-free application, and safe for painted walls.', isBestSeller: true },
  { title: 'Never Stop Learning Sticker', subcategory: 'Quotes', category: 'sticker', imageKey: 'quote', shortDescription: 'Education quote wall decal.', longDescription: 'Inspire curiosity with this Never Stop Learning sticker. Premium matte vinyl, easy repositioning.', },
  { title: 'Dream It Do It Sticker', subcategory: 'Quotes', category: 'sticker', imageKey: 'quote', shortDescription: 'Dream It Do It motivational decal.', longDescription: 'Turn dreams into action. Bold typography sticker for bedrooms, offices, and co-working spaces.', isTrending: true },
  { title: 'Tree Wall Sticker', subcategory: 'Nature', category: 'sticker', imageKey: 'nature', shortDescription: 'Large botanical tree wall decal.', longDescription: 'Bring nature indoors with a stunning tree silhouette sticker. Available in Small, Medium, and Large.', isBestSeller: true },
  { title: 'Birds Flying Sticker', subcategory: 'Nature', category: 'sticker', imageKey: 'nature', shortDescription: 'Flock of birds wall sticker set.', longDescription: 'Create movement on your walls with flying bird decals. High-quality removable vinyl.', },
  { title: 'Mountain Landscape Sticker', subcategory: 'Nature', category: 'sticker', imageKey: 'nature', shortDescription: 'Mountain range landscape decal.', longDescription: 'Alpine serenity for any room. Layered mountain sticker with depth effect printing.', isTrending: true },
  { title: 'Cartoon Animal Sticker', subcategory: 'Kids Room', category: 'sticker', imageKey: 'kids', shortDescription: 'Cute cartoon animal wall stickers.', longDescription: 'Adorable animal decals for nurseries and playrooms. Non-toxic, child-safe vinyl material.', isBestSeller: true },
  { title: 'Space Adventure Sticker', subcategory: 'Kids Room', category: 'sticker', imageKey: 'kids', shortDescription: 'Space theme kids room sticker set.', longDescription: 'Planets, rockets, and stars for budding astronauts. Glow-in-dark option on premium vinyl.', isTrending: true },
  { title: 'Dinosaur World Sticker', subcategory: 'Kids Room', category: 'sticker', imageKey: 'kids', shortDescription: 'Dinosaur jungle wall sticker pack.', longDescription: 'Roar into fun with dinosaur wall stickers. Pre-cut pieces for easy DIY installation.', },
  { title: 'Innovation Quote Sticker', subcategory: 'Office Decor', category: 'sticker', imageKey: 'office', shortDescription: 'Innovation office wall quote.', longDescription: 'Spark creativity in your workspace. Professional typography decal for startups and corporate offices.', },
  { title: 'Teamwork Sticker', subcategory: 'Office Decor', category: 'sticker', imageKey: 'office', shortDescription: 'Teamwork makes the dream work decal.', longDescription: 'Motivate your team with this office-ready wall sticker. Clean sans-serif design.', },
  { title: 'Productivity Sticker', subcategory: 'Office Decor', category: 'sticker', imageKey: 'office', shortDescription: 'Productivity focus wall decal.', longDescription: 'Stay focused, ship faster. Minimal productivity sticker for home offices and meeting rooms.', },
  /* Canvas Prints */
  { title: 'Abstract Golden Canvas', subcategory: 'Abstract Art', category: 'canvas', imageKey: 'abstract', shortDescription: 'Gold abstract gallery-wrap canvas.', longDescription: 'Museum-quality gallery-wrap canvas with hand-stretched edges. Rich gold abstract tones for luxury interiors.', isBestSeller: true, isTrending: true },
  { title: 'Blue Ocean Canvas', subcategory: 'Nature Art', category: 'canvas', imageKey: 'nature', shortDescription: 'Calming blue ocean canvas print.', longDescription: 'Serene ocean waves on premium 380 GSM canvas. UV-resistant inks for lasting colour vibrancy.', isTrending: true },
  { title: 'Mountain Sunset Canvas', subcategory: 'Nature Art', category: 'canvas', imageKey: 'nature', shortDescription: 'Mountain sunset landscape canvas.', longDescription: 'Golden hour over alpine peaks. Large-format canvas print with deep colour saturation.', isBestSeller: true },
  { title: 'Modern Geometry Canvas', subcategory: 'Abstract Art', category: 'canvas', imageKey: 'abstract', shortDescription: 'Modern geometric abstract canvas.', longDescription: 'Clean geometric shapes for contemporary spaces. Gallery-wrap canvas ready to hang.', },
  { title: 'Luxury Marble Canvas', subcategory: 'Luxury Art', category: 'canvas', imageKey: 'luxury', shortDescription: 'Marble texture luxury canvas art.', longDescription: 'Elevate your space with marble-texture canvas art. Premium finish for high-end living rooms and lobbies.', isBestSeller: true },
  /* Custom Products */
  { title: 'Custom Poster Print', subcategory: 'Custom Poster Print', category: 'custom', imageKey: 'custom', shortDescription: 'Upload your design — we print & ship.', longDescription: 'Upload any image and receive a premium poster print in your chosen size and finish. A5 to A2 available with optional framing.', isBestSeller: true, isTrending: true },
  { title: 'Custom Wall Sticker', subcategory: 'Custom Wall Sticker', category: 'custom', imageKey: 'custom', shortDescription: 'Custom vinyl sticker from your design.', longDescription: 'Turn your artwork into a custom wall sticker. Die-cut or full-sheet vinyl in Small, Medium, or Large.', isTrending: true },
  { title: 'Custom Canvas Print', subcategory: 'Custom Canvas Print', category: 'custom', imageKey: 'custom', shortDescription: 'Your photo on gallery-wrap canvas.', longDescription: 'Transform personal photos into gallery-wrap canvas prints. Hand-stretched, ready to hang, delivered safely across India.', isBestSeller: true },
];

export function getCatalogProducts() {
  return CATALOG.map(buildProduct);
}

export function getCatalogJson() {
  return JSON.stringify(getCatalogProducts(), null, 2);
}

/** @deprecated use getCatalogProducts */
export function getSeedProducts() {
  return getCatalogProducts();
}
