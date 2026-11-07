// ============================================================
//  EDIT THIS FILE to run the site. No coding knowledge needed —
//  just copy a book block, change the text, and save.
// ============================================================

const SITE = {
  ngoName: "YOUR NGO NAME",          // e.g. "Pratham Books Trust"
  ngoAbout: "Every rupee goes straight to the NGO — I keep nothing.",
  upiId: "",                          // NGO's UPI ID, e.g. "ngo@okaxis". Leave "" to hide the QR.
  whatsapp: "",                       // your number with country code, digits only, e.g. "919876543210"
  email: "",                          // fallback contact if no WhatsApp
  minPrice: 50,
  maxPrice: 500,
};

// edition:   "original"  or  "first-copy"
// condition: "good" | "fair" | "worn" | "worse"
// sold:      true once someone has paid (it stays visible but greyed out)
// cover:     optional image link or file path (e.g. "covers/alchemist.jpg")
const BOOKS = [
  { title: "The Alchemist", author: "Paulo Coelho", genre: "Fiction", edition: "original", condition: "good", note: "Barely read, no markings." },
  { title: "Atomic Habits", author: "James Clear", genre: "Self-help", edition: "first-copy", condition: "good", note: "" },
  { title: "Harry Potter and the Philosopher's Stone", author: "J.K. Rowling", genre: "Fantasy", edition: "original", condition: "fair", note: "Spine creased, pages clean." },
  { title: "Wings of Fire", author: "A.P.J. Abdul Kalam", genre: "Biography", edition: "original", condition: "worn", note: "Some pencil underlining." },
  { title: "Diary of a Wimpy Kid", author: "Jeff Kinney", genre: "Kids", edition: "first-copy", condition: "worse", note: "Cover torn at corner, fully readable." },
  { title: "Sapiens", author: "Yuval Noah Harari", genre: "Non-fiction", edition: "original", condition: "good", note: "", sold: true },
];
