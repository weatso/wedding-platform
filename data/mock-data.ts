export type WeddingInvitation = {
  slug: string;
  groom: { name: string; nickname: string; father: string; mother: string };
  bride: { name: string; nickname: string; father: string; mother: string };
  eventDetails: {
    date: string;
    time: string;
    locationName: string;
    locationAddress: string;
    mapUrl: string;
  };
};

export const dummyInvitation: WeddingInvitation = {
  slug: "romeo-juliet",
  groom: { 
    name: "Romeo Montague", 
    nickname: "Romeo", 
    father: "Mr. Montague", 
    mother: "Mrs. Montague" 
  },
  bride: { 
    name: "Juliet Capulet", 
    nickname: "Juliet", 
    father: "Mr. Capulet", 
    mother: "Mrs. Capulet" 
  },
  eventDetails: {
    date: "Sabtu, 20 Desember 2025",
    time: "18:00 WIB - Selesai",
    locationName: "Grand Ballroom Hotel Indonesia",
    locationAddress: "Jl. M.H. Thamrin No.1, Jakarta Pusat",
    mapUrl: "https://maps.app.goo.gl/zZ8KbmgxqrR56CyMA"
  }
};