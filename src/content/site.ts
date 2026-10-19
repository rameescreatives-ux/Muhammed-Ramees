import type { I18nString, Person } from "./types";

/**
 * Company facts, contact details and corporate copy.
 *
 * SOURCE RULE: every fact below is lifted verbatim (or lightly re-set) from
 * unikai.com. Nothing here is invented. Where the existing site is silent —
 * certifications, factory capacity, verified export-market list — the field
 * is absent and surfaced in `contentGaps` rather than filled with plausible
 * text. See src/content/gaps.ts.
 */

export const LEGACY_ORIGIN = "https://www.unikai.com";

export const site = {
  name: "Unikai Foods PJSC",
  shortName: "Unikai",
  founded: 1977,
  domain: "unikai.com",
  url: "https://www.unikai.com",

  tagline: {
    en: "Come home to a household name",
    ar: "اسم تعرفه كل بيت",
  } satisfies I18nString,

  /** From the Who We Are page. */
  summary: {
    en: "Unikai Foods PJSC is among the largest and most diversified FMCG companies in the Middle East and North Africa, producing dairy, ice cream, juice and food products from its facilities in the UAE.",
    ar: "يونيكاي فودز ش.م.ع هي من أكبر وأكثر شركات السلع الاستهلاكية تنوعاً في الشرق الأوسط وشمال أفريقيا، وتنتج منتجات الألبان والآيس كريم والعصائر والأغذية من منشآتها في دولة الإمارات.",
  } satisfies I18nString,

  contact: {
    headOffice: {
      en: "P.O. Box 6424, Al Quoz Industrial Area, Dubai, UAE",
      ar: "ص.ب ٦٤٢٤، منطقة القوز الصناعية، دبي، الإمارات العربية المتحدة",
    } satisfies I18nString,
    toll: "800UNIKAI (864524)",
    tollHref: "tel:800864524",
    email: "info@unikai.com",
    careersEmail: "careers@unikai.com",
    investorEmail: "investor.relations@unikai.com",
    investorContact: {
      name: "Ahmed Bedier",
      role: { en: "Investor Relations Manager", ar: "مدير علاقات المستثمرين" },
      phone: "+971 4 507 6866",
      phoneHref: "tel:+97145076866",
    },
  },

  social: [
    { label: "LinkedIn", href: null, note: "NOT FOUND on existing site — request from Unikai" },
    { label: "Facebook", href: "https://www.facebook.com/unikaifoods/" },
    { label: "Instagram", href: "https://www.instagram.com/unikaifoods/" },
    { label: "YouTube", href: "https://www.youtube.com/channel/UC0xZPYZLTYGD-07nAnpq13w" },
    // Legacy site links to twitter.com/@Unikai_Foods — malformed and on the
    // retired domain. Corrected here.
    { label: "X", href: "https://x.com/Unikai_Foods" },
  ] as { label: string; href: string | null; note?: string }[],

  dfm: {
    ticker: "UNIKAI",
    profileUrl:
      "https://dfm.ae/issuers/listed-securities/securities/company-profile-page?id=UNIKAI",
  },
} as const;

