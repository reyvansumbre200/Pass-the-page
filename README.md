# Pass the Page

A New Year book giveaway. People choose a book and pay anything from ₹50 to ₹500, and all of the money goes to an NGO.

## How to update it

Everything you need to change is in **`books.js`**:

1. **`SITE`**: the NGO's name, its UPI ID (this makes the payment QR code) and your WhatsApp number (people message you after they pay).
2. **`BOOKS`**: one line per book. Copy a line and change it.
   - `edition`: `"original"` or `"first-copy"`
   - `condition`: `"good"`, `"fair"`, `"worn"` or `"worse"`
   - `sold: true` once someone has paid (the book stays on the site, greyed out)
   - `cover`: optional photo, e.g. put `alchemist.jpg` in a `covers/` folder and write `cover: "covers/alchemist.jpg"`

The books in the file right now are **examples**. Replace them with your own.

## Put it online (free)

Go to repo **Settings → Pages**, set Source to *Deploy from a branch*, choose `main` and `/ (root)`, then click Save. After about a minute the site is live at
`https://reyvansumbre200.github.io/Pass-the-page/`

## How payment works

There's no server. Buyers pay the NGO directly with the UPI QR code, then tap **"I've paid"**, which opens WhatsApp with a message telling you which book they paid for and how much. Check the NGO received it, hand over the book, and set `sold: true`.
