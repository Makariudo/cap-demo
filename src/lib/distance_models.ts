export type DisplayMode = "Officielles" | "Fractionnés" | "Intermédiaires";
export const DisplayModeList = ["Officielles", "Fractionnés", "Intermédiaires"];
export type EstimationForme = 0 | 1 | 2 | 3 | 4 | 5;
export type EnumType = { [key: string]: string | number };
export type EnumAsArrayType = {
  key: string;
  value: string | number;
}[];

export const enumToArray = (data: EnumType): EnumAsArrayType =>
  Object.keys(data)
    .filter((key) => Number.isNaN(+key))
    .map((key: string) => ({
      key,
      value: data[key],
    }));

export type EstimationParcoursConditions =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10;
export enum DistanceIntermediairesEnum {
  "1000M" = "1000 m",
  "1500M" = "1500 m",
  "2000M" = "2000 m",
  "3000M" = "3000 m",
  "5000M" = "5000 m",
  "10KM" = "10 Km",
  "15KM" = "15 Km",
  "20KM" = "20 Km",
  "SEMI" = "Semi-marathon",
  "30KM" = "30 Km",
  "MARATHON" = "Marathon",
  "50KM" = "50 Km",
  "100KM" = "100 Km",
}

export type distanceType = DistanceIntermediairesEnum;

export const mapDistance = enumToArray(DistanceIntermediairesEnum);

export interface NameToDistance {
  label: string;
  distance: number;
  minSoutien: number;
  maxSoutien: number;
  tempsIntermediaires: Array<number>;
}

export const dataDistance: Record<DistanceIntermediairesEnum, NameToDistance> =
  {
    [DistanceIntermediairesEnum["1000M"]]: {
      label: DistanceIntermediairesEnum["1000M"],
      distance: 1000,
      minSoutien: 115,
      maxSoutien: 121,
      tempsIntermediaires: [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000],
    },
    [DistanceIntermediairesEnum["1500M"]]: {
      label: DistanceIntermediairesEnum["1500M"],
      distance: 1500,
      minSoutien: 104,
      maxSoutien: 110,
      tempsIntermediaires: [
        100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300,
        1400, 1500,
      ],
    },
    [DistanceIntermediairesEnum["2000M"]]: {
      label: DistanceIntermediairesEnum["2000M"],
      distance: 2000,
      minSoutien: 94,
      maxSoutien: 101,
      tempsIntermediaires: [
        200, 400, 600, 800, 1000, 1200, 1400, 1600, 1800, 2000,
      ],
    },
    [DistanceIntermediairesEnum["3000M"]]: {
      label: DistanceIntermediairesEnum["3000M"],
      distance: 3000,
      minSoutien: 92,
      maxSoutien: 99,
      tempsIntermediaires: [
        200, 400, 600, 800, 1000, 1200, 1400, 1600, 1800, 2000, 2200, 2400,
        2600, 2800, 3000,
      ],
    },
    [DistanceIntermediairesEnum["5000M"]]: {
      label: DistanceIntermediairesEnum["5000M"],
      distance: 5000,
      minSoutien: 89,
      maxSoutien: 96,
      tempsIntermediaires: [
        200, 400, 600, 800, 1000, 1200, 1400, 1600, 1800, 2000, 2200, 2400,
        2600, 2800, 3000, 3200, 3400, 3600, 3800, 4000, 4200, 4400, 4600, 4800,
        5000,
      ],
    },
    [DistanceIntermediairesEnum["10KM"]]: {
      label: DistanceIntermediairesEnum["10KM"],
      distance: 10000,
      minSoutien: 84,
      maxSoutien: 91,
      tempsIntermediaires: [
        1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000,
      ],
    },
    [DistanceIntermediairesEnum["15KM"]]: {
      label: DistanceIntermediairesEnum["15KM"],
      distance: 15000,
      minSoutien: 81,
      maxSoutien: 88,
      tempsIntermediaires: [
        1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 11000,
        12000, 13000, 14000, 15000,
      ],
    },
    [DistanceIntermediairesEnum["20KM"]]: {
      label: DistanceIntermediairesEnum["20KM"],
      distance: 20000,
      minSoutien: 79,
      maxSoutien: 86,
      tempsIntermediaires: [
        1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 11000,
        12000, 13000, 14000, 15000, 16000, 17000, 18000, 19000, 20000,
      ],
    },
    [DistanceIntermediairesEnum["SEMI"]]: {
      label: DistanceIntermediairesEnum["SEMI"],
      distance: 21097.5,
      minSoutien: 79,
      maxSoutien: 86,
      tempsIntermediaires: [
        1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 11000,
        12000, 13000, 14000, 15000, 16000, 17000, 18000, 19000, 20000, 21000,
        21097,
      ],
    },
    [DistanceIntermediairesEnum["30KM"]]: {
      label: DistanceIntermediairesEnum["30KM"],
      distance: 30000,
      minSoutien: 76,
      maxSoutien: 83,
      tempsIntermediaires: [5000, 10000, 15000, 20000, 25000, 30000],
    },
    [DistanceIntermediairesEnum["MARATHON"]]: {
      label: DistanceIntermediairesEnum["MARATHON"],
      distance: 42195,
      minSoutien: 74,
      maxSoutien: 81,
      tempsIntermediaires: [
        5000, 10000, 15000, 20000, 25000, 30000, 35000, 40000, 42195,
      ],
    },
    [DistanceIntermediairesEnum["50KM"]]: {
      label: DistanceIntermediairesEnum["50KM"],
      distance: 50000,
      minSoutien: 73,
      maxSoutien: 80,
      tempsIntermediaires: [
        5000, 10000, 15000, 20000, 25000, 30000, 35000, 40000, 45000, 50000,
      ],
    },
    [DistanceIntermediairesEnum["100KM"]]: {
      label: DistanceIntermediairesEnum["100KM"],
      distance: 100000,
      minSoutien: 59,
      maxSoutien: 66,
      tempsIntermediaires: [
        10000, 20000, 30000, 40000, 50000, 60000, 70000, 80000, 90000, 100000,
      ],
    },
  };

export function calculVMACourse(
  distanceMetre: DistanceIntermediairesEnum,
  tempsSeconde: number,
  estimationForme: EstimationForme,
  estimationParcours: EstimationParcoursConditions
): number {
  return 240;
}
