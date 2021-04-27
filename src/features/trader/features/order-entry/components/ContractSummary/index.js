import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';
import BigNumber from 'bignumber.js';

import { t } from '../../../../../../common/services/i18n';
import { isProd } from '../../../../../../config';
import { CONTRACT_TYPE, CONTRACT_TYPE_LABEL } from '../../../../../../common/enums';
import { InfoTooltip, Value, Currency } from '../../../../../../common/components/trader';

const ContractSummaryWrapper = ({ children }) => <div className="contract-summary">{children}</div>;

ContractSummaryWrapper.propTypes = {
  children: PropTypes.node.isRequired,
};

const seriesCodeToArticle = {
  BTC: {
    [CONTRACT_TYPE.FUTURE]: isProd()
      ? 'https://support.crypto.io/hc/en-us/articles/360022864234-BTC-USD-Futures-Mainnet-'
      : 'https://support.crypto.io/hc/en-us/articles/360020204153-BTC-USD-Futures-Testnet-',
    [CONTRACT_TYPE.SWAP]: isProd()
      ? 'https://support.crypto.io/hc/en-us/articles/360025485633-BTC-PERP-Swap-Mainnet-'
      : 'https://support.crypto.io/hc/en-us/articles/360014297853-BTC-PERP-Swap-Testnet-',
  },
  ETH: {
    [CONTRACT_TYPE.FUTURE]: isProd()
      ? 'https://support.crypto.io/hc/en-us/articles/360020172834-ETH-USD-Futures'
      : 'https://support.crypto.io/hc/en-us/articles/360020172834-ETH-PERP-Swap-Testnet-',
    [CONTRACT_TYPE.SWAP]: isProd()
      ? 'https://support.crypto.io/hc/en-us/articles/360035896754-ETH-PERP-Swap-Mainnet-'
      : undefined,
    [CONTRACT_TYPE.SPOT]: isProd()
      ? 'https://support.crypto.io/hc/en-us/articles/360036153714-ETH-BTC-Spot-Mainnet-'
      : undefined,
  },
  BCH: {
    [CONTRACT_TYPE.FUTURE]:
      'https://support.crypto.io/hc/en-us/articles/360020544533-BCH-USD-Futures',
  },
  LTC: {
    [CONTRACT_TYPE.FUTURE]:
      'https://support.crypto.io/hc/en-us/articles/360020435413-LTC-USD-Futures',
  },
  US500: {
    [CONTRACT_TYPE.SWAP]: isProd()
      ? 'https://support.crypto.io/hc/en-us/articles/360025502673-US500-PERP-Swap-Mainnet-'
      : 'https://support.crypto.io/hc/en-us/articles/360024812734-US500-PERP-Swap-Testnet-',
  },
  USOIL: {
    [CONTRACT_TYPE.SWAP]: isProd()
      ? 'https://support.crypto.io/hc/en-us/articles/360036949034-USOIL-PERP-Swap-Mainnet-'
      : undefined,
  },
  XTZ: {
    [CONTRACT_TYPE.SWAP]: isProd()
      ? 'https://support.crypto.io/hc/en-us/articles/360033433854-XTZ-PERP-Swap-Mainnet-'
      : 'https://support.crypto.io/hc/en-us/articles/360034229714-XTZ-PERP-Swap-Testnet-',
  },
  EUR: {
    [CONTRACT_TYPE.SWAP]: isProd()
      ? 'https://support.crypto.io/hc/en-us/articles/360033383794-EUR-PERP-Swap-Mainnet-'
      : 'https://support.crypto.io/hc/en-us/articles/360034760193--EUR-PERP-Swap-Testnet-',
  },
  LINK: {
    [CONTRACT_TYPE.SWAP]: isProd()
      ? 'https://support.crypto.io/hc/en-us/articles/360035349953-LINK-PERP-Swap-Mainnet-'
      : 'https://support.crypto.io/hc/en-us/articles/360034227974-LINK-PERP-Swap-Testnet-',
  },
  GOLD: {
    [CONTRACT_TYPE.SWAP]: isProd()
      ? 'https://support.crypto.io/hc/en-us/articles/360030234573-GOLD-PERP-Swap-Mainnet-'
      : 'https://support.crypto.io/hc/en-us/articles/360029820834-GOLD-PERP-Swap-Testnet-',
  },
  USDT: {
    [CONTRACT_TYPE.SWAP]: isProd()
      ? 'https://support.crypto.io/hc/en-us/articles/360036663573--USDT-PERP-Swap-Mainnet-'
      : 'https://support.crypto.io/hc/en-us/articles/360035980034-USDT-PERP-Swap-Testnet-',
  },
  BRAZIL60: {
    [CONTRACT_TYPE.SWAP]: isProd()
      ? 'https://support.crypto.io/hc/en-us/articles/360037873354-BRAZIL60-PERP-Swap-Mainnet-'
      : undefined,
  },
  USDBRL: {
    [CONTRACT_TYPE.SWAP]: isProd()
      ? 'https://support.crypto.io/hc/en-us/articles/360038624633-USDBRL-PERP-Swap-Mainnet-'
      : undefined,
  },
};

const ContractCode = ({
  initialMarginPercent,
  liquidationMarginPercent,
  contractCode,
  longName,
  quoteCurrency,
  quoteLongName,
  seriesCode,
  underlying,
  type,
}) => {
  if (type === CONTRACT_TYPE.SPOT) {
    const elem = (
      <InfoTooltip
        title={
          <>
            <div>
              <strong>{contractCode} Spot Market</strong>
            </div>
            <div>
              {t('trader.contract.currency.base', { defaultValue: 'Base Currency: ' })}
              {underlying}
              {` (${longName})`}
            </div>
            <div>
              {t('trader.contract.currency.quote', { defaultValue: 'Quote Currency: ' })}
              {quoteCurrency}
              {quoteLongName ? ` (${quoteLongName})` : null}
            </div>
          </>
        }
      >
        <Value.Text>{contractCode}</Value.Text>
      </InfoTooltip>
    );
    return (
      <div className="contract-summary-item">
        <Value label={<Trans i18nKey="trader.contract.code">Contract</Trans>}>
          {seriesCodeToArticle[underlying] && seriesCodeToArticle[underlying][type] ? (
            <a
              href={seriesCodeToArticle[underlying][type]}
              target="_blank"
              rel="noopener noreferrer"
            >
              {elem}
            </a>
          ) : (
            elem
          )}
        </Value>
      </div>
    );
  }
  const elem = (
    <InfoTooltip
      title={
        <>
          <div>
            <strong>
              {t('trader.contract.margin.requirements', {
                contract: contractCode,
                defaultValue: `${contractCode} Margin Requirements`,
              })}
            </strong>
          </div>
          <div>
            {t('trader.contract.margin.initial', { defaultValue: 'Initial Margin: ' })}
            <Value.Numeric type="percentage" value={initialMarginPercent} />
          </div>
          <div>
            {t('trader.contract.margin.liquidation', {
              defaultValue: 'Liquidation Margin: ',
            })}
            <Value.Numeric type="percentage" value={liquidationMarginPercent} />
          </div>
        </>
      }
    >
      <Value.Text>{contractCode}</Value.Text>
    </InfoTooltip>
  );

  return (
    <div className="contract-summary-item">
      <Value label={<Trans i18nKey="trader.contract.code">Contract</Trans>}>
        {seriesCodeToArticle[seriesCode] && seriesCodeToArticle[seriesCode][type] ? (
          <a href={seriesCodeToArticle[seriesCode][type]} target="_blank" rel="noopener noreferrer">
            {elem}
          </a>
        ) : (
          elem
        )}
      </Value>
    </div>
  );
};

ContractCode.propTypes = {
  contractCode: PropTypes.string,
};

const ContractType = ({
  contractCode,
  funding: { indicativeFundingTime, indicativeFundingRate, nextFundingRate, nextFundingTime },
  value,
}) =>
  !!value && (
    <div className="contract-summary-item">
      <Value label={<Trans i18nKey="trader.contract.type">Type</Trans>}>
        <span className="capitalized">
          <Value.Text>{t(CONTRACT_TYPE_LABEL[value])}</Value.Text>
        </span>
      </Value>
    </div>
  );

ContractType.defaultProps = {
  funding: {},
};

