# Screenshots — Report Assets

Drop your PNG files into this folder using the **suggested filename** for each
entry below. Each entry tells you:

- **URL** to visit in your browser
- **Sign in as** which demo account
- **Capture** what to include in the screenshot
- **Used for** which section of the report
- **Caption** suggestion to put under the image

When you replace each `<!-- screenshot here -->` placeholder with
`![caption](filename.png)`, GitHub will preview the README with the images
inline. You can also paste the captioned image straight into Word.

## Tips for clean captures

- Resolution: **1440 × 900** is the sweet spot for thesis layouts. Anything
  wider gets re-sized in Word.
- Use **Chrome's Device Toolbar** (Cmd+Shift+M) and pick "Responsive 1440 × 900"
  for consistency across all shots.
- Hide your browser's bookmarks bar (`Cmd+Shift+B` in Chrome) before each
  capture — it's a giveaway the demo is informal.
- Keep DevTools closed.
- Make sure the navbar doesn't show your real email on screenshots that
  aren't role-specific. Sign out for the public-facing ones.
- Clean DB before screenshotting: `rm dev.db && npx prisma db push && npm run seed`.
- For "active" demos (e.g., paid bookings, rated rides) you'll need to do
  the actions first, then capture. There's a script at the bottom of this
  README to seed plausible activity in 2 minutes.

---

## Index

| # | Section | Filename |
|---|---|---|
| 01 | Public marketing | `01-home-signed-out.png` |
| 02 | Hire-a-driver flow | `02-ride-form.png` |
| 03 | Hire-a-driver flow | `03-ride-form-with-estimate.png` |
| 04 | Rent-a-car flow | `04-rental-catalog.png` |
| 05 | Auth | `05-login.png` |
| 06 | Auth | `06-register.png` |
| 07 | Customer | `07-profile.png` |
| 08 | Customer | `08-booking-confirmation-paid.png` |
| 09 | Customer | `09-payment-form.png` |
| 10 | Admin | `10-admin-overview.png` |
| 11 | Admin | `11-admin-cars.png` |
| 12 | Admin | `12-admin-users.png` |
| 13 | Admin | `13-admin-booking-detail.png` |
| 14 | Admin | `14-admin-messages.png` |
| 15 | Owner | `15-owner-overview.png` |
| 16 | Owner | `16-owner-new-car-form.png` |
| 17 | Owner | `17-owner-bookings.png` |
| 18 | Driver | `18-driver-overview.png` |
| 19 | Driver | `19-driver-available-rides.png` |
| 20 | Driver | `20-driver-my-rides.png` |
| 21 | Marketing | `21-about-page.png` |
| 22 | Marketing | `22-contact-page.png` |
| 23 | UX | `23-error-page.png` |
| 24 | UX | `24-not-found-page.png` |

---

## 01 — Home (signed out)

- **URL:** `http://localhost:3000/`
- **Sign in as:** *Don't sign in.* This is the marketing-facing view.
- **Capture:** the full hero section ("Smart Mobility"), the
  **Hire a Driver / Rent a Car** tab toggle, and the navbar with the
  **Sign In** button visible.
- **Used for:** Report §3.1 (Results — opening visual). Also good as the
  cover image of your thesis.
- **Caption:** *Figure X. Public landing page.*

<!-- screenshot here: 01-home-signed-out.png -->

## 02 — Ride form (clean state)

- **URL:** `http://localhost:3000/` → **Hire a Driver** tab
- **Sign in as:** `user@gmail.com` / `123456`
- **Capture:** the left form panel and the Leaflet map on the right. Make
  sure you've **clicked once on the map** so the marker is visible and the
  pickup field is auto-filled with a Vietnamese address.
- **Used for:** §1.6 (Wireframe) and §3.1 (interactive map feature).
- **Caption:** *Figure X. Driver-hire booking form with interactive
  pickup map.*

<!-- screenshot here: 02-ride-form.png -->

## 03 — Ride form with price estimate

- **URL:** same as #2
- **Sign in as:** `user@gmail.com`
- **Capture:** after filling the form (e.g., **Saturday + Sunday** so the
  20% surcharge fires), click **Calculate Price** and capture the breakdown
  panel. Make sure both the daily-rate line and the surcharge line are
  visible.
