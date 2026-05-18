export type FormData = {
  ogrenciAdSoyad: string;
  ogretimUyesi: string;
  tcKimlik: string;
  telefon: string;
  okulFakulteBolum: string;
  etkinlikler: string[];
  aktifRolDusunce: string;
  kazanim: string;
  toplumaFayda: string;
  belgeTeslimTarihi: string;
  hocaEmail: string;
};

export const emptyForm: FormData = {
  ogrenciAdSoyad: "",
  ogretimUyesi: "",
  tcKimlik: "",
  telefon: "",
  okulFakulteBolum: "",
  etkinlikler: [""],
  aktifRolDusunce: "",
  kazanim: "",
  toplumaFayda: "",
  belgeTeslimTarihi: "",
  hocaEmail: "",
};
