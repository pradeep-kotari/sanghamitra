# Telugu translation — what Sreenivasa Garu needs to fill in

The site can now be shown in Telugu. The switch is the **తెలుగు** button in the
top menu on every page, and the choice is remembered on that device. A page can
also be opened straight into Telugu with `?lang=te` on the end of its address.

Nothing below has been machine translated. The dictionary file
`site/data/i18n.te.json` starts almost empty on purpose: every key with an empty
value keeps its English text, so Telugu mode reads as English-with-some-Telugu
rather than as blank space. Fill a value in and the site picks it up — no code
change is needed.

**Scope today:** the top menu and the main page. The other pages switch their
menu but keep their English body text until those strings are added.

**The footer is deliberately untouched** — Sreenivasa Garu asked for it to be
left exactly as it is, so it stays in English in both modes.

## Needs confirmation

`brand.mottoEn` is his own motto — *Vijnanamu, Vinodamu, Vikasamu* — written in
Telugu script as విజ్ఞానము, వినోదము, వికాసము. Please confirm the spelling
before this goes out.

## Strings

| Key | English on the page | Telugu |
|---|---|---|
| `brand.name` | Sanghamitra | **needed** |
| `brand.nameTe` | సంఘమిత్ర | సంఘమిత్ర |
| `brand.mottoEn` | Knowledge, Entertainment and Progress | విజ్ఞానము, వినోదము, వికాసము |
| `brand.mottoTe` | Vijnanamu, Vinodamu, Vikasamu | **needed** |
| `nav.about` | About | **needed** |
| `nav.learn` | Learn | **needed** |
| `nav.knowledge` | Knowledge | **needed** |
| `nav.give` | Give | **needed** |
| `nav.literature` | Literature | **needed** |
| `nav.workshops` | Workshops | **needed** |
| `nav.events` | Events | **needed** |
| `nav.contact` | Contact | **needed** |
| `nav.enroll` | Enroll | **needed** |
| `home.h1` | Math, Telugu, and sittings from home. | **needed** |
| `home.whoLine` | Sanghamitra is a not for profit organization led by Sreenivasa Ainapurapu founded in 2003 based on Values, Love, Sharing and Caring. Education for Progress. | **needed** |
| `home.platformLine` | Platform to Learn, share and progress. | **needed** |
| `home.lede` | Enroll a student in Vedic math, SAT or ACT coaching, or Telugu. Join a public sitting on Zoom. Donate, volunteer, or invite a talk — then write or WhatsApp him. He replies. | **needed** |
| `home.yearsLine` | Named Sanghamitra in 2003 · first public Medhavadhanam in 2007 | **needed** |
| `work.kicker` | What we do | **needed** |
| `work.h2` | Six kinds of work, one organization. | **needed** |
| `work.lede` | Pick the door that matches why you came. | **needed** |
| `work.math.h` | Math Tutoring | **needed** |
| `work.math.p` | Arithmetic, Algebra, Geometry, Trigonometry and more. | **needed** |
| `work.knowledge.h` | Knowledge Sharing | **needed** |
| `work.knowledge.p` | Sittings on YouTube, Facebook and WhatsApp. | **needed** |
| `work.vedic.h` | Vedic Mathematics | **needed** |
| `work.vedic.p` | Summer program for ages 9 and above. | **needed** |
| `work.service.h` | Community Service | **needed** |
| `work.service.p` | Donations for food, books and clothing. Teaching Telugu. Presentations. | **needed** |
| `work.literature.h` | Works of Literature | **needed** |
| `work.literature.p` | Friend messages, poetry and articles. | **needed** |
| `work.workshops.h` | Workshops | **needed** |
| `work.workshops.p` | Meditation, anger and stress management. | **needed** |
| `work.more` | Also here: | **needed** |
| `work.more.telugu` | Telugu classes | **needed** |
| `work.more.arts` | Harikatha and the older arts | **needed** |
| `work.more.magazine` | The magazine, 2003 to 2011 | **needed** |
| `work.more.about` | What each one means | **needed** |
| `ui.langNote` | Telugu is being added page by page. Anything not yet translated is shown in English. | **needed** |