- **Used for:** §2.4 (pricing algorithm), §3.1 (transparent pricing).
- **Caption:** *Figure X. Price breakdown showing weekend / holiday surcharge.*

<!-- screenshot here: 03-ride-form-with-estimate.png -->

## 04 — Rental catalog with rated cars

- **URL:** `http://localhost:3000/` → **Rent a Car** tab
- **Sign in as:** `user@gmail.com`
- **Capture:** the catalog showing several car cards. At least **one card
  should display a star rating** — to set this up, complete + pay + rate a
  rental (see "Seed activity" script below).
- **Used for:** §3.1 (catalog + ratings feature).
- **Caption:** *Figure X. Rental catalog with average per-car ratings.*

<!-- screenshot here: 04-rental-catalog.png -->

## 05 — Login page

- **URL:** `http://localhost:3000/login`
- **Sign in as:** *signed out*
- **Capture:** the login form (email + password). Optional: include a 400
  error state by entering wrong credentials and capturing the red toast.
- **Used for:** §3.1 (auth).
- **Caption:** *Figure X. Sign-in screen.*

<!-- screenshot here: 05-login.png -->

## 06 — Register with role selection

- **URL:** `http://localhost:3000/register`
- **Sign in as:** *signed out*
- **Capture:** the form with the **three-card role toggle** (Customer /
  Owner / Driver) clearly visible. Pick "Driver" so the purple card is
  highlighted — that emphasises the role design choice.
- **Used for:** §1.2 (use cases — three actor types), §3.1.
- **Caption:** *Figure X. Registration form with role selection.*

<!-- screenshot here: 06-register.png -->

## 07 — Profile / booking history

- **URL:** `http://localhost:3000/profile`
- **Sign in as:** `user@gmail.com`
- **Capture:** Make sure your demo customer has at least three bookings
  with different statuses (PENDING, ACCEPTED, COMPLETED). Show the
  **Cancel booking** button on a PENDING row and the **Leave a rating**
  button on a COMPLETED row.
- **Used for:** §3.1, §3.4 (rating + cancel features).
- **Caption:** *Figure X. Customer profile with mixed-status booking history.*

<!-- screenshot here: 07-profile.png -->

## 08 — Booking confirmation (paid, with assigned driver)

- **URL:** `http://localhost:3000/booking/ride/<some-id>`
- **Sign in as:** `user@gmail.com` (must be the booking owner)
- **Capture:** A booking that has been **accepted by a driver and paid**.
  The page should show a green "Paid" badge, the assigned driver's name +
  phone, and the status `ACCEPTED` or `COMPLETED`.
- **Used for:** §3.1 (assigned driver visibility — the contact loop).
- **Caption:** *Figure X. Booking confirmation showing the assigned driver
  and contact phone.*

<!-- screenshot here: 08-booking-confirmation-paid.png -->

## 09 — Mock payment form

- **URL:** `http://localhost:3000/booking/ride/<some-id>/payment`
- **Sign in as:** `user@gmail.com`
- **Capture:** the card-checkout form. Show one or two fields filled
  (card number, name) so it's visually engaging.
- **Used for:** §3.1, §2.10 sprint 2.
- **Caption:** *Figure X. Mock payment form (sandbox).*

<!-- screenshot here: 09-payment-form.png -->

## 10 — Admin overview (with revenue panel)

- **URL:** `http://localhost:3000/admin`
- **Sign in as:** `admin@gmail.com` / `123456`
- **Capture:** stat cards row, the **revenue breakdown panel** (4 cards),
  the 7-day bar chart, and the top of the rides table. Run the seed
  activity script first so the numbers are non-zero.
- **Used for:** §3.1 (admin dashboard), §1.1 (architecture — admin layer).
- **Caption:** *Figure X. Admin overview with revenue breakdown and 7-day
  chart.*

<!-- screenshot here: 10-admin-overview.png -->

## 11 — Admin cars CRUD

- **URL:** `http://localhost:3000/admin/cars`
- **Sign in as:** `admin@gmail.com`
- **Capture:** the cars table with the **+ Add new car** button visible
  in the top-right and the per-row **Edit** / **Delete** actions on the
  right.
- **Used for:** §3.1, §2.10 sprint 4.
- **Caption:** *Figure X. Admin cars management.*

