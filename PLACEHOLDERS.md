# Still needed from Ines

Search the site for `[` to find every bracketed placeholder in the copy.

## Copy
- About: her story (2-3 short paragraphs), the parrot's name.
- Collection: real fragrance names, descriptions and notes. The four on the page
  (Velours, Iris au Vent, Bamboo Garden, Rose de Nuit) are working names built from
  the brief's rose / iris / bamboo / velvet themes.
- Bottle size and price for each.
- Hero line ("Perfume for slow evenings...") is a draft.

## Contact details
- Email (placeholder: hello@finessebyines.com, also in the JSON-LD and mailto link)
- Instagram handle (placeholder: @finessebyines)
- Studio city/state, or remove that row
- Domain (placeholder: finessebyines.com in canonical, og tags, sitemap, robots)

## Media
- assets/video/hero-velvet.mp4 and assets/video/about-iris.mp4 (see assets/video/README.md)
- One product photo per bottle, ideally on a dark or transparent background, to replace
  the gold bottle outlines in the arches
- Logo as a vector (SVG/AI/PDF). The current one was traced off the business card mockup
  and is fine for a mock, but a clean file will be sharper.
- Name of the logo's script font, so headers can match it exactly (Allura is a stand-in)

## Wiring
- Get Updates form: connect a mailing list (Mailchimp, Kit, Klaviyo...)
- Contact form: connect a handler (Formspree or a Cloudflare Worker)
- Both forms currently just show a confirmation message without sending anything.

## Concept B (concept-b/)
Same copy placeholders as above. Its footage slots, all optional (the rendered velvet
and silhouettes stand in until a file exists):
- assets/video/hero-velvet.mp4  (shared with concept A)
- assets/video/about-rose.mp4   (rose opening, tall crop)
- assets/video/velours.mp4, iris.mp4, bamboo.mp4, rose.mp4  (one scene per fragrance)
Concept B is marked noindex so search engines only see one version.
