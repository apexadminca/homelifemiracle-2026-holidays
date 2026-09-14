# Global Holiday Calendar 2026

A static, single-page site listing national holidays, religious observances,
and cultural celebrations from countries and territories around the world for
2026 — searchable and filterable by month.

**Live structure:**

```
.
├── index.html          # page markup
├── assets/
│   ├── style.css        # green / gold / white theme
│   ├── script.js        # search + month-filter logic, renders the table
│   └── data.json         # the 526 holiday entries (month, title, date)
└── README.md
```

## Run locally

No build step or dependencies. Just serve the folder, e.g.:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

(Opening `index.html` directly by double-clicking also works in most
browsers, but a local server avoids any `fetch()` restrictions on `file://`
URLs in some browsers.)

## Deploy on GitHub Pages

1. Create a new GitHub repository and push these files to the `main` branch:

   ```bash
   git init
   git add .
   git commit -m "Global Holiday Calendar 2026"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git push -u origin main
   ```

2. In the repository on GitHub: **Settings → Pages**.
3. Under **Build and deployment → Source**, choose **Deploy from a branch**.
4. Under **Branch**, choose `main` and folder `/ (root)`, then **Save**.
5. GitHub will publish the site at:
   `https://<your-username>.github.io/<repo-name>/`
   (this can take a minute or two the first time).

## Updating the data

Edit `assets/data.json` — it's a plain array of `[monthNumber, title, "Month Day, 2026"]`
entries, e.g.:

```json
[1, "New Year's Day (International)", "January 1, 2026"]
```

No other file needs to change; `script.js` reads this file at load time and
re-renders automatically.

## Notes on accuracy

Movable religious holidays (Ramadan, Eid al-Fitr, Eid al-Adha, Mawlid al-Nabi)
are shown at their expected/calculated date and may shift by a day depending
on local moon-sighting confirmation in a given country. Not every one of the
world's ~200 countries and territories is itemized individually — very small
territories and sub-national/regional holidays for most countries are outside
this list's scope.
