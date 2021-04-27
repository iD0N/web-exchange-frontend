import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';
import cn from 'classnames';

import { CONTRACT_TYPE } from '../../../../../common/enums';
import { Dropdown, Value } from '../../../../../common/components/trader';
import {
  getContractCategoryName,
  getSeriesLongName,
} from '../../../../../common/utils/translationMaps';

const align = { offset: [0, 1] };

const monthMap = {
  F: 'Jan',
  G: 'Feb',
  H: 'Mar',
  J: 'Apr',
  K: 'May',
  M: 'Jun',
  N: 'Jul',
  Q: 'Aug',
  U: 'Sep',
  V: 'Oct',
  X: 'Nov',
  Z: 'Dec',
}

function convertMonthCodeToLongName(monthCode) {
  if (monthCode === 'PERP')
    return 'Perp'

  const month = monthMap[monthCode[0]];
  const year = '20'+monthCode.substring(1);

  return month + ' ' + year;
}

const ContractBarItem = ({
  contracts,
  underlying,
  price,
  priceDecimals,
  direction,
  openGlobalContract,
  globalContractCode,
  selected,
}) => {
  const { contractCode, longName } = contracts[CONTRACT_TYPE.FUTURE]
    ? contracts[CONTRACT_TYPE.FUTURE][0]
    : contracts[CONTRACT_TYPE.SPOT][0];
  return (
    <Dropdown
      align={align}
      fullHeight
      hoverTrigger
      overlayClassName="contract-bar-item-overlay"
      triggerClassName={cn('contract-bar-item-trigger', {
        'contract-bar-item-trigger-selected': selected,
      })}
      overlay={
        <>
          <div className="inner">
            {Object.entries(contracts).map(([contractType, contracts]) => {
              return (
                contracts.length !== 0 && (
                  <div className="column" key={contractType}>
                    <div className="header">{getContractCategoryName(contractType)}</div>
                    <>
                      {contracts.map(({ contractCode, expiryName, type, spreadContractCodeFront, spreadContractCodeBack }) => (
                        <div
                          key={contractCode}
                          className={cn('contract', {
                            'contract-selected': globalContractCode === contractCode,
                          })}
                          onClick={() => openGlobalContract(contractCode)}
                        >
                          {type === CONTRACT_TYPE.SWAP ? (
                            <Trans i18nKey="trader.contractBar.petpetual">Perpetual</Trans>
                          ) : type === CONTRACT_TYPE.SPOT ? (
                            contractCode
                          ) : type === CONTRACT_TYPE.FUTURE_SPREAD ? (
                            convertMonthCodeToLongName(spreadContractCodeFront.split('-')[1]) + ' / ' + convertMonthCodeToLongName(spreadContractCodeBack.split('-')[1])
                          ) : (
                            expiryName
                          )}
                        </div>
                      ))}
                    </>
                  </div>
                )
              );
            })}
          </div>
          <div className="inner-border" />
        </>
      }
    >
      <div onClick={() => openGlobalContract(contractCode)}>
        <div className="contract-name">{getSeriesLongName(underlying) || longName}</div>
        <div>
          {price !== '0' && (
            <Value.Numeric
              type="price"
              withIcon
              value={price}
              decimals={priceDecimals}
              direction={direction}
            />
          )}
        </div>
      </div>
    </Dropdown>
  );
};

ContractBarItem.propTypes = {
  contracts: PropTypes.object,
  underlying: PropTypes.string.isRequired,
  price: PropTypes.string,
  priceDecimals: PropTypes.number,
  direction: PropTypes.string,
  openGlobalContract: PropTypes.func.isRequired,
  selected: PropTypes.bool.isRequired,
};

export default memo(ContractBarItem);
