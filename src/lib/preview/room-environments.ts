import type { RoomEnvironment } from '@/types/preview';

export interface RoomEnvironmentConfig {
  id: RoomEnvironment;
  label: string;
  image: string;
  /** Frame placement as % of container */
  placement: { top: string; left: string; width: string };
  wallColor: string;
}

export const ROOM_ENVIRONMENTS: RoomEnvironmentConfig[] = [
  {
    id: 'living-room',
    label: 'Living Room',
    image: 'https://media.istockphoto.com/id/1277611101/photo/modern-sofa-on-light-pink-wall-background-with-trendy-home-accessories-home-decor-interior.jpg?s=612x612&w=0&k=20&c=wr_OKQqlSnIUZfS50uMcYaQJ7berDzQcexJcUhVSn-U=',
    placement: { top: '18%', left: '50%', width: '28%' },
    wallColor: '#E8E4DF',
  },
  {
    id: 'bedroom',
    label: 'Bedroom',
    image: 'https://img.magnific.com/free-psd/bedroom-wall-psd-minimal-interior_53876-109301.jpg',
    placement: { top: '22%', left: '52%', width: '26%' },
    wallColor: '#F0EDE8',
  },
  {
    id: 'office',
    label: 'Office',
    image: 'https://media.istockphoto.com/id/1933752815/photo/modern-interior-of-living-room-with-leather-armchair-on-wood-flooring-and-dark-blue-wall.jpg?s=612x612&w=0&k=20&c=KqVE2Sh7Mjx_EBQC3bN1X3YPyCtcMCttKKB0aKnFN3E=',
    placement: { top: '20%', left: '48%', width: '24%' },
    wallColor: '#E5E7EB',
  },
];

export function getRoomEnvironment(id: RoomEnvironment): RoomEnvironmentConfig {
  return ROOM_ENVIRONMENTS.find((r) => r.id === id) ?? ROOM_ENVIRONMENTS[0];
}
