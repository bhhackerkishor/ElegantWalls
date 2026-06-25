export default function AnnouncementBar() {
  const messages = [
    'FREE DELIVERY FOR PREPAID ORDERS!',
    'BUY 3 PHOTO FRAMES FOR ₹999 ONLY!',
    'FLAT 25% OFF — Use Code FIRSTFRAME',
    'CUSTOM SIZE & IMAGE UPLOADS',
    'ALL INDIA DELIVERY',
    'BUY 10 GET 2 FREE ON WALL POSTERS!',
  ];

  const text = messages.join(' • ') + ' • ' + messages.join(' • ');

  return (
    <div className="relative z-[101] bg-black text-white text-[13px] font-semibold tracking-wide py-2.5 overflow-hidden whitespace-nowrap">
      <div className="animate-marquee inline-block">{text}</div>
    </div>
  );
}
