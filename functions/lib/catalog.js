export const DECISION_CATALOG = [
  {
    section: 1,
    title: "Whose website is this?",
    why: "This decides the homepage. One door, not eight.",
    fields: [
      {
        id: "site_type",
        title: "The site is mainly",
        type: "radio",
        options: [
          { value: "org-face", label: "Sanghamitra the organization. I am the face.", suggested: true },
          { value: "personal", label: "My personal site. Sanghamitra is one chapter." },
          { value: "both", label: "Split: half me, half the organization." },
        ],
      },
    ],
  },
  {
    section: 2,
    title: "Who should the homepage talk to first?",
    why: "Others can still come. The first screen can only greet one person well.",
    fields: [
      {
        id: "visitor",
        title: "Main visitor",
        type: "radio",
        options: [
          { value: "watch-join", label: "Families and friends who want to watch a program or join a class", suggested: true },
          { value: "parents-math", label: "Parents looking for math / SAT / Telugu for children" },
          { value: "katha", label: "People who want Harikatha, Burrakatha, or Sundara Kanda" },
          { value: "donate", label: "People who want to give or volunteer" },
          { value: "talk", label: "People who want me to give a talk" },
        ],
      },
      {
        id: "cta",
        title: "When they arrive, the main button should say",
        type: "radio",
        options: [
          { value: "contact", label: "Contact / join a program", suggested: true },
          { value: "watch", label: "Watch videos" },
          { value: "donate", label: "Donate" },
          { value: "talk", label: "Invite a talk" },
        ],
      },
    ],
  },
  {
    section: 3,
    title: "Names, exactly as they should appear",
    why: "",
    fields: [
      {
        id: "person_name",
        title: "Your name on the site",
        type: "radio",
        options: [
          { value: "Sreenivasa Ainapurapu", label: "Sreenivasa Ainapurapu", suggested: true },
          { value: "Sreenivas Ainapurapu", label: "Sreenivas Ainapurapu" },
          { value: "Srinivasa Ainapurapu", label: "Srinivasa Ainapurapu" },
          { value: "other", label: "Other (write it in the next field)" },
        ],
      },
      { id: "person_name_other", title: "Other personal name", type: "text" },
      {
        id: "org_name",
        title: "Organization name",
        type: "radio",
        options: [
          { value: "Sanghamitra", label: "Sanghamitra, with Telugu సంఘమిత్ర", suggested: true },
          { value: "Sanghamitra Organization", label: "Sanghamitra Organization" },
          { value: "other", label: "Other (write it in the next field)" },
        ],
      },
      { id: "org_name_other", title: "Other organization name", type: "text" },
      { id: "org_meaning", title: "Meaning under the name (one line)", type: "text" },
      { id: "math_club", title: "Math club name", type: "text" },
    ],
  },
  {
    section: 4,
    title: "How should the years read?",
    why: "Email said 25 years. YouTube said 2003. The 2014 talk said named in 2004.",
    fields: [
      {
        id: "years",
        title: "Homepage line",
        type: "radio",
        options: [
          { value: "named-2004-older-service", label: "Named Sanghamitra in 2004, after earlier service in India and the US", suggested: true },
          { value: "since-2004", label: "Since 2004" },
          { value: "since-2003", label: "Since 2003" },
          { value: "25-years", label: "25 years of service" },
        ],
      },
    ],
  },
  {
    section: 5,
    title: "What belongs on the homepage?",
    why: "The four doors he asked for, plus anything else on the first screen.",
    fields: [
      {
        id: "home_doors",
        title: "Four main doors",
        type: "checkbox",
        options: [
          { value: "harikatha", label: "Harikatha", suggested: true },
          { value: "burrakatha", label: "Burrakatha", suggested: true },
          { value: "medhavadhanam", label: "Medhavadhanam (mental math showcase)", suggested: true },
          { value: "sundara-kanda", label: "Sundara Kanda", suggested: true },
        ],
      },
      {
        id: "home_extra",
        title: "Also on the first screen?",
        type: "checkbox",
        options: [
          { value: "sharing-caring", label: "A short line on sharing and caring", suggested: true },
          { value: "math-club", label: "Math club / tutoring / SAT as its own door" },
          { value: "telugu", label: "Telugu / SiliconAndhra Manabadi as its own door" },
          { value: "poetry", label: "Poetry / Satakam as its own door" },
          { value: "meditation", label: "Meditation / stress talks as its own door" },
        ],
      },
      {
        id: "sundara_kind",
        title: "Sundara Kanda on this site is mainly",
        type: "select",
        options: [
          { value: "discourse", label: "Discourse / pravachanam" },
          { value: "recitation", label: "Recitation / parayanam" },
          { value: "series", label: "A video series already on YouTube" },
          { value: "mixed", label: "All of the above" },
        ],
      },
    ],
  },
  {
    section: 6,
    title: "What is live this year?",
    why: "Helps us say “we do this” versus “we have done this.”",
    fields: [
      {
        id: "live",
        title: "Programs that still happen",
        type: "checkbox",
        options: [
          { value: "sharing", label: "Sharing and caring" },
          { value: "math", label: "Math club / Medhavadhanam" },
          { value: "harikatha", label: "Harikatha" },
          { value: "burrakatha", label: "Burrakatha" },
          { value: "sundara", label: "Sundara Kanda / Ramayana" },
          { value: "telugu", label: "Telugu teaching" },
          { value: "poetry", label: "Poetry / Satakam" },
          { value: "talks", label: "Meditation / anger / stress talks" },
          { value: "arts", label: "Other ancient art forms" },
          { value: "magazine", label: "Magazine (restarting)" },
        ],
      },
      {
        id: "manabadi",
        title: "SiliconAndhra Manabadi",
        type: "radio",
        options: [
          { value: "name-only", label: "Mention Telugu teaching. Do not use their logo until they say yes.", suggested: true },
          { value: "official", label: "I am an official teacher/center. You may use the name and logo." },
          { value: "omit", label: "Leave Telugu off the first version." },
        ],
      },
    ],
  },
  {
    section: 7,
    title: "Place, language, money",
    why: "",
    fields: [
      {
        id: "place",
        title: "Where do you serve?",
        type: "radio",
        options: [
          { value: "stl-plus", label: "St. Louis, and other places when invited", suggested: true },
          { value: "stl", label: "St. Louis only" },
          { value: "us-india", label: "US and India" },
        ],
      },
      {
        id: "temple",
        title: "May we name the Hindu Temple of Saint Louis as the usual venue?",
        type: "radio",
        options: [
          { value: "yes", label: "Yes", suggested: true },
          { value: "no", label: "No — say only “St. Louis”" },
        ],
      },
      {
        id: "language",
        title: "Language of the first site",
        type: "radio",
        options: [
          { value: "en-telugu-headings", label: "English, with Telugu titles", suggested: true },
          { value: "en", label: "English only" },
          { value: "bilingual", label: "Full English and Telugu pages" },
        ],
      },
      {
        id: "money",
        title: "Money on the site",
        type: "radio",
        options: [
          { value: "no-donate", label: "No donate button. People can write to you.", suggested: true },
          { value: "soft", label: "A “support the work” note, no payment button" },
          { value: "donate", label: "I want a donate button" },
        ],
      },
      { id: "donate_how", title: "If donate: how should people give?", type: "text" },
    ],
  },
  {
    section: 8,
    title: "Contact and videos",
    why: "",
    fields: [
      { id: "public_email", title: "Public email", type: "text" },
      { id: "public_phone", title: "Phone or WhatsApp", type: "text" },
      { id: "youtube", title: "YouTube", type: "text" },
      { id: "social", title: "Facebook or other links", type: "textarea" },
      {
        id: "videos",
        title: "Videos on the website",
        type: "radio",
        options: [
          { value: "embed", label: "Embed a few YouTube programs on the pages", suggested: true },
          { value: "link", label: "Only a link to the channel" },
        ],
      },
      {
        id: "burra_video",
        title: "Do you have a Burrakatha recording we may use?",
        type: "select",
        options: [
          { value: "later", label: "Not yet — leave a “coming” note" },
          { value: "youtube", label: "Yes, I will send a YouTube link" },
          { value: "file", label: "Yes, I will send a file" },
        ],
      },
    ],
  },
  {
    section: 9,
    title: "Photos, stories, magazine",
    why: "",
    fields: [
      {
        id: "kids_photos",
        title: "Photos of children",
        type: "radio",
        options: [
          { value: "no-faces", label: "Do not show children’s faces unless I send a photo and say the parent agreed", suggested: true },
          { value: "group-ok", label: "Group photos from events are fine" },
          { value: "none", label: "No photos of children at all" },
        ],
      },
      {
        id: "testimonials",
        title: "Parent stories from the 2014 and 2017 programs (no last names)",
        type: "radio",
        options: [
          { value: "ask-first", label: "Ask me before any story goes live", suggested: true },
          { value: "ok-anonymous", label: "Anonymous is fine (“a parent said…”)" },
          { value: "omit", label: "Leave testimonials off v1" },
        ],
      },
      {
        id: "magazine",
        title: "The old quarterly magazine (ended July 2011)",
        type: "radio",
        options: [
          { value: "history", label: "One history paragraph. No fake archive.", suggested: true },
          { value: "omit", label: "Do not mention it" },
          { value: "pdfs", label: "I still have PDFs — we can add an archive later" },
        ],
      },
      { id: "satakam_title", title: "Satakam published last year — title", type: "text" },
      {
        id: "satakam_verses",
        title: "May we show a few verses?",
        type: "select",
        options: [
          { value: "later", label: "Later — not on the first site" },
          { value: "yes", label: "Yes, I will send verses" },
          { value: "link", label: "Only a buy / download link" },
        ],
      },
    ],
  },
  {
    section: 10,
    title: "After the site is live",
    why: "",
    fields: [
      {
        id: "maintain",
        title: "Who changes text and photos later?",
        type: "radio",
        options: [
          { value: "pradeep-then-hand-off", label: "Pradeep ships v1. Then we keep it simple so I rarely need to change it.", suggested: true },
          { value: "pradeep", label: "Pradeep will keep updating it" },
          { value: "sreenivas", label: "I will learn to change pages" },
        ],
      },
      { id: "notes", title: "Anything else we must get right", type: "textarea" },
    ],
  },
];

export function flattenDecisions() {
  const rows = [];
  let sort = 0;
  for (const sec of DECISION_CATALOG) {
    for (const field of sec.fields) {
      sort += 1;
      rows.push({
        id: field.id,
        section: sec.section,
        section_title: sec.title,
        title: field.title,
        why: field.why || sec.why || "",
        field_type: field.type,
        options_json: JSON.stringify(field.options || []),
        sort_order: sort,
      });
    }
  }
  return rows;
}