<!-- screenshot here: 11-admin-cars.png -->

## 12 — Admin users (role + delete)

- **URL:** `http://localhost:3000/admin/users`
- **Sign in as:** `admin@gmail.com`
- **Capture:** the users table with at least **3–4 rows** so the role
  dropdowns and Delete links are visible. The "(you)" badge next to the
  admin's own row should be visible — that documents the
  self-protection feature.
- **Used for:** §3.1 (user management), §2.8 problem #6.
- **Caption:** *Figure X. Admin user management with self-protection.*

<!-- screenshot here: 12-admin-users.png -->

## 13 — Admin booking detail page

- **URL:** `http://localhost:3000/admin/booking/rental/<paid-rental-id>`
- **Sign in as:** `admin@gmail.com`
- **Capture:** A **paid** rental detail page so the **"Cancel & refund"**
  button is visible. Show the customer + owner contact panels and the
  inline status dropdown.
- **Used for:** §3.1 (refund flow), §2.10 sprint 9.
- **Caption:** *Figure X. Admin booking detail with refund action.*

<!-- screenshot here: 13-admin-booking-detail.png -->

## 14 — Admin contact messages

- **URL:** `http://localhost:3000/admin/messages`
- **Sign in as:** `admin@gmail.com`
- **Capture:** Submit one or two test messages from `/contact` first
  (any name / email / message). Capture the list view.
- **Used for:** §3.1 (admin messages tab), §2.10 sprint 4.
- **Caption:** *Figure X. Inbound contact messages.*

<!-- screenshot here: 14-admin-messages.png -->

## 15 — Owner overview

- **URL:** `http://localhost:3000/owner`
- **Sign in as:** `owner@gmail.com` / `123456`
- **Capture:** the four stat cards, the three-card commission breakdown
  (gross / 15% fee / net), and the 7-day chart. Seed activity (next
  section) so the numbers aren't zero.
- **Used for:** §3.1, §2.4 (commission split), §2.10 sprint 6.
- **Caption:** *Figure X. Owner dashboard with commission breakdown.*

<!-- screenshot here: 15-owner-overview.png -->

## 16 — Owner new-car form

- **URL:** `http://localhost:3000/owner/cars/new`
- **Sign in as:** `owner@gmail.com`
- **Capture:** the form with the BackLink ("Back to my cars") visible at
  the top, all the fields, and both checkboxes (Automatic transmission +
  List publicly).
- **Used for:** §3.1 (owner CRUD), §1.6 (wireframe — the form pattern).
- **Caption:** *Figure X. Owner — list a new car.*

<!-- screenshot here: 16-owner-new-car-form.png -->

## 17 — Owner bookings (with commission column)

- **URL:** `http://localhost:3000/owner/bookings`
- **Sign in as:** `owner@gmail.com`
- **Capture:** the bookings table. Make sure the **"You receive"** column
  shows the 85% net + the platform fee underneath. Status filter chips
  should be visible at the top.
- **Used for:** §3.1, §2.4 (commission).
- **Caption:** *Figure X. Owner bookings with per-booking net earnings.*

<!-- screenshot here: 17-owner-bookings.png -->

## 18 — Driver overview

