import { createClient } from "next-sanity";
import { randomUUID } from "node:crypto";
import { config } from "dotenv";

config({ path: ".env" });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_EDIT_TOKEN,
  useCdn: false,
});

const key = () => randomUUID().slice(0, 8);

/**
 * Build a bag-size pricing entry.
 * tiers: array of [minQty, maxQty|null, price] tuples.
 * Pass null for maxQty on the last tier to mean "and above".
 */
function bagSize(size, tiers) {
  return {
    _key: key(),
    size,
    tiers: tiers.map(([minQty, maxQty, price]) => ({
      _key: key(),
      minQty,
      ...(maxQty != null ? { maxQty } : {}),
      price,
    })),
  };
}

function variety({ name, availability = "in_stock", sunlight, watering, growthRate, sizeRange, bagSizes, maxHeight, bloomSeason } = {}) {
  return {
    _key: key(),
    _type: "variety",
    ...(name ? { name } : {}),
    availability,
    ...(sunlight ? { sunlight } : {}),
    ...(watering ? { watering } : {}),
    ...(growthRate ? { growthRate } : {}),
    ...(sizeRange ? { sizeRange } : {}),
    ...(bagSizes ? { bagSizes } : {}),
    ...(maxHeight ? { maxHeight } : {}),
    ...(bloomSeason ? { bloomSeason } : {}),
  };
}

