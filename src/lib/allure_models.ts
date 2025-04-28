export const enum AlluresIntermediairesEnum {
  "2'00" = "2'00 /Km",
  "3'00" = "3'00 /Km",
  "4'00" = "4'00 /Km",
  "5'00" = "5'00 /Km",
  "6'00" = "6'00 /Km",
  "7'00" = "7'00 /Km",
  "8'00" = "8'00 /Km",
}

export const enum IncrementAllureEnum {
  '1"' = '1"/Km',
  '2"' = '2"/Km',
  '5"' = '5"/Km',
  '10"' = '10"/Km',
  '15"' = '15"/Km',
  '20"' = '20"/Km',
  '30"' = '30"/Km',
}

export const incrementAllure = ['1"', '2"', '5"', '10"', '15"', '20"', '30"'];

export type allureType = AlluresIntermediairesEnum;

export interface AllureData {
  label: string;
  allure: number;
}

export const dataAllure: Record<AlluresIntermediairesEnum, AllureData> = {
  [AlluresIntermediairesEnum["2'00"]]: {
    label: AlluresIntermediairesEnum["2'00"],
    allure: 120,
  },
  [AlluresIntermediairesEnum["3'00"]]: {
    label: AlluresIntermediairesEnum["3'00"],
    allure: 180,
  },
  [AlluresIntermediairesEnum["4'00"]]: {
    label: AlluresIntermediairesEnum["4'00"],
    allure: 240,
  },
  [AlluresIntermediairesEnum["5'00"]]: {
    label: AlluresIntermediairesEnum["5'00"],
    allure: 300,
  },
  [AlluresIntermediairesEnum["6'00"]]: {
    label: AlluresIntermediairesEnum["6'00"],
    allure: 360,
  },
  [AlluresIntermediairesEnum["7'00"]]: {
    label: AlluresIntermediairesEnum["7'00"],
    allure: 420,
  },
  [AlluresIntermediairesEnum["8'00"]]: {
    label: AlluresIntermediairesEnum["8'00"],
    allure: 480,
  },
};