/** Who We Are → About Us. Verbatim from the existing site. */
export const aboutCopy = {
  heading: { en: "Come home to a household name", ar: "اسم تعرفه كل بيت" },
  body: {
    en: [
      "We are Unikai Foods PJSC, among the largest and most diversified FMCG companies in the Middle East and North Africa (MENA). Back in 1977, when the country itself was taking baby steps, its need for quality pasteurized dairy products was felt. Thus was born Unikai, established and inaugurated by His Highness the then Ruler of Dubai, Sheikh Rashid bin Saeed Al Maktoum.",
      "In the last four decades, Brand Unikai has grown by leaps and bounds. Today we produce a wide range of dairy, ice cream, juice, and food products, reaching it to homes within the UAE as well as abroad. Ever since it was launched, Unikai has stood for superior quality — a consistent factor across our diversified product portfolio spread across juices, dairy, ice creams, and foods.",
      "It is the same quality that reaches your table wherever you are in the GCC and MENA. Our extensive distribution network all across the UAE and Oman has made it a favorite in homes in several countries in the region.",
      "And everywhere it goes, Unikai stands for the same: Excellence and value.",
    ],
    ar: [
      "نحن يونيكاي فودز ش.م.ع، من أكبر وأكثر شركات السلع الاستهلاكية تنوعاً في منطقة الشرق الأوسط وشمال أفريقيا. في عام ١٩٧٧، حين كانت الدولة تخطو خطواتها الأولى، برزت الحاجة إلى منتجات ألبان مبستَرة عالية الجودة. ومن هنا وُلدت يونيكاي، التي أسسها وافتتحها صاحب السمو حاكم دبي آنذاك، الشيخ راشد بن سعيد آل مكتوم.",
      "وعلى مدى العقود الأربعة الماضية، نمت علامة يونيكاي نمواً كبيراً. واليوم ننتج مجموعة واسعة من منتجات الألبان والآيس كريم والعصائر والأغذية، ونوصلها إلى المنازل داخل الإمارات وخارجها. ومنذ انطلاقها، ارتبطت يونيكاي بالجودة المتميزة عبر محفظة منتجاتها المتنوعة.",
      "إنها الجودة ذاتها التي تصل إلى مائدتك أينما كنت في دول مجلس التعاون والشرق الأوسط وشمال أفريقيا. وقد جعلتها شبكة التوزيع الواسعة في الإمارات وعُمان خياراً مفضلاً في منازل عدة دول في المنطقة.",
      "وأينما حلّت، تظل يونيكاي تعني الشيء نفسه: التميّز والقيمة.",
    ],
  },
};

export const mission = {
  en: "True to our heritage we are passionate about driving value for our consumers and stakeholders through convenient and innovative food & beverage lifestyle choices that nurture our community today and for generations to come.",
  ar: "وفاءً لإرثنا، نحن شغوفون بتقديم القيمة لمستهلكينا وشركائنا من خلال خيارات غذائية مبتكرة وعملية ترعى مجتمعنا اليوم وللأجيال القادمة.",
} satisfies I18nString;

export const vision = {
  en: "To be the leading food and beverage lifestyle brand, providing happiness to our consumers by linking past and future generations.",
  ar: "أن نكون العلامة الرائدة في الأغذية والمشروبات، نمنح السعادة لمستهلكينا بالربط بين أجيال الماضي والمستقبل.",
} satisfies I18nString;

export const values: { key: string; title: I18nString; body: I18nString }[] = [
  {
    key: "integrity",
    title: { en: "Integrity", ar: "النزاهة" },
    body: {
      en: "Act honestly and ethically without any compromise in the best interest of our stakeholders. Show loyalty and mutual respect on every level.",
      ar: "التصرف بأمانة وأخلاق دون أي تنازل، بما يحقق مصلحة شركائنا، مع الولاء والاحترام المتبادل على كل المستويات.",
    },
  },
  {
    key: "innovation",
    title: { en: "Innovation", ar: "الابتكار" },
    body: {
      en: "We are adapting our heritage for modern lifestyles by acknowledging and understanding our stakeholders' feedback — encouraging new ideas, continuous improvement and challenging the status quo.",
      ar: "نكيّف إرثنا مع أنماط الحياة الحديثة من خلال الإصغاء إلى ملاحظات شركائنا، وتشجيع الأفكار الجديدة والتحسين المستمر.",
    },
  },
  {
    key: "excellence",
    title: { en: "Excellence", ar: "التميّز" },
    body: {
      en: "Always strive to be the best in all our actions.",
      ar: "السعي دائماً لأن نكون الأفضل في كل ما نقوم به.",
    },
  },
  {
    key: "teamwork",
    title: { en: "Teamwork", ar: "العمل الجماعي" },
    body: {
      en: "Utilise individual skills and expertise in a collaborative way to achieve a common goal.",
      ar: "توظيف المهارات والخبرات الفردية بأسلوب تعاوني لتحقيق هدف مشترك.",
    },
  },
  {
    key: "commitment",
    title: { en: "Commitment", ar: "الالتزام" },
    body: {
      en: "Believing in what we do, taking full ownership of our actions and dedicating our efforts, time and energy to achieving the desired results.",
      ar: "الإيمان بما نقوم به، وتحمّل المسؤولية الكاملة عن أفعالنا، وتكريس جهودنا ووقتنا لتحقيق النتائج المرجوة.",
    },
  },
  {
    key: "happiness",
    title: { en: "Happiness", ar: "السعادة" },
    body: {
      en: "Passionate about the well-being of our stakeholders by providing a motivational environment with a positive and joyful experience.",
      ar: "الاهتمام بسعادة شركائنا عبر توفير بيئة محفزة وتجربة إيجابية ومبهجة.",
    },
  },
];

