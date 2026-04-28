export type Destination = {
  id: string;
  name: string;
  region: string;
  lat: number;
  lng: number;
};

export const DESTINATIONS: Destination[] = [
  { id: "tsn", name: "San bay Tan Son Nhat", region: "TP.HCM", lat: 10.8188, lng: 106.6519 },
  { id: "q1", name: "Trung tam Quan 1 (Ben Thanh)", region: "TP.HCM", lat: 10.7720, lng: 106.6981 },
  { id: "thuduc", name: "TP. Thu Duc", region: "TP.HCM", lat: 10.8492, lng: 106.7728 },
  { id: "binhduong", name: "Binh Duong", region: "Binh Duong", lat: 11.0686, lng: 106.7325 },
  { id: "vungtau", name: "Vung Tau", region: "Ba Ria - Vung Tau", lat: 10.3460, lng: 107.0843 },
  { id: "phanthiet", name: "Phan Thiet / Mui Ne", region: "Binh Thuan", lat: 10.9333, lng: 108.1000 },
  { id: "dalat", name: "Da Lat", region: "Lam Dong", lat: 11.9404, lng: 108.4583 },
  { id: "nhatrang", name: "Nha Trang", region: "Khanh Hoa", lat: 12.2388, lng: 109.1967 },
  { id: "cantho", name: "Can Tho", region: "Dong bang song Cuu Long", lat: 10.0452, lng: 105.7469 },
  { id: "tienggiang", name: "My Tho (Tien Giang)", region: "Dong bang song Cuu Long", lat: 10.3600, lng: 106.3596 },
];

export function findDestination(id: string): Destination | undefined {
  return DESTINATIONS.find((d) => d.id === id);
}
