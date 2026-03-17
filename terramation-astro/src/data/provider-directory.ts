export interface ProviderEntry {
  name: string;
  href: string;
  note: string;
  sponsored?: boolean;
}

export interface ProviderCategory {
  title: string;
  status: string;
  summary: string;
  estimatedCost: string;
  providers: ProviderEntry[];
}

export interface FeaturedProviderSlot {
  label: string;
  sponsorship: string;
  name: string;
  category: string;
  summary: string;
  highlights: string[];
  href: string;
  cta: string;
  logoText?: string;
  logoImage?: string;
}

export const featuredProvider: FeaturedProviderSlot = {
  label: "Featured Provider",
  sponsorship: "Sponsored placement",
  name: "Your Brand Here",
  category: "Example: Natural Burial / Eco Funeral Director / Memorial Service",
  summary:
    "This premium slot sits above the directory and is designed for providers who want the strongest visibility on the page.",
  highlights: [
    "Top-of-page placement for high-intent visitors",
    "Space for your logo, positioning, and direct CTA",
    "Ideal for featured listings and premium sponsorship packages",
  ],
  href: "/contact/?topic=advertising",
  cta: "Enquire about this slot",
  logoText: "Featured logo",
};

export const providerCategories: ProviderCategory[] = [
  {
    title: "Natural burials",
    status: "Available in the UK",
    summary:
      "Biodegradable coffins or shrouds buried in protected natural landscapes with minimal environmental impact.",
    estimatedCost: "Estimated cost: £800 to £4,000 depending on location and plot type.",
    providers: [
      {
        name: "Woodland Burial Grounds",
        href: "https://woodlandburialtrust.com",
        note: "Natural burial option with woodland-focused memorial settings.",
        sponsored: false,
      },
      {
        name: "Natural Death Centre",
        href: "https://naturaldeath.org.uk",
        note: "UK-wide guidance and directory for natural burial grounds and funeral planning.",
        sponsored: false,
      },
    ],
  },
  {
    title: "Water cremation / resomation",
    status: "Emerging in the UK",
    summary:
      "Also called alkaline hydrolysis, this lower-emission alternative uses water, heat, and alkali instead of flame.",
    estimatedCost: "Estimated cost: around £1,500 to £2,500 including basic funeral services.",
    providers: [
      {
        name: "Rowley Regis Crematorium",
        href: "https://www.sandwell.gov.uk/info/200222/bereavement_services/778/rowley_regis_crematorium",
        note: "Referenced in the original guide as an early UK location linked to greener cremation services.",
        sponsored: false,
      },
      {
        name: "Resomation Ltd",
        href: "https://resomation.com",
        note: "Technology provider behind water cremation systems.",
        sponsored: false,
      },
    ],
  },
  {
    title: "Human composting / terramation",
    status: "Not yet available in the UK",
    summary:
      "Natural organic reduction transforms human remains into nutrient-rich soil over several weeks using organic materials and controlled decomposition.",
    estimatedCost:
      "Not yet priced in the UK. US pricing has typically ranged from about $3,000 to $5,000.",
    providers: [],
  },
  {
    title: "Promession",
    status: "Not available in the UK",
    summary:
      "A developing freeze-drying approach designed to reduce remains into an organic powder for environmentally sensitive burial.",
    estimatedCost: "No reliable UK pricing yet.",
    providers: [
      {
        name: "Promessa Organic AB",
        href: "https://promessa.se/en/",
        note: "Swedish company developing the promession process.",
        sponsored: false,
      },
    ],
  },
];
