import { createClient } from "next-sanity";
import { config } from "dotenv";

config({ path: ".env" });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_EDIT_TOKEN,
  useCdn: false,
});

// ── IDs ──────────────────────────────────────────────────────────────────────
const IDS = {
  settings: "siteSettings",
  // categories
  catRose: "cat-rose",
  catChandan: "cat-chandan",
  catMango: "cat-mango",
  catIndoor: "cat-indoor",
  catSucculent: "cat-succulent",
  // collections
  colAirPurifying: "col-air-purifying",
  colPetSafe: "col-pet-safe",
  colLowMaintenance: "col-low-maintenance",
  // plants
  pRedRose: "plant-red-rose",
  pPinkRose: "plant-pink-rose",
  pWhiteChandan: "plant-white-chandan",
  pRedChandan: "plant-red-chandan",
  pKesarMango: "plant-kesar-mango",
  pMiyazakiMango: "plant-miyazaki-mango",
  pSnakePlant: "plant-snake-plant",
  pMoneePlant: "plant-money-plant",
  pAloeVera: "plant-aloe-vera",
  pJadePlant: "plant-jade-plant",
};

const ref = (id) => ({ _type: "reference", _ref: id });

// ── Documents ─────────────────────────────────────────────────────────────────
const documents = [
  // ── Site Settings ──────────────────────────────────────────────────────────
  {
    _id: IDS.settings,
    _type: "siteSettings",
    name: {
      en: "Greenskill Landscape",
      hi: "ग्रीनस्किल लैंडस्केप",
      gu: "ગ્રીનસ્કિલ લેન્ડસ્કેપ",
    },
    tagline: {
      en: "Quality Plants for Every Home",
      hi: "हर घर के लिए गुणवत्तापूर्ण पौधे",
      gu: "દરેક ઘર માટે ગુણવત્તાસભર છોડ",
    },
    description: {
      en: "Greenskill Landscape is your trusted local nursery, offering a curated selection of indoor, outdoor and flowering plants. We bring nature closer to your home.",
      hi: "ग्रीनस्किल लैंडस्केप आपकी विश्वसनीय स्थानीय नर्सरी है, जो इनडोर, आउटडोर और फूल वाले पौधों का चयन प्रदान करती है।",
      gu: "ગ્રીનસ્કિલ લેન્ડસ્કેપ એ તમારી વિશ્વસનીય સ્થાનિક નર્સરી છે, જે ઇનડોર, આઉટડોર અને ફૂલ છોડ ઓફર કરે છે.",
    },
    phone: "9876543210",
    whatsapp: "9876543210",
    email: "hello@greenskilllandscape.in",
    currency: "INR",
    openingHours: [
      { _key: "oh1", days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "09:00", closes: "18:00" },
      { _key: "oh2", days: ["Saturday", "Sunday"], opens: "10:00", closes: "17:00" },
    ],
  },

  // ── Categories ─────────────────────────────────────────────────────────────
  {
    _id: IDS.catRose,
    _type: "category",
    title: { en: "Rose", hi: "गुलाब", gu: "ગુલાબ" },
    slug: { _type: "slug", current: "rose" },
    description: {
      en: "A timeless symbol of love and beauty. Our rose collection includes red, pink, yellow and white varieties suited to Indian gardens.",
      hi: "प्रेम और सुंदरता का प्रतीक। हमारे गुलाब संग्रह में लाल, गुलाबी, पीले और सफेद किस्में हैं।",
      gu: "પ્રેમ અને સૌંદર્યનું પ્રતીક. અમારી ગુલાબ collection માં લાલ, ગુલાબી, પીળી અને સફેદ જાતો છે.",
    },
  },
  {
    _id: IDS.catChandan,
    _type: "category",
    title: { en: "Chandan (Sandalwood)", hi: "चंदन", gu: "ચંદન" },
    slug: { _type: "slug", current: "chandan" },
    description: {
      en: "Sacred and aromatic sandalwood plants prized for their fragrant heartwood, used in rituals and Ayurveda.",
      hi: "पवित्र और सुगंधित चंदन के पौधे, अनुष्ठानों और आयुर्वेद में उपयोग किए जाते हैं।",
      gu: "પવિત્ર અને સુગંધિત ચંદન છોડ, પૂજા અને આયુર્વેદ માટે.",
    },
  },
  {
    _id: IDS.catMango,
    _type: "category",
    title: { en: "Mango", hi: "आम", gu: "કેરી" },
    slug: { _type: "slug", current: "mango" },
    description: {
      en: "India's favourite fruit tree. From the prized Kesar to the rare Miyazaki — grow your own mango at home.",
      hi: "भारत का पसंदीदा फल वृक्ष। केसर से मियाज़ाकी तक — अपना आम खुद उगाएं।",
      gu: "ભારતનું પ્રિય ફળ વૃક્ષ. કેસર થી મિયાઝાકી — ઘરે તમારી પોતાની કેરી ઉગાડો.",
    },
  },
  {
    _id: IDS.catIndoor,
    _type: "category",
    title: { en: "Indoor Plants", hi: "इनडोर पौधे", gu: "ઇન્ડોર છોડ" },
    slug: { _type: "slug", current: "indoor-plants" },
    description: {
      en: "Low-maintenance beauties that thrive inside homes and offices. Perfect air purifiers and mood boosters.",
      hi: "कम देखभाल वाले पौधे जो घरों और कार्यालयों में पनपते हैं। बेहतरीन वायु शोधक।",
      gu: "ઓછી સંભાળ, ઘરો અને ઓફિસોમાં ખૂબ સારા. હવા શુદ્ધ કરે છે.",
    },
  },
  {
    _id: IDS.catSucculent,
    _type: "category",
    title: { en: "Succulents & Cacti", hi: "सक्युलेंट और कैक्टस", gu: "સક્યુલન્ટ અને કૅક્ટસ" },
    slug: { _type: "slug", current: "succulents-cacti" },
    description: {
      en: "Hardy, drought-tolerant plants that need almost no attention. Great for beginners and busy plant parents.",
      hi: "कठोर, सूखा-सहिष्णु पौधे जिन्हें लगभग कोई ध्यान नहीं चाहिए।",
      gu: "કઠોર, દુકાળ-સહિષ્ણુ છોડ. નવા gardeners માટે આદર્શ.",
    },
  },

  // ── Collections ────────────────────────────────────────────────────────────
  {
    _id: IDS.colAirPurifying,
    _type: "collection",
    title: { en: "Air Purifying", hi: "वायु शोधक", gu: "હવા શુદ્ધ કરતા" },
    slug: { _type: "slug", current: "air-purifying" },
    description: {
      en: "Plants proven to filter indoor air pollutants and increase oxygen levels.",
      hi: "ऐसे पौधे जो घर के अंदर की हवा को साफ करते हैं।",
      gu: "ઘરની હવા શુદ્ધ કરતા છોડ.",
    },
  },
  {
    _id: IDS.colPetSafe,
    _type: "collection",
    title: { en: "Pet Safe", hi: "पालतू जानवरों के लिए सुरक्षित", gu: "પ્રાણીઓ માટે સુરક્ષિત" },
    slug: { _type: "slug", current: "pet-safe" },
    description: {
      en: "Non-toxic to cats and dogs. Let your pets and plants coexist safely.",
      hi: "बिल्लियों और कुत्तों के लिए गैर-जहरीले पौधे।",
      gu: "બિલાડીઓ અને કૂતરા માટે બિન-ઝેરી છોડ.",
    },
  },
  {
    _id: IDS.colLowMaintenance,
    _type: "collection",
    title: { en: "Low Maintenance", hi: "कम देखभाल", gu: "ઓછી સંભાળ" },
    slug: { _type: "slug", current: "low-maintenance" },
    description: {
      en: "Perfect for busy people — water once a week or less and they still thrive.",
      hi: "व्यस्त लोगों के लिए आदर्श — हफ्ते में एक बार पानी दें।",
      gu: "વ્યસ્ત લોકો માટે — અઠવાડિયામાં એકવાર પાણી.",
    },
  },

  // ── Plants ─────────────────────────────────────────────────────────────────
  {
    _id: IDS.pRedRose,
    _type: "plant",
    name: { en: "Red Rose", hi: "लाल गुलाब", gu: "લાલ ગુલાબ" },
    slug: { _type: "slug", current: "red-rose" },
    scientificName: "Rosa × hybrida",
    description: {
      en: "Classic deep-red blooms perfect for Indian gardens. Flowers year-round with adequate water and sunlight.",
      hi: "क्लासिक गहरे लाल फूल भारतीय बगीचों के लिए आदर्श। पर्याप्त पानी और धूप के साथ साल भर खिलते हैं।",
      gu: "ક્લાસિક ઘેરા-લાલ ફૂલ ભારતીય બગીચા માટે આદર્શ.",
    },
    category: ref(IDS.catRose),
    featured: true,
    availability: "in_stock",
    sunlight: "full_sun",
    watering: "medium",
    growthRate: "medium",
    size: "8–10 inch pot",
    floweringSeason: "October–March",
    tags: ["flowering", "fragrant", "garden"],
  },
  {
    _id: IDS.pPinkRose,
    _type: "plant",
    name: { en: "Pink Rose", hi: "गुलाबी गुलाब", gu: "ગુલાબી ગુલાબ" },
    slug: { _type: "slug", current: "pink-rose" },
    scientificName: "Rosa × hybrida",
    description: {
      en: "Soft pink blooms with a sweet fragrance. A favourite for gifting and home gardens alike.",
      hi: "मीठी सुगंध के साथ नरम गुलाबी फूल। उपहार और घर के बगीचे दोनों के लिए पसंदीदा।",
      gu: "નાજુક ગુલાબી ફૂલ. ભેટ અને ઘરના બગીચા બંને માટે.",
    },
    category: ref(IDS.catRose),
    featured: false,
    availability: "in_stock",
    sunlight: "full_sun",
    watering: "medium",
    growthRate: "medium",
    size: "8–10 inch pot",
    floweringSeason: "October–March",
    tags: ["flowering", "fragrant", "gifting"],
  },
  {
    _id: IDS.pWhiteChandan,
    _type: "plant",
    name: { en: "White Sandalwood", hi: "सफेद चंदन", gu: "સફેદ ચંદન" },
    slug: { _type: "slug", current: "white-sandalwood" },
    scientificName: "Santalum album",
    description: {
      en: "The sacred white sandalwood of India. Slow-growing but prized for its aromatic wood used in temples and Ayurvedic medicine.",
      hi: "भारत का पवित्र सफेद चंदन। धीमी गति से बढ़ने वाला लेकिन मंदिरों और आयुर्वेद में उपयोगी।",
      gu: "ભારતનું પવિત્ર સફેદ ચંદન. ધીમો વિકાસ, પૂજા અને આયુર્વેદ માટે.",
    },
    category: ref(IDS.catChandan),
    featured: true,
    availability: "limited",
    sunlight: "full_sun",
    watering: "low",
    growthRate: "slow",
    size: "6–8 inch pot",
    tags: ["sacred", "aromatic", "rare"],
  },
  {
    _id: IDS.pRedChandan,
    _type: "plant",
    name: { en: "Red Sandalwood", hi: "लाल चंदन", gu: "લાલ ચંદન" },
    slug: { _type: "slug", current: "red-sandalwood" },
    scientificName: "Pterocarpus santalinus",
    description: {
      en: "Rare red sandalwood, native to the Eastern Ghats. Highly valued in religious ceremonies and traditional medicine.",
      hi: "दुर्लभ लाल चंदन, पूर्वी घाट का मूल निवासी। धार्मिक अनुष्ठानों में अत्यधिक मूल्यवान।",
      gu: "દુર્લભ લાલ ચંદન, ધાર્મિક વિધિઓ અને પ્રાકૃતિક ઉપચારમાં ઉચ્ચ મૂલ્ય.",
    },
    category: ref(IDS.catChandan),
    featured: false,
    availability: "limited",
    sunlight: "full_sun",
    watering: "low",
    growthRate: "slow",
    size: "6 inch pot",
    tags: ["sacred", "rare", "medicinal"],
  },
  {
    _id: IDS.pKesarMango,
    _type: "plant",
    name: { en: "Kesar Mango", hi: "केसर आम", gu: "કેસર કેરી" },
    slug: { _type: "slug", current: "kesar-mango" },
    scientificName: "Mangifera indica 'Kesar'",
    description: {
      en: "The GI-tagged queen of mangoes from Gujarat. Known for its saffron-like colour, rich aroma and sweet taste.",
      hi: "गुजरात की GI-टैगेड आमों की रानी। अपने केसर रंग, समृद्ध सुगंध और मीठे स्वाद के लिए जानी जाती है।",
      gu: "ગુજરાતની GI-ટૅગ્ડ 'કેસર' કેરી. સોનેરી રંગ, સુગંધ અને ગળ્યો સ્વાદ.",
    },
    category: ref(IDS.catMango),
    featured: true,
    availability: "in_stock",
    sunlight: "full_sun",
    watering: "medium",
    growthRate: "medium",
    size: "10–12 inch pot (grafted)",
    floweringSeason: "February–March",
    tags: ["fruit", "grafted", "Gujarat"],
  },
  {
    _id: IDS.pMiyazakiMango,
    _type: "plant",
    name: { en: "Miyazaki Mango", hi: "मियाज़ाकी आम", gu: "મિયાઝાકી કેરી" },
    slug: { _type: "slug", current: "miyazaki-mango" },
    scientificName: "Mangifera indica 'Miyazaki'",
    description: {
      en: "The world's most expensive mango, originally from Japan. Deep red skin with sweet, fibre-free flesh. A rare collector's variety.",
      hi: "दुनिया का सबसे महंगा आम, मूलतः जापान से। गहरी लाल त्वचा, मीठा और रेशे-रहित गूदा।",
      gu: "વિશ્વની સૌથી મોંઘી કેરી, જાપાનથી. ઘેરી લાલ ત્વચા, ગળ્યો, ફાઈબર-ફ્રી ગળો.",
    },
    category: ref(IDS.catMango),
    featured: true,
    availability: "limited",
    sunlight: "full_sun",
    watering: "medium",
    growthRate: "medium",
    size: "12 inch pot (grafted)",
    floweringSeason: "February–March",
    tags: ["fruit", "rare", "premium", "grafted"],
  },
  {
    _id: IDS.pSnakePlant,
    _type: "plant",
    name: { en: "Snake Plant", hi: "स्नेक प्लांट", gu: "સ્નેક પ્લાન્ટ" },
    slug: { _type: "slug", current: "snake-plant" },
    scientificName: "Dracaena trifasciata",
    description: {
      en: "One of the best air-purifying plants. Almost indestructible — survives low light and infrequent watering. Perfect for any room.",
      hi: "सर्वोत्तम वायु-शोधक पौधों में से एक। लगभग अविनाशी — कम रोशनी और कम पानी में जीवित रहता है।",
      gu: "શ્રેષ્ઠ હવા-શુદ્ધ કરતા છોડ. ઓછો પ્રકાશ, ઓછું પાણી — ટકાઉ.",
    },
    category: ref(IDS.catIndoor),
    collections: [ref(IDS.colAirPurifying), ref(IDS.colLowMaintenance)],
    featured: true,
    availability: "in_stock",
    sunlight: "shade",
    watering: "low",
    growthRate: "slow",
    size: "6 inch pot",
    tags: ["air-purifying", "low-maintenance", "beginner"],
  },
  {
    _id: IDS.pMoneePlant,
    _type: "plant",
    name: { en: "Money Plant", hi: "मनी प्लांट", gu: "મની પ્લાન્ટ" },
    slug: { _type: "slug", current: "money-plant" },
    scientificName: "Epipremnum aureum",
    description: {
      en: "A beloved trailing vine believed to bring good luck and prosperity. Thrives in water or soil, indoors or out.",
      hi: "सौभाग्य और समृद्धि लाने वाला माना जाने वाला लोकप्रिय पौधा। पानी या मिट्टी में पनपता है।",
      gu: "સૌભાગ્ય અને સમૃદ્ધિ આણનાર. પાણી કે માટી — ગમે ત્યાં ઉગે.",
    },
    category: ref(IDS.catIndoor),
    collections: [ref(IDS.colAirPurifying), ref(IDS.colLowMaintenance)],
    featured: false,
    availability: "in_stock",
    sunlight: "bright_indirect",
    watering: "medium",
    growthRate: "fast",
    size: "4 inch pot",
    tags: ["trailing", "air-purifying", "beginner", "lucky"],
  },
  {
    _id: IDS.pAloeVera,
    _type: "plant",
    name: { en: "Aloe Vera", hi: "एलोवेरा", gu: "એલોવેરા" },
    slug: { _type: "slug", current: "aloe-vera" },
    scientificName: "Aloe barbadensis miller",
    description: {
      en: "The ultimate medicinal houseplant. Soothing gel for skin and hair, easy to grow in any sunny spot.",
      hi: "अंतिम औषधीय घरेलू पौधा। त्वचा और बालों के लिए सुखदायक जेल, किसी भी धूप वाली जगह में आसानी से उगाएं।",
      gu: "ઔષધીય ઘરેલું છોડ. ત્વચા અને વાળ માટે gel, ધૂપ હોય ત્યાં ઉગાડો.",
    },
    category: ref(IDS.catSucculent),
    collections: [ref(IDS.colLowMaintenance), ref(IDS.colPetSafe)],
    featured: false,
    availability: "in_stock",
    sunlight: "full_sun",
    watering: "low",
    growthRate: "slow",
    size: "6 inch pot",
    tags: ["medicinal", "succulent", "beginner"],
  },
  {
    _id: IDS.pJadePlant,
    _type: "plant",
    name: { en: "Jade Plant", hi: "जेड प्लांट", gu: "જેડ પ્લાન્ટ" },
    slug: { _type: "slug", current: "jade-plant" },
    scientificName: "Crassula ovata",
    description: {
      en: "A long-lived succulent often called the 'money tree'. Oval jade-green leaves on woody stems. Thrives on neglect.",
      hi: "'मनी ट्री' के नाम से जाना जाने वाला लंबे समय तक जीवित रहने वाला सक्युलेंट।",
      gu: "'Money Tree' — લાંબા આયુ, ઓછી સંભાળ. ઓવ jade-green પાન.",
    },
    category: ref(IDS.catSucculent),
    collections: [ref(IDS.colLowMaintenance)],
    featured: false,
    availability: "in_stock",
    sunlight: "bright_indirect",
    watering: "low",
    growthRate: "slow",
    size: "4–6 inch pot",
    tags: ["succulent", "low-maintenance", "lucky"],
  },
];

// ── Run ───────────────────────────────────────────────────────────────────────
async function seed() {
  console.log(`Seeding ${documents.length} documents to project ${client.config().projectId}…\n`);

  const transaction = client.transaction();
  for (const doc of documents) {
    transaction.createOrReplace(doc);
  }

  try {
    const result = await transaction.commit();
    console.log(`✓ Done — ${result.results.length} documents written.\n`);
    console.log("Documents created:");
    result.results.forEach((r) => console.log(`  ${r.id}`));
  } catch (err) {
    console.error("✗ Seed failed:", err.message);
    process.exit(1);
  }
}

seed();
