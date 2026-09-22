const KM_PER_AU = 149_597_870.7;

const kmFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});
const auFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

export const formatAu = (au: number) => `${auFormatter.format(au)} AU`;

/** Formats a distance given in AU as kilometers. */
export const formatAuAsKm = (au: number) =>
  `${kmFormatter.format(au * KM_PER_AU)} km`;
