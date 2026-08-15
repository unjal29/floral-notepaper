const quotePairs: Array<[string, string]> = [
  ["“", "‘"],
  ["”", "’"],
  ["『", "「"],
  ["』", "」"],
];
const punctuation: Array<[string, string]> = [
  [",", "，"],
  [".", "。"],
  ["!", "！"],
  ["?", "？"],
  [":", "："],
  [";", "；"],
  ["(", "（"],
  [")", "）"],
  ["~", "～"],
];
export function toggleCornerQuotes(input: string): string {
  const reverse = input.includes("「") || input.includes("『");
  const map = new Map(reverse ? quotePairs.map(([a, b]) => [b, a]) : quotePairs);
  return [...input].map((c) => map.get(c) ?? c).join("");
}
export type WidthStage = "half" | "full";
export function detectWidthStage(input: string): WidthStage {
  return [...input].some((c) => punctuation.some(([, full]) => full === c)) ? "full" : "half";
}
export function cycleWidth(input: string, stage: WidthStage): { text: string; stage: WidthStage } {
  const map = new Map(stage === "half" ? punctuation : punctuation.map(([a, b]) => [b, a]));
  return {
    text: [...input].map((c) => map.get(c) ?? c).join(""),
    stage: stage === "half" ? "full" : "half",
  };
}
const kanaPairs: Array<[string, string]> = [
  ["あ", "ア"],
  ["い", "イ"],
  ["う", "ウ"],
  ["え", "エ"],
  ["お", "オ"],
  ["か", "カ"],
  ["き", "キ"],
  ["く", "ク"],
  ["け", "ケ"],
  ["こ", "コ"],
  ["ん", "ン"],
];
export type KanaStage = "hiragana" | "katakana";
export function detectKanaStage(input: string): KanaStage {
  return [...input].some((c) => kanaPairs.some(([, k]) => k === c)) ? "katakana" : "hiragana";
}
export function cycleKana(input: string, stage: KanaStage): { text: string; stage: KanaStage } {
  const map = new Map(stage === "hiragana" ? kanaPairs : kanaPairs.map(([a, b]) => [b, a]));
  return {
    text: [...input].map((c) => map.get(c) ?? c).join(""),
    stage: stage === "hiragana" ? "katakana" : "hiragana",
  };
}
export type NumeralStage = "arabic" | "chinese" | "roman" | "circled";
const numeralStages: string[][] = [
  ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"],
  ["〇", "一", "二", "三", "四", "五", "六", "七", "八", "九"],
  ["0", "Ⅰ", "Ⅱ", "Ⅲ", "Ⅳ", "Ⅴ", "Ⅵ", "Ⅶ", "Ⅷ", "Ⅸ"],
  ["⓪", "①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨"],
];
export function detectNumeralStage(input: string): NumeralStage {
  if ([...input].some((c) => numeralStages[3].includes(c))) return "circled";
  if ([...input].some((c) => numeralStages[2].includes(c))) return "roman";
  if ([...input].some((c) => numeralStages[1].includes(c))) return "chinese";
  return "arabic";
}
export function cycleNumeral(
  input: string,
  stage: NumeralStage,
): { text: string; stage: NumeralStage } {
  const names: NumeralStage[] = ["arabic", "chinese", "roman", "circled"];
  const from = numeralStages[names.indexOf(stage)];
  const toIndex = (names.indexOf(stage) + 1) % names.length;
  const to = numeralStages[toIndex];
  return {
    text: [...input]
      .map((c) => {
        const index = from.indexOf(c);
        return index >= 0 ? to[index] : c;
      })
      .join(""),
    stage: names[toIndex],
  };
}
