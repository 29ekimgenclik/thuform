import fs from "node:fs";
import path from "node:path";
import React from "react";
import { Document, Page, Text, View, Image, StyleSheet, Font, renderToBuffer } from "@react-pdf/renderer";
import type { Submission } from "./db";

let logoDataUrl: string | null = null;
function getLogoDataUrl() {
  if (logoDataUrl) return logoDataUrl;
  const buf = fs.readFileSync(path.join(process.cwd(), "public", "images", "header-logo.png"));
  logoDataUrl = `data:image/png;base64,${buf.toString("base64")}`;
  return logoDataUrl;
}

let fontsRegistered = false;
function registerFonts() {
  if (fontsRegistered) return;
  const base = path.join(process.cwd(), "public", "fonts");
  const toDataUrl = (file: string) => {
    const buf = fs.readFileSync(path.join(base, file));
    return `data:font/woff;base64,${buf.toString("base64")}`;
  };
  try {
    (Font as any).clear?.();
  } catch {}
  Font.register({
    family: "Roboto",
    fonts: [
      { src: toDataUrl("Roboto-Regular.woff"), fontWeight: 400 },
      { src: toDataUrl("Roboto-Bold.woff"), fontWeight: 700 },
      {
        src: toDataUrl("Roboto-Italic.woff"),
        fontWeight: 400,
        fontStyle: "italic",
      },
    ],
  });
  Font.registerHyphenationCallback((word) => [word]);
  fontsRegistered = true;
}

const styles = StyleSheet.create({
  page: {
    fontFamily: "Roboto",
    fontSize: 11,
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 50,
    lineHeight: 1.4,
    color: "#000",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  headerLogo: { width: 60, height: 58, marginRight: 8 },
  headerCenter: { flex: 1, textAlign: "center" },
  headerRight: { width: 60 },
  headerLine: { fontWeight: 700, fontSize: 11 },
  table: {
    borderWidth: 1,
    borderColor: "#000",
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginTop: 6,
    marginBottom: 14,
  },
  row: { flexDirection: "row" },
  cellLabel: {
    flex: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#000",
    padding: 5,
    fontWeight: 700,
    fontSize: 9.5,
    backgroundColor: "#f0f0f0",
  },
  cellValue: {
    flex: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#000",
    padding: 5,
    fontSize: 10,
    minHeight: 22,
  },
  cellLabelWide: {
    flex: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#000",
    padding: 5,
    fontWeight: 700,
    fontSize: 9.5,
    backgroundColor: "#f0f0f0",
  },
  cellValueWide: {
    flex: 3,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#000",
    padding: 5,
    fontSize: 10,
    minHeight: 22,
  },
  para: { marginBottom: 6, textAlign: "justify" },
  example: { fontStyle: "italic", marginBottom: 6 },
  activityLine: {
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    borderBottomStyle: "dotted",
    paddingVertical: 4,
    minHeight: 16,
    fontSize: 10,
  },
  questionLabel: { fontWeight: 700, marginTop: 10, marginBottom: 4 },
  answer: {
    minHeight: 50,
    borderBottomWidth: 1,
    borderColor: "#000",
    borderStyle: "dotted",
    paddingBottom: 4,
    fontSize: 10,
  },
  footer: { marginTop: 18 },
  footerLine: { marginBottom: 6, fontSize: 11 },
});

function fmtDate(iso: string) {
  if (!iso) return "";
  const parts = iso.split("-");
  if (parts.length === 3) return `${parts[2]}.${parts[1]}.${parts[0]}`;
  return iso;
}

function buildDoc(data: Submission) {
  return React.createElement(
    Document,
    null,
    React.createElement(
      Page,
      { size: "A4", style: styles.page },
      React.createElement(
        View,
        { style: styles.headerRow },
        React.createElement(Image, { src: getLogoDataUrl(), style: styles.headerLogo }),
        React.createElement(
          View,
          { style: styles.headerCenter },
          React.createElement(
            Text,
            { style: styles.headerLine },
            "TEPEBAŞI BELEDİYESİ GENÇLİK VE SPOR HİZMETLERİ MÜDÜRLÜĞÜ",
          ),
          React.createElement(Text, { style: styles.headerLine }, "29 EKİM GENÇLİK MERKEZİ"),
          React.createElement(
            Text,
            { style: styles.headerLine },
            "SOSYAL SORUMLULUK PROGRAMLARI SONUÇ RAPORU",
          ),
        ),
        React.createElement(View, { style: styles.headerRight }),
      ),
      React.createElement(
        View,
        { style: styles.table },
        React.createElement(
          View,
          { style: styles.row },
          React.createElement(Text, { style: styles.cellLabel }, "Öğrencinin Adı ve Soyadı:"),
          React.createElement(Text, { style: styles.cellValue }, data.ogrenciAdSoyad),
          React.createElement(
            Text,
            { style: styles.cellLabel },
            "Üniversitede Gönüllülük Çalışmaları Dersini Aldığı Öğretim Üyesi:",
          ),
          React.createElement(Text, { style: styles.cellValue }, data.ogretimUyesi),
        ),
        React.createElement(
          View,
          { style: styles.row },
          React.createElement(
            Text,
            { style: styles.cellLabel },
            "Öğrencinin T.C. Kimlik (Öğrenci) Numarası:",
          ),
          React.createElement(Text, { style: styles.cellValue }, data.tcKimlik),
          React.createElement(
            Text,
            { style: styles.cellLabel },
            "Öğrencinin Telefon Numarası:",
          ),
          React.createElement(Text, { style: styles.cellValue }, data.telefon),
        ),
        React.createElement(
          View,
          { style: styles.row },
          React.createElement(
            Text,
            { style: styles.cellLabelWide },
            "Öğrencinin Okulu, Fakültesi ve Bölümü:",
          ),
          React.createElement(Text, { style: styles.cellValueWide }, data.okulFakulteBolum),
        ),
      ),
      React.createElement(
        Text,
        { style: styles.para },
        "Lütfen destek verdiğiniz etkinlikleri tarih, saat aralığı, etkinlik açıklaması şeklinde örnekte belirtildiği gibi yazınız. (Kaç etkinlik yaptıysanız maddeler halinde belirtiniz.)",
      ),
      React.createElement(
        Text,
        { style: styles.example },
        "ÖRN. 03.12.2016 – saat: 13:00-14:00 arası – İlkokul 3. Sınıf Matematik Etüdü",
      ),
      ...data.etkinlikler.map((e, i) =>
        React.createElement(Text, { key: i, style: styles.activityLine }, `${i + 1}. ${e}`),
      ),
      React.createElement(
        Text,
        { style: styles.questionLabel },
        "Dahil olduğunuz sosyal sorumluluk programında aktif olarak rol aldığınızı düşünüyor musunuz?",
      ),
      React.createElement(Text, { style: styles.answer }, data.aktifRolDusunce),
      React.createElement(Text, { style: styles.questionLabel }, "Bu süreçte siz ne kazandınız?"),
      React.createElement(Text, { style: styles.answer }, data.kazanim),
      React.createElement(
        Text,
        { style: styles.questionLabel },
        "Bu sürecin topluma faydasının ne olduğunu düşünüyorsunuz? Siz topluma ne kattınız?",
      ),
      React.createElement(Text, { style: styles.answer }, data.toplumaFayda),
      React.createElement(
        View,
        { style: styles.footer },
        React.createElement(
          Text,
          { style: styles.footerLine },
          `Öğrencinin Adı & Soyadı: ${data.ogrenciAdSoyad}`,
        ),
        React.createElement(
          Text,
          { style: styles.footerLine },
          `Belge Teslim Tarihi: ${fmtDate(data.belgeTeslimTarihi)}`,
        ),
      ),
    ),
  );
}

export async function renderSubmissionPdf(data: Submission): Promise<Buffer> {
  registerFonts();
  return renderToBuffer(buildDoc(data) as any);
}

export function pdfFilename(data: Submission): string {
  const safe = (s: string) =>
    s.trim().replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_\-çÇğĞıİöÖşŞüÜ]/g, "");
  const name = safe(data.ogrenciAdSoyad) || "ogrenci";
  return `THU_Sonuc_Raporu_${name}.pdf`;
}
