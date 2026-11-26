# Pass the Page

A New Year book giveaway by Reyvan Sumbre. People pick a book, choose any price from ₹50 to ₹500 and tap **Take it**. That opens WhatsApp with a message to Reyvan saying which book they want and how much they're giving. Buyers pay Reyvan directly using payment details shared on WhatsApp. He donates the full book payment to Akshaya Chaitanya, an HKM Charitable Foundation initiative providing food relief in Mumbai.

**Live site:** https://reyvansumbre200.github.io/Pass-the-page/

## Managing books (admin)

Open `admin.html`, enter the password, and you can:

- add books, and edit or delete any book with the ✏️ and 🗑️ buttons on its row
- record the MRP (the price printed on the book), which buyers see next to the pay-what-you-like range
- upload photos straight from your phone camera (they're shrunk automatically, and the first photo is the cover)
- mark a book **Available**, **Reserved** or **Sold**, and enter what it sold for (this feeds the "raised so far" counter)
- turn a book into a **🎁 Blind date** (title hidden, only a clue shown)
- change site settings: NGO name and link, WhatsApp and phone number, Instagram link, price range and fundraising goal

Tap **Publish to site** when you're done. The live site updates about a minute later.

The first time on each device, the admin asks for a GitHub key. The page walks you through creating one, and it takes about 2 minutes. The key stays on that device only.

## Turning the site on (once)

Repo **Settings → Pages**: Source *Deploy from a branch*, branch `main`, folder `/ (root)`, then click Save.

## Files

- `index.html`: the public site
- `admin.html`: the admin portal
- `books.json`: all books and settings (the admin edits this for you)
- `photos/`: book photos uploaded through the admin

## Bookshelf extras

- Hover over a spine, tap on mobile, or focus it with the keyboard to reveal the cover. Choose **View book** for the details.
- Existing book notes appear as handwritten notes. Mystery books keep titles, authors, photos and personal notes hidden in previews and share images.
- Sold books appear on the **Found new homes** shelf with the amount raised.
- **Save share card** in a book's details downloads a PNG for WhatsApp or Instagram. **Share** sends the link to the book.
- In admin **Site settings → Donation updates**, add completed transfers with their date, amount, optional note and public HTTPS receipt link. Publish normally. The public donation total comes only from these records; no transfer is inferred from a book sale. With no entries, the site says that no transfers have been recorded.