const L = `${LEGACY_ORIGIN}/wp-content/uploads/2016/01`;

export const board: Person[] = [
  { name: "Mr. Mana Mohamed Saeed Al Mulla", role: { en: "Chairman", ar: "رئيس مجلس الإدارة" }, image: `${L}/Mr.-Mana-Mohamed-Saeed-Al-Mulla-1.jpg` },
  { name: "Mr. Mish'al Mohamed Abdullah Moosa AlRaisi", role: { en: "Vice-Chairman", ar: "نائب رئيس مجلس الإدارة" }, image: `${L}/Mishal_1.jpg` },
  { name: "Mr. Adil Saleh Mohamed Al Ali", role: { en: "Director", ar: "عضو مجلس الإدارة" }, image: `${L}/Mr.-Adil-Al-Ali-1.jpg` },
  { name: "Mr. Ali Humaid Ali Abdalla AlOwais", role: { en: "Director", ar: "عضو مجلس الإدارة" }, image: `${L}/Image-for-website.jpg` },
  { name: "H.E. Haleema Humaid Ali AlOwais", role: { en: "Director", ar: "عضو مجلس الإدارة" }, image: `${L}/H-E-Haleema.jpg` },
  { name: "Mr. Hashem Saalem Eldash", role: { en: "Director", ar: "عضو مجلس الإدارة" }, image: `${L}/Hashim-Director.png` },
  { name: "Mr. Ahmed Saif Abdulrahman AlAshram", role: { en: "Director", ar: "عضو مجلس الإدارة" }, image: `${L}/Ahmed-Al-Ashram.jpeg` },
];

export const management: Person[] = [
  { name: "Mr. Neeraj Vohra", role: { en: "Chief Executive Officer", ar: "الرئيس التنفيذي" }, image: `${L}/CEOs-message-1.jpg` },
  { name: "Mr. Rahul Sharma", role: { en: "Chief Financial Officer", ar: "المدير المالي" }, image: `${LEGACY_ORIGIN}/wp-content/uploads/2021/08/rahul-new-pic.png` },
  { name: "Mr. Ahmed Bedier", role: { en: "Chief Services Officer", ar: "مدير الخدمات" }, image: `${L}/5.jpg` },
  { name: "Mr. Jano Ahmad", role: { en: "Director — Operations", ar: "مدير العمليات" }, image: `${L}/Jano_Unikai.png` },
  { name: "Mr. Krishna Kumar", role: { en: "Sales & Marketing Director", ar: "مدير المبيعات والتسويق" }, image: `${L}/Krishna-Photo-e1707391138755.jpg` },
  { name: "Mr. Rahim Khan", role: { en: "Export and Marketing Manager", ar: "مدير التصدير والتسويق" }, image: `${L}/Rahim_khan.jpg` },
  { name: "Mr. Franklin Isacc", role: { en: "General Manager — Oman", ar: "المدير العام — عُمان" }, image: `${L}/franklin.jpg` },
  { name: "Mr. Muhammad Akbar Khan", role: { en: "Compliance Manager", ar: "مدير الامتثال" }, image: `${L}/Akbar.jpg` },
  { name: "Ms. Samah Zaab", role: { en: "Board Secretary", ar: "أمين سر مجلس الإدارة" }, image: `${L}/samah_zaab1.jpg` },
];