const documents = [
  // ── Site Settings ──────────────────────────────────────────────────────────
  {
    _id: "siteSettings",
    _type: "siteSettings",
    name: { en: "Greenskill Landscape", hi: "ग्रीनस्किल लैंडस्केप", gu: "ગ્રીનસ્કિલ લેન્ડસ્કેપ" },
    tagline: { en: "Quality Plants for Every Home", hi: "हर घर के लिए गुणवत्तापूर्ण पौधे", gu: "દરેક ઘર માટે ગુણવત્તાસભર છોડ" },
    description: {
      en: "Greenskill Landscape is your trusted local nursery, offering a curated selection of indoor, outdoor and flowering plants. We bring nature closer to your home.",
      hi: "ग्रीनस्किल लैंडस्केप आपकी विश्वसनीय स्थानीय नर्सरी है, जो इनडोर, आउटडोर और फूल वाले पौधों का चयन प्रदान करती है।",
      gu: "ગ્રીનસ્કિલ લેન્ડસ્કેપ એ તમારી વિશ્વસનીય સ્થાનિક નર્સરી છે, જે ઇનડોર, આઉટડોર અને ફૂલ છોડ ઓફર કરે છે.",
    },
    phone: "9876543210",
    whatsapp: "9876543210",
    email: "hello@greenskilllandscape.in",
    address: {
      en: "123 Garden Street, Near Central Park",
      hi: "123 गार्डन स्ट्रीट, सेंट्रल पार्क के पास",
      gu: "123 ગાર્ડન સ્ટ્રીટ, સેન્ટ્રલ પાર્ક પાસે",
    },
    city: { en: "Ahmedabad", hi: "अहमदाबाद", gu: "અમદાવાદ" },
    region: { en: "Gujarat", hi: "गुजरात", gu: "ગુજરાત" },
    currency: "INR",
    theme: { preset: "forest" },
    openEveryday: true,
    openTime: "8:00 AM",
    closeTime: "8:00 PM",
  },

  // ── Rose ──────────────────────────────────────────────────────────────────
  {
    _id: "plant-rose",
    _type: "plant",
    name: { en: "Rose", hi: "गुलाब", gu: "ગુલાબ" },
    slug: { _type: "slug", current: "rose" },
    scientificName: "Rosa × hybrida",
    description: {
      en: "The timeless queen of flowers, beloved across India for its colour, fragrance and versatility. Available in multiple colours to suit every garden and occasion.",
      hi: "फूलों की कालातीत रानी, अपने रंग, सुगंध और बहुमुखिता के लिए पूरे भारत में प्रिय।",
      gu: "ફૂલોની ચિરંતન રાણી — રંગ, સુગંધ અને બહુ-ઉપયોગ માટે ભારતભરમાં પ્રિય.",
    },
    categories: ["Flowering", "Garden Plants", "Outdoor Plants"],
    featured: true,
    fragrant: true,
    petSafe: false,
    careTips: {
      en: "Water at the base every 2 days. Apply rose fertiliser monthly during the growing season. Prune dead blooms to encourage new flowers. Watch for aphids on new growth.",
      hi: "हर 2 दिन में आधार पर पानी दें। बढ़ते मौसम में मासिक गुलाब खाद डालें। मृत फूलों को काटें।",
      gu: "દર 2 દિવસે ઊભ પર પાણી. ઉગવાની સિઝનમાં ગુલાબ ખાતર. ઝૂઠ ફૂલ કાઢો.",
    },
    tags: ["flowering", "fragrant", "garden", "gifting"],
    varieties: [
      variety({
        name: { en: "Red Rose", hi: "लाल गुलाब", gu: "લાલ ગુલાબ" },
        availability: "in_stock", sunlight: "full_sun", watering: "medium", growthRate: "medium",
        sizeRange: "1–2 ft", bloomSeason: "October–March",
        bagSizes: [
          bagSize("8 × 8",   [[1, 100, 150], [101, 500, 130], [501, null, 110]]),
          bagSize("10 × 10", [[1, 100, 190], [101, 500, 165], [501, null, 140]]),
        ],
      }),
      variety({
        name: { en: "Pink Rose", hi: "गुलाबी गुलाब", gu: "ગુલાબી ગુલાબ" },
        availability: "in_stock", sunlight: "full_sun", watering: "medium", growthRate: "medium",
        sizeRange: "1–2 ft", bloomSeason: "October–March",
        bagSizes: [
          bagSize("8 × 8",   [[1, 100, 140], [101, 500, 120], [501, null, 100]]),
          bagSize("10 × 10", [[1, 100, 180], [101, 500, 155], [501, null, 130]]),
        ],
      }),
      variety({
        name: { en: "White Rose", hi: "सफेद गुलाब", gu: "સફેદ ગુલાબ" },
        availability: "in_stock", sunlight: "full_sun", watering: "medium", growthRate: "medium",
        sizeRange: "1–2 ft", bloomSeason: "October–March",
        bagSizes: [
          bagSize("8 × 8",   [[1, 100, 140], [101, 500, 120], [501, null, 100]]),
          bagSize("10 × 10", [[1, 100, 180], [101, 500, 155], [501, null, 130]]),
        ],
      }),
      variety({
        name: { en: "Yellow Rose", hi: "पीला गुलाब", gu: "પીળો ગુલાબ" },
        availability: "in_stock", sunlight: "full_sun", watering: "medium", growthRate: "medium",
        sizeRange: "1–2 ft", bloomSeason: "October–March",
        bagSizes: [
          bagSize("8 × 8",   [[1, 100, 140], [101, 500, 120], [501, null, 100]]),
          bagSize("10 × 10", [[1, 100, 180], [101, 500, 155], [501, null, 130]]),
        ],
      }),
      variety({
        name: { en: "Orange Rose", hi: "नारंगी गुलाब", gu: "નારંગી ગુલાબ" },
        availability: "limited", sunlight: "full_sun", watering: "medium", growthRate: "medium",
        sizeRange: "1–2 ft", bloomSeason: "October–March",
        bagSizes: [
          bagSize("8 × 8",   [[1, 100, 160], [101, null, 135]]),
          bagSize("10 × 10", [[1, 100, 200], [101, null, 170]]),
        ],
      }),
      variety({
        name: { en: "Climbing Rose", hi: "चढ़ने वाला गुलाब", gu: "ક્લાઇમ્બિંગ ગુલાબ" },
        availability: "limited", sunlight: "full_sun", watering: "medium", growthRate: "fast",
        sizeRange: "3–5 ft", bloomSeason: "October–March",
        bagSizes: [
          bagSize("12 × 12", [[1, 50, 260], [51, null, 220]]),
          bagSize("12 × 15", [[1, 50, 300], [51, null, 260]]),
        ],
      }),
    ],
  },

  // ── Sandalwood ────────────────────────────────────────────────────────────
  {
    _id: "plant-sandalwood",
    _type: "plant",
    name: { en: "Sandalwood", hi: "चंदन", gu: "ચંદન" },
    slug: { _type: "slug", current: "sandalwood" },
    scientificName: "Santalum / Pterocarpus",
    description: {
      en: "Sacred and aromatic sandalwood trees prized in Indian culture for millennia. Used in temples, Ayurvedic medicine and traditional rituals. Both white and red varieties available.",
      hi: "भारतीय संस्कृति में सहस्राब्दियों से पूजित पवित्र और सुगंधित चंदन के पेड़। मंदिरों, आयुर्वेद और परंपराओं में उपयोग।",
      gu: "ભારતીય સંસ્કૃતિમાં સદીઓથી પૂજ્ય, સુગંધિત ચંદન. મંદિર, આયુર્વેદ અને ધાર્મિક વિધિઓ.",
    },
    categories: ["Medicinal", "Outdoor Plants", "Garden Plants"],
    featured: true,
    fragrant: true,
    petSafe: true,
    careTips: {
      en: "Plant in well-draining soil with a host plant nearby — sandalwood is semi-parasitic and needs a companion root. Water sparingly once established. Full sun. Slow but rewarding.",
      hi: "पास में एक मेजबान पौधे के साथ अच्छी जल-निकासी वाली मिट्टी में लगाएं। स्थापित होने के बाद कम पानी।",
      gu: "Host plant સાથે સારી ડ્રેઇનિંગ માટીમાં રોપો. ઉગ્યા પછી ઓછું પાણી. ધીમો વિકાસ.",
    },
    tags: ["sacred", "aromatic", "rare", "medicinal"],
    varieties: [
      variety({
        name: { en: "White Sandalwood", hi: "सफेद चंदन", gu: "સફેદ ચંદન" },
        availability: "limited", sunlight: "full_sun", watering: "low", growthRate: "slow",
        sizeRange: "1–1.5 ft (sapling)", maxHeight: "10–15 m",
        bagSizes: [
          bagSize("6 × 6", [[1, 10, 480], [11, 50, 450], [51, null, 400]]),
          bagSize("8 × 8", [[1, 10, 580], [11, 50, 540], [51, null, 490]]),
        ],
      }),
      variety({
        name: { en: "Red Sandalwood", hi: "लाल चंदन", gu: "લાલ ચંદન" },
        availability: "limited", sunlight: "full_sun", watering: "low", growthRate: "slow",
        sizeRange: "6–8 inch (sapling)", maxHeight: "8–12 m",
        bagSizes: [
          bagSize("6 × 6", [[1, 10, 650], [11, 50, 600], [51, null, 540]]),
        ],
      }),
    ],
  },

  // ── Mango ─────────────────────────────────────────────────────────────────
  {
    _id: "plant-mango",
    _type: "plant",
    name: { en: "Mango", hi: "आम", gu: "કેરી" },
    slug: { _type: "slug", current: "mango" },
    scientificName: "Mangifera indica",
    description: {
      en: "India's favourite fruit tree, available as grafted saplings for faster fruiting. Choose from prized Indian varieties and the rare Japanese Miyazaki.",
      hi: "भारत का पसंदीदा फल वृक्ष, ग्राफ्टेड पौधों के रूप में उपलब्ध। प्रमुख भारतीय किस्में और दुर्लभ जापानी मियाज़ाकी।",
      gu: "ભારતનું પ્રિય ફળ, ઝડ ફળ માટે ગ્રાફ્ટેડ. ભારતીય અને જાપાની Miyazaki.",
    },
    categories: ["Fruit Plants", "Outdoor Plants", "Garden Plants"],
    featured: true,
    fragrant: true,
    petSafe: true,
    careTips: {
      en: "Water deeply twice a week in summer, once a week otherwise. Apply potash-rich fertiliser before flowering. Avoid waterlogging. Grafted plants fruit in 2–3 years.",
      hi: "गर्मियों में सप्ताह में दो बार, अन्यथा एक बार गहराई से पानी दें। फूल आने से पहले पोटाश खाद। ग्राफ्टेड पौधे 2-3 साल में फल देते हैं।",
      gu: "ઉનાળામાં અઠ. બે વાર, અન્ય ઋtuone. potash ખાતર. ગ્રાફ્ટેડ 2-3 વr.",
    },
    tags: ["fruit", "grafted"],
    varieties: [
      variety({
        name: { en: "Kesar", hi: "केसर", gu: "કેસર" },
        availability: "in_stock", sunlight: "full_sun", watering: "medium", growthRate: "medium",
        sizeRange: "1.5–2 ft (grafted sapling)", bloomSeason: "February–March", maxHeight: "10–15 m",
        bagSizes: [
          bagSize("10 × 10", [[1, 10, 380], [11, 50, 350], [51, null, 310]]),
          bagSize("12 × 12", [[1, 10, 450], [11, 50, 420], [51, null, 380]]),
        ],
      }),
      variety({
        name: { en: "Alphonso (Hapus)", hi: "अल्फांसो (हापुस)", gu: "આલ્ફોન્સો (હાફૂસ)" },
        availability: "in_stock", sunlight: "full_sun", watering: "medium", growthRate: "medium",
        sizeRange: "1.5–2 ft (grafted sapling)", bloomSeason: "February–March", maxHeight: "10–15 m",
        bagSizes: [
          bagSize("10 × 10", [[1, 10, 430], [11, 50, 400], [51, null, 360]]),
          bagSize("12 × 12", [[1, 10, 510], [11, 50, 475], [51, null, 430]]),
        ],
      }),
      variety({
        name: { en: "Langra", hi: "लंगड़ा", gu: "લંગડો" },
        availability: "in_stock", sunlight: "full_sun", watering: "medium", growthRate: "medium",
        sizeRange: "1.5–2 ft (grafted sapling)", bloomSeason: "February–March", maxHeight: "10–15 m",
        bagSizes: [
          bagSize("10 × 10", [[1, 10, 350], [11, 50, 320], [51, null, 285]]),
          bagSize("12 × 12", [[1, 10, 420], [11, 50, 390], [51, null, 350]]),
        ],
      }),
      variety({
        name: { en: "Miyazaki", hi: "मियाज़ाकी", gu: "મિયાઝાકી" },
        availability: "limited", sunlight: "full_sun", watering: "medium", growthRate: "medium",
        sizeRange: "1.5–2 ft (grafted sapling)", bloomSeason: "February–March", maxHeight: "10–15 m",
        bagSizes: [
          bagSize("12 × 12", [[1, 5, 2200], [6, 20, 2000], [21, null, 1800]]),
          bagSize("12 × 15", [[1, 5, 2600], [6, 20, 2400], [21, null, 2100]]),
        ],
      }),
    ],
  },

  // ── Snake Plant ───────────────────────────────────────────────────────────
  {
    _id: "plant-snake-plant",
    _type: "plant",
    name: { en: "Snake Plant", hi: "स्नेक प्लांट", gu: "સ્નેક પ્લાન્ટ" },
    slug: { _type: "slug", current: "snake-plant" },
    scientificName: "Dracaena trifasciata",
    description: {
      en: "One of the best air-purifying plants. Almost indestructible — survives low light and infrequent watering. Available in striking leaf pattern varieties.",
      hi: "सर्वोत्तम वायु-शोधक पौधों में से एक। कम रोशनी और कम पानी में जीवित रहता है। विभिन्न पत्ती पैटर्न उपलब्ध।",
      gu: "શ્રેષ્ઠ હવા-શુd્ધ. ઓછો પ્રકાશ, ઓછું પાણી — ટkau.",
    },
    categories: ["Indoor Plants", "Air-Purifying"],
    featured: true,
    fragrant: false,
    petSafe: false,
    careTips: {
      en: "Water only when the top 2 inches of soil are completely dry. Wipe leaves monthly to remove dust. Never let it sit in standing water — root rot is the main risk.",
      hi: "मिट्टी की ऊपरी 2 इंच पूरी तरह सूखने पर ही पानी दें। मासिक पत्तियां पोंछें। खड़े पानी में न रखें।",
      gu: "UpperMost 2 inch sukha tyanej paani. masik paan luchho. Sthayi paani nahi.",
    },
    tags: ["air-purifying", "low-maintenance", "beginner"],
    varieties: [
      variety({
        name: { en: "Laurentii", hi: "लॉरेंटी", gu: "લૉरेntI" },
        availability: "in_stock", sunlight: "shade", watering: "low", growthRate: "slow",
        sizeRange: "1–2 ft",
        bagSizes: [
          bagSize("6 × 6", [[1, 50, 270], [51, 200, 245], [201, null, 220]]),
          bagSize("8 × 8", [[1, 50, 330], [51, 200, 300], [201, null, 270]]),
        ],
      }),
      variety({
        name: { en: "Moonshine", hi: "मूनशाइन", gu: "મૂनShine" },
        availability: "in_stock", sunlight: "shade", watering: "low", growthRate: "slow",
        sizeRange: "1–2 ft",
        bagSizes: [
          bagSize("6 × 6", [[1, 50, 320], [51, 200, 295], [201, null, 265]]),
          bagSize("8 × 8", [[1, 50, 390], [51, 200, 355], [201, null, 320]]),
        ],
      }),
      variety({
        name: { en: "Zeylanica", hi: "ज़ेलानिका", gu: "ઝૅલેनिका" },
        availability: "in_stock", sunlight: "shade", watering: "low", growthRate: "slow",
        sizeRange: "1–2 ft",
        bagSizes: [
          bagSize("6 × 6", [[1, 50, 240], [51, 200, 215], [201, null, 190]]),
          bagSize("8 × 8", [[1, 50, 295], [51, 200, 265], [201, null, 240]]),
        ],
      }),
      variety({
        name: { en: "Black Coral", hi: "ब्लैक कोरल", gu: "Black Coral" },
        availability: "limited", sunlight: "shade", watering: "low", growthRate: "slow",
        sizeRange: "8–14 inch",
        bagSizes: [
          bagSize("6 × 6", [[1, 20, 380], [21, null, 340]]),
        ],
      }),
    ],
  },

  // ── Money Plant ───────────────────────────────────────────────────────────
  {
    _id: "plant-money-plant",
    _type: "plant",
    name: { en: "Money Plant", hi: "मनी प्लांट", gu: "મની પ્લાન્ટ" },
    slug: { _type: "slug", current: "money-plant" },
    scientificName: "Epipremnum aureum",
    description: {
      en: "A beloved trailing vine believed to bring good luck and prosperity. Thrives in water or soil, indoors or outdoors. Multiple leaf patterns to choose from.",
      hi: "सौभाग्य और समृद्धि लाने वाला लोकप्रिय पौधा। पानी या मिट्टी में उगता है।",
      gu: "સૌadhaagya અne samridhi laanar. Paani ke maati — game tyaan uge.",
    },
    categories: ["Indoor Plants", "Air-Purifying", "Balcony Plants"],
    featured: false,
    fragrant: false,
    petSafe: false,
    tags: ["trailing", "air-purifying", "beginner", "lucky"],
    varieties: [
      variety({
        name: { en: "Golden Pothos", hi: "गोल्डन पोथोस", gu: "ગોlden Pothos" },
        availability: "in_stock", sunlight: "bright_indirect", watering: "medium", growthRate: "fast",
        sizeRange: "Trailing",
        bagSizes: [
          bagSize("4 × 5", [[1, 100, 85], [101, 500, 75], [501, null, 65]]),
          bagSize("6 × 6", [[1, 100, 110], [101, 500, 95], [501, null, 80]]),
        ],
      }),
      variety({
        name: { en: "Marble Queen", hi: "मार्बल क्वीन", gu: "Marble Queen" },
        availability: "in_stock", sunlight: "bright_indirect", watering: "medium", growthRate: "medium",
        sizeRange: "Trailing",
        bagSizes: [
          bagSize("4 × 5", [[1, 100, 105], [101, 500, 90], [501, null, 75]]),
          bagSize("6 × 6", [[1, 100, 130], [101, 500, 115], [501, null, 95]]),
        ],
      }),
      variety({
        name: { en: "Neon Pothos", hi: "नियॉन पोथोस", gu: "Neon Pothos" },
        availability: "in_stock", sunlight: "bright_indirect", watering: "medium", growthRate: "fast",
        sizeRange: "Trailing",
        bagSizes: [
          bagSize("4 × 5", [[1, 100, 95], [101, 500, 80], [501, null, 70]]),
          bagSize("6 × 6", [[1, 100, 120], [101, 500, 105], [501, null, 88]]),
        ],
      }),
    ],
  },

  // ── Aloe Vera ─────────────────────────────────────────────────────────────
  {
    _id: "plant-aloe-vera",
    _type: "plant",
    name: { en: "Aloe Vera", hi: "एलोवेरा", gu: "એलોveRa" },
    slug: { _type: "slug", current: "aloe-vera" },
    scientificName: "Aloe barbadensis miller",
    description: {
      en: "The ultimate medicinal houseplant. Soothing gel for skin and hair. Easy to grow, practically impossible to kill.",
      hi: "अंतिम औषधीय घरेलू पौधा। त्वचा और बालों के लिए सुखदायक जेल। आसानी से उगाएं।",
      gu: "Aushadhiya gharelu chhod. Tvachaa ane vaal maat gel. Saral.",
    },
    categories: ["Succulents", "Medicinal", "Indoor Plants"],
    featured: false,
    fragrant: false,
    petSafe: false,
    careTips: {
      en: "Water every 2–3 weeks. Allow soil to dry completely between waterings. Use a succulent/cactus mix. Avoid overwatering — the number one cause of death.",
      hi: "हर 2-3 सप्ताह में पानी दें। सिंचाई के बीच मिट्टी पूरी तरह सूखने दें। सक्युलेंट मिक्स।",
      gu: "2-3 athvadie paani. Vaache sampurna sukavaa do. Succulent mix.",
    },
    tags: ["medicinal", "succulent", "beginner"],
    varieties: [
      variety({
        name: { en: "Barbadensis (Common Aloe)", hi: "बारबाडेंसिस", gu: "Barbadensis" },
        availability: "in_stock", sunlight: "full_sun", watering: "low", growthRate: "slow",
        sizeRange: "4–8 inch spread",
        bagSizes: [
          bagSize("6 × 6", [[1, 50, 130], [51, 200, 115], [201, null, 100]]),
          bagSize("8 × 8", [[1, 50, 165], [51, 200, 145], [201, null, 125]]),
        ],
      }),
      variety({
        name: { en: "Chinensis (Chinese Aloe)", hi: "चिनेंसिस", gu: "Chinensis" },
        availability: "in_stock", sunlight: "full_sun", watering: "low", growthRate: "slow",
        sizeRange: "3–5 inch spread",
        bagSizes: [
          bagSize("4 × 5", [[1, 50, 110], [51, 200, 95], [201, null, 80]]),
          bagSize("6 × 6", [[1, 50, 140], [51, 200, 120], [201, null, 105]]),
        ],
      }),
    ],
  },

  // ── Jade Plant ────────────────────────────────────────────────────────────
  {
    _id: "plant-jade-plant",
    _type: "plant",
    name: { en: "Jade Plant", hi: "जेड प्लांट", gu: "જેdeplant" },
    slug: { _type: "slug", current: "jade-plant" },
    scientificName: "Crassula ovata",
    description: {
      en: "A long-lived succulent called the 'money tree'. Oval jade-green leaves on woody stems. Thrives on neglect and can live for decades.",
      hi: "'मनी ट्री' — लंबे समय तक जीवित रहने वाला सक्युलेंट। दशकों तक जीवित रह सकता है।",
      gu: "'Money Tree' — laambu aayu, ochi sambhaal. Dasakao sudhee jive.",
    },
    categories: ["Succulents", "Indoor Plants"],
    featured: false,
    fragrant: false,
    petSafe: false,
    tags: ["succulent", "low-maintenance", "lucky"],
    varieties: [
      variety({
        name: { en: "Ovata (Common Jade)", hi: "ओवाटा", gu: "Ovaata" },
        availability: "in_stock", sunlight: "bright_indirect", watering: "low", growthRate: "slow",
        sizeRange: "4–8 inch",
        bagSizes: [
          bagSize("4 × 5", [[1, 50, 185], [51, 200, 165], [201, null, 145]]),
          bagSize("6 × 6", [[1, 50, 230], [51, 200, 205], [201, null, 180]]),
        ],
      }),
      variety({
        name: { en: "Gollum (Trumpet Jade)", hi: "गोलम", gu: "Gollum" },
        availability: "in_stock", sunlight: "bright_indirect", watering: "low", growthRate: "slow",
        sizeRange: "4–6 inch",
        bagSizes: [
          bagSize("4 × 5", [[1, 50, 225], [51, 200, 200], [201, null, 175]]),
          bagSize("6 × 6", [[1, 50, 275], [51, 200, 245], [201, null, 215]]),
        ],
      }),
    ],
  },
];

async function seed() {
  console.log(`Seeding ${documents.length} documents to project ${client.config().projectId}…\n`);
  const transaction = client.transaction();
  for (const doc of documents) transaction.createOrReplace(doc);
  try {
    const result = await transaction.commit();
    console.log(`✓ Done — ${result.results.length} documents written.\n`);
    result.results.forEach((r) => console.log(`  ${r.id}`));
  } catch (err) {
    console.error("✗ Seed failed:", err.message);
    process.exit(1);
  }
}

seed();
