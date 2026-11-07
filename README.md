# Pass the Page

A New Year book giveaway by Reyvan Sumbre. People pick a book, choose any price from ₹50 to ₹500 and tap **Take it**. That opens WhatsApp with a message to Reyvan saying which book they want and how much they're giving. All of the money goes to an NGO.

**Live site:** https://reyvansumbre200.github.io/Pass-the-page/
**Admin:** https://reyvansumbre200.github.io/Pass-the-page/admin.html

## Managing books (admin)

Open `admin.html`, enter the password, and you can:

- add, edit and delete books
- upload photos straight from your phone camera (they're shrunk automatically, and the first photo is the cover)
- mark a book **Available**, **Reserved** or **Sold**, and enter what it sold for (this feeds the "raised so far" counter)
- turn a book into a **🎁 Blind date** (title hidden, only a clue shown)
- change site settings: NGO name and link, WhatsApp number, price range and fundraising goal

Tap **Publish to site** when you're done. The live site updates about a minute later.

The first time on each device, the admin asks for a GitHub key. The page walks you through creating one, and it takes about 2 minutes. The key stays on that device only.

## Turning the site on (once)

Repo **Settings → Pages**: Source *Deploy from a branch*, branch `main`, folder `/ (root)`, then click Save.

## Files

- `index.html`: the public site
- `admin.html`: the admin portal
- `books.json`: all books and settings (the admin edits this for you)
- `photos/`: book photos uploaded through the admin