/** CEO message — verbatim from the existing site. */
export const ceoMessage = {
  heading: { en: "Uniquely Unikai!", ar: "يونيكاي… بتميّز فريد" },
  author: "Neeraj Vohra",
  authorRole: { en: "Chief Executive Officer", ar: "الرئيس التنفيذي" },
  image: `${L}/CEOs-message-1.jpg`,
  body: {
    en: [
      "I consider it an absolute privilege to be heading the committed teams at one of the largest FMCG companies in the UAE. It is what makes us special. It also underlines the value of Brand Unikai — today if it's a household name in 29 countries in the region, it is thanks to our outstanding quality. Millions of customers trust Unikai, and their goodwill is our most valued treasure.",
      "The unique Unikai quality rolls out of our state-of-the-art facilities in UAE. It is here that, round the clock, our products are created to perfection. We pass them through quality assurance of the highest standards before they make their way into people's homes.",
      "Meanwhile, our thrust on innovation continues. We study markets carefully, meet customers and conduct in-depth research before coming up with new products. Likewise, our entry into new markets is backed by exhaustive market analysis and findings about customer needs on-ground.",
      "To get our entire range of products to you, we have added new distribution routes all across the region. And we are all set to enhance this network with around 200 new routes in the UAE and Oman.",
      "We are also focussing on strategic partnerships with market leading names that enjoy complementary strengths. This helps us to take major leaps in leadership in the marketplace.",
      "With each successive season, in each successive year, we strive to bring you newer and more innovative products. It is how we will continue to deliver the finest consumer experience. And that is our commitment.",
    ],
    ar: [],
  },
};

/** Careers copy — verbatim. The recruitment notice must be preserved exactly. */
export const careersCopy = {
  environment: {
    heading: { en: "Working Environment", ar: "بيئة العمل" },
    sub: { en: "Promoting an open, transparent culture", ar: "ثقافة منفتحة وشفافة" },
    body: {
      en: "At Unikai, we realize the importance of getting the best out of our people. Especially in a competitive sector like FMCG, individual initiative is as crucial as collective performance. We hire the finest talent. We invest in their skills and potential. And to help them achieve the pinnacle of success, we offer them a level playing field.",
      ar: "في يونيكاي ندرك أهمية إطلاق أفضل ما لدى موظفينا. ففي قطاع تنافسي كالسلع الاستهلاكية، لا تقل المبادرة الفردية أهمية عن الأداء الجماعي. نوظّف أفضل الكفاءات ونستثمر في مهاراتهم وإمكاناتهم.",
    },
    pillars: [
      {
        title: { en: "Openness", ar: "الانفتاح" },
        body: { en: "Fosters transparency and trust, leading to a free flow of ideas and perspectives.", ar: "يعزّز الشفافية والثقة، ويتيح تدفق الأفكار ووجهات النظر بحرية." },
      },
      {
        title: { en: "Equal opportunity", ar: "تكافؤ الفرص" },
        body: { en: "Ensures zero-discrimination through an unbiased provision of opportunities.", ar: "يضمن عدم التمييز من خلال إتاحة الفرص دون تحيّز." },
      },
      {
        title: { en: "Diversity", ar: "التنوّع" },
        body: { en: "Encourages an inclusive environment that leverages diverse talents and traditions.", ar: "يشجّع بيئة شاملة تستفيد من تنوّع المواهب والثقافات." },
      },
    ],
  },
  recruitmentNotice: {
    heading: { en: "Recruitment Notice", ar: "إشعار التوظيف" },
    body: {
      en: [
        "Unikai would like to inform that we have not appointed any person to act as our agent to recruit on our behalf, in any region.",
        "Unikai will never ask prospective employees for direct payment to process documents and arrange visas. Candidates should not send money at any time to a Unikai recruiter and should confirm all recruiter email addresses end in @Unikai.com.",
        "We are always interested in considering talented people for career opportunities with our organization.",
      ],
      ar: [
        "تود يونيكاي الإفادة بأننا لم نعيّن أي شخص للعمل كوكيل للتوظيف نيابة عنّا، في أي منطقة.",
        "لن تطلب يونيكاي أبداً من المرشحين دفع أي مبالغ مقابل إنجاز المستندات أو ترتيب التأشيرات. وعلى المرشحين عدم إرسال أي أموال لأي جهة توظيف، والتأكد من أن عناوين البريد الإلكتروني للموظفين تنتهي بـ @Unikai.com.",
        "يسعدنا دائماً النظر في طلبات أصحاب الكفاءات للانضمام إلى مؤسستنا.",
      ],
    },
  },
};