const Funding = ({
  contractCode,
  funding: { indicativeFundingTime, indicativeFundingRate, nextFundingRate, nextFundingTime },
  value,
}) =>
  !!nextFundingRate && (
    <div className="contract-summary-item contract-summary-funding">
      <Value label={<Trans i18nKey="trader.contract.funding">Funding</Trans>}>
        <div className="contract-summary-finding-rate">
          <Value.Numeric type="percentage" value={nextFundingRate} decimals={6} />
        </div>
        <InfoTooltip
          title={
            (!!nextFundingRate || !!indicativeFundingRate) && (
              <div>
                <strong>
                  {t('trader.contract.swap.title', {
                    defaultValue: `${contractCode} Perpetual Swap Funding`,
                    contractCode,
                  })}
                </strong>
                {!!nextFundingRate && (
                  <div className="swap-tooltip-info">
                    <Value.Text>
                      <Trans i18nKey="trader.contract.swap.fundingRate">Funding Rate:</Trans>
                    </Value.Text>
                    <Value.Numeric type="percentage" value={nextFundingRate} decimals={6} />
                    <Value.Text>in</Value.Text>
                    <Value.Duration reverted verbose value={nextFundingTime} />
                  </div>
                )}
                {!!indicativeFundingRate && (
                  <div className="swap-tooltip-info">
                    <Value.Text>
                      <Trans i18nKey="trader.contract.swap.predictedRate">Predicted Rate:</Trans>
                    </Value.Text>
                    <Value.Numeric type="percentage" value={indicativeFundingRate} decimals={6} />
                    <Value.Text>in</Value.Text>
                    <Value.Duration reverted value={indicativeFundingTime} />
                  </div>
                )}
                <div className="swap-tooltip-info">
                  <Value.Text>
                    <Trans i18nKey="trader.contract.swap.info">
                      If positive, longs pay shorts. If negative, shorts pay longs.
                    </Trans>
                  </Value.Text>
                </div>
              </div>
            )
          }
        >
          <div className="contract-summary-funding-time">
            <Value.Text>in</Value.Text>
            <Value.Duration reverted verbose shorthand value={nextFundingTime} />
          </div>
        </InfoTooltip>
      </Value>
    </div>
  );

const MaxLeverage = ({
  contractCode: contract,
  effectiveLeverage,
  positionSize: position,
  value: maxLeverage,
  isLoggedIn,
}) =>
  !!maxLeverage && (
    <div className="contract-summary-item">
      <Value label={<Trans i18nKey="trader.contract.maxLeverage">Max. Lev.</Trans>}>
        <InfoTooltip
          title={
            <>
              <div>
                {t('trader.contract.maxLeverageTooltip', {
                  contract,
                  position,
                  maxLeverage,
                  defaultValue: `Max leverage for ${contract} at ${position} position is ${maxLeverage}x. As your position size increases, your maximum available leverage will decrease.`,
                })}
              </div>
              {isLoggedIn && (
                <>
                  <br />
                  <div>
                    {t('trader.contract.effectiveLeverage', {
                      contract,
                      defaultValue: `Effective Leverage (${contract} only): `,
                    })}
                    {!BigNumber(position).isZero() && BigNumber(position).isFinite()
                      ? `${effectiveLeverage}x`
                      : 'N/A'}
                  </div>
                </>
              )}
            </>
          }
        >
          <Value.Text>{maxLeverage}x</Value.Text>
        </InfoTooltip>
      </Value>
    </div>
  );

const LastTradePrice = ({ decimals, quoteCurrency, value }) =>
  value && (
    <div className="contract-summary-item">
      <Value
        label={
          <Trans i18nKey="trader.contract.lastTradePrice">
            Last
            <Currency inline value={quoteCurrency} />
          </Trans>
        }
      >
        <Value.Numeric decimals={decimals} type="price" value={value} />
      </Value>
    </div>
  );

LastTradePrice.propTypes = {
  value: PropTypes.string,
};

const AskPrice = ({ value }) => (
  <div className="contract-summary-item">
    <Value
      label={
        <Trans i18nKey="trader.contract.askPrice">
          Ask <Currency inline />
        </Trans>
      }
    >
      <Value.Numeric type="price" value={value} />
    </Value>
  </div>
);

AskPrice.propTypes = {
  value: PropTypes.string,
};

const BidPrice = ({ value }) => (
  <div className="contract-summary-item">
    <Value
      label={
        <Trans i18nKey="trader.contract.bidPrice">
          Bid <Currency inline />
        </Trans>
      }
    >
      <Value.Numeric type="price" value={value} />
    </Value>
  </div>
);

BidPrice.propTypes = {
  value: PropTypes.string,
};

ContractSummaryWrapper.ContractCode = memo(ContractCode);
ContractSummaryWrapper.LastTradePrice = memo(LastTradePrice);
ContractSummaryWrapper.AskPrice = memo(AskPrice);
ContractSummaryWrapper.BidPrice = memo(BidPrice);
ContractSummaryWrapper.MaxLeverage = memo(MaxLeverage);
ContractSummaryWrapper.ContractType = memo(ContractType);
ContractSummaryWrapper.Funding = memo(Funding);

export default ContractSummaryWrapper;