- **URL:** `http://localhost:3000/driver`
- **Sign in as:** a registered driver (e.g., register `driver@gmail.com`
  via the UI, or use any DRIVER account you've made)
- **Capture:** the five stat tiles (including the **Rating** tile), the
  three-card earnings breakdown, and — if there are reviews — the
  "Recent reviews" panel below.
- **Used for:** §3.1 (driver dashboard), §2.10 sprint 7.
- **Caption:** *Figure X. Driver overview with earnings and ratings.*

<!-- screenshot here: 18-driver-overview.png -->

## 19 — Driver — available rides

- **URL:** `http://localhost:3000/driver/available`
- **Sign in as:** the driver
- **Capture:** at least one row in the queue. Show the **"You receive
  (90%)"** column and the **Accept** button. Make sure another customer
  has placed a PENDING ride first.
- **Used for:** §3.1 (driver dispatch loop), §1.5 (activity diagram).
- **Caption:** *Figure X. Driver — pending rides waiting to be claimed.*

<!-- screenshot here: 19-driver-available-rides.png -->

## 20 — Driver — my rides

- **URL:** `http://localhost:3000/driver/my-rides`
- **Sign in as:** the driver
- **Capture:** at least one row that the driver has accepted, ideally one
  ACCEPTED and one COMPLETED. Show the customer phone link and the
  status dropdown.
- **Used for:** §3.1, §3.4 (status workflow).
- **Caption:** *Figure X. Driver — accepted rides with customer contacts.*

<!-- screenshot here: 20-driver-my-rides.png -->

## 21 — About page

- **URL:** `http://localhost:3000/about`
- **Sign in as:** *signed out*
- **Capture:** scroll through and capture the four feature cards plus the
  "Our commitments" section.
- **Used for:** §3.1 (marketing pages).
- **Caption:** *Figure X. About page.*

<!-- screenshot here: 21-about-page.png -->

## 22 — Contact page (with form)

- **URL:** `http://localhost:3000/contact`
- **Sign in as:** *signed out*
- **Capture:** the left info panel + the form on the right. Optional:
  capture the **success state** by submitting a message ("Message
  sent!" green box).
- **Used for:** §3.1, §2.10 sprint 5.
- **Caption:** *Figure X. Contact form (persists messages to the DB).*

<!-- screenshot here: 22-contact-page.png -->

## 23 — Error page

- **URL:** trigger any runtime error, or open `/error.tsx` directly via a
  forced exception. Easiest demo: in DevTools, edit a Prisma query in a
  server component to point to a non-existent column — you'll get the
  custom error UI.
- **Capture:** the "Something went wrong" page with **Try again** and
  **Home** buttons.
- **Used for:** §3.1 (error handling).
- **Caption:** *Figure X. Custom error boundary.*

<!-- screenshot here: 23-error-page.png -->

## 24 — 404 not-found page

- **URL:** `http://localhost:3000/this-does-not-exist`
- **Sign in as:** anyone
- **Capture:** the "404" page with the back-to-home button.
- **Used for:** §3.1 (UX polish).
- **Caption:** *Figure X. Custom 404 page.*

<!-- screenshot here: 24-not-found-page.png -->

---

## Seed activity script

To get a non-empty admin/owner/driver dashboard for screenshots #4, #10,
#13, #15, #17, #18, #20, run this in a fresh terminal **after** starting
the dev server with `npm run dev`:

```bash
# 1. Reset DB to a known state
rm dev.db && npx prisma db push && npm run seed

# 2. Register a driver via the UI: open http://localhost:3000/register,
#    pick the "Driver" card, email driver@demo.com / password 123456.

# 3. Sign in as user@gmail.com (the customer) and make a few bookings
#    via the UI:
#    - 1 ride (Hire a Driver) for two weekdays — capture for #03 too
#    - 1 ride for a weekend so the 20% surcharge appears
#    - 2 rentals on different cars (Honda Civic + Toyota Vios)
#    - Pay all of them via the mock payment form
#
# 4. Sign in as driver@demo.com:
#    - Open /driver/available, accept one ride
#    - On /driver/my-rides, mark it COMPLETED
#
# 5. Sign in as user@gmail.com:
#    - On /profile, click "Leave a rating" on the COMPLETED ride
#      (5 stars + a short comment)
#    - Same on the rental that's COMPLETED (after admin marks it so)
#
# 6. Sign in as admin@gmail.com:
#    - On /admin, mark one rental as COMPLETED
#    - On the rentals table, click into one paid booking — that's where
#      you take screenshot #13
#
# 7. From any signed-out tab, submit one or two contact messages from
#    /contact for screenshot #14.
```

About 5–10 minutes for all activity. Once done, take screenshots in the
order above and the dashboards will have real numbers and bars.

---

## Embedding into the thesis

Once your PNGs are in this folder, you have two options:

**Option A — paste each screenshot into Word.** Each section in
`docs/REPORT.md` has an explicit screenshot reference; insert your PNG
under that reference and apply your university's figure-numbering style.

**Option B — keep this as the master sheet and reference it from your
thesis.** This README, with the images embedded, is itself a clean
"List of Figures" appendix — print it to PDF and attach.

If you need the explanations translated into Vietnamese, ask and I'll
translate this whole file in one pass.
