import { Section } from "../types";
import { welcomeSection } from "./welcome";
import { cryptoIntroSection } from "./cryptoIntro";
import { tradingIntroSection } from "./tradingIntro";
import { technicalAnalysisSection } from "./technicalAnalysis";
import { binanceSection } from "./binance";
import { explodingCoinsSection } from "./explodingCoins";
import { walletsSection } from "./wallets";
import { indicatorsSection } from "./indicators";

export const sections: Section[] = [
  welcomeSection,
  cryptoIntroSection,
  tradingIntroSection,
  technicalAnalysisSection,
  binanceSection,
  explodingCoinsSection,
  walletsSection,
  indicatorsSection
];

export const getTotalLessons = () => {
  return sections.reduce((total, section) => total + section.lessons.length, 0);
};

export const getSectionTitle = (index: number) => {
  return `${index + 1}. ${sections[index].title}`;
};