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

## Catalogue extras

- Browse the book-card grid. Click, tap, or use Enter/Space on a card to open its details directly.
- Existing book notes appear as handwritten notes. Mystery books keep titles, authors, photos and personal notes hidden in previews and share images.
- Sold books appear on the **Found new homes** grid with the amount raised.
- **Save share card** in a book's details downloads a PNG for WhatsApp or Instagram. **Share** sends the link to the book.
- In admin **Site settings → Donation updates**, add completed transfers with their date, amount, optional note and public HTTPS receipt link. Publish normally. The public donation total comes only from these records; no transfer is inferred from a book sale. With no entries, the site says that no transfers have been recorded.

## Saved data and safe releases

Published data lives in GitHub: `books.json` holds books, settings and donation updates; `photos/` holds uploaded images. Deploying the static site does not create or reset a database. GitHub history retains previous committed versions. Unpublished edits are still browser-session drafts; publish them or download a backup before leaving.

For website code changes, commit first, then run:

```sh
node scripts/safe-push.cjs
```

This fetches newer admin updates, creates and verifies a full Git bundle under `.git/data-backups/`, rebases the code, compares catalogue and photo blobs, and pushes normally. It refuses local catalogue/photo changes and stops on conflicts or network failures. A concurrent admin save rejects the push; rerun the command to synchronize. Do not force-push. The guard protects this release command; it cannot prevent someone bypassing it with other Git commands.

The admin's **Download data backup** exports the current catalogue, settings, donation records, and photo paths without credentials. Actual image files remain in GitHub and the Git bundle. An outdated admin tab cannot overwrite a newer `books.json`: GitHub rejects its old file SHA. Download the draft before reloading on a conflict. Edits made while a save is in progress remain marked as unpublished.

To inspect a release backup without changing the website:

```sh
mkdir /tmp/pass-the-page-recovery
cd /tmp/pass-the-page-recovery
git init
git fetch /absolute/path/to/backup.bundle refs/remotes/origin/main:refs/heads/recovered
git checkout recovered
```

Review recovery files before restoring anything. A code-only release does not overwrite saved data, but intentional deletions, force pushes, or uncommitted drafts cannot be promised permanent recovery. Keep downloaded backups outside the project too.
