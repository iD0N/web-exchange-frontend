import { t } from '../services/i18n';

export const getSeriesLongName = contractCode =>
  t(`contracts.longNames.${contractCode}`, { defaultValue: null });

export const getContractCategoryName = (contractType, defaultValue) =>
  t(`contracts.type.${contractType}`, { defaultValue });
