import moment from 'moment';
import BigNumber from 'bignumber.js';

import { transformApiResponse } from '../../../../../../common/utils/apiHelpers';

export const MAX_BUCKETS = 300;

export const isInSameBar = (t0, t1, resolution) =>
  Math.floor(t0 / resolution) === Math.floor(t1 / resolution);

export const createIntervals = (startDate, endDate, minutes) => {
  const createInterval = date => {
    const mEnd = moment(date);
    const mStart = moment(mEnd).subtract(minutes, 'minutes');

    return { startStr: mStart.toISOString(), endStr: mEnd.toISOString() };
  };

  let intervals = [];
  let adjustedEndDate = endDate;

  while (startDate && moment(adjustedEndDate).isAfter(startDate)) {
    const { startStr, endStr } = createInterval(adjustedEndDate);
    adjustedEndDate = startStr;
    intervals = [
      { startStr: moment.max(moment(startStr), moment(startDate)).toISOString(), endStr },
      ...intervals,
    ];
  }

  return intervals;
};

export const createQueryIntervals = (startDate, endDate, minutes, maxBuckets = MAX_BUCKETS) =>
  createIntervals(startDate, moment(endDate).ceil(minutes, 'minutes'), minutes * maxBuckets);

export const generateGappedQuotes = startDate => [
  {
    time: Date.parse(startDate),
    open: null,
    high: null,
    low: null,
    close: null,
    volume: 0,
    indexPrice: null,
  },
];

export const transform = res =>
  transformApiResponse(res, ({ candles }) =>
    candles.map(([DT, Open, High, Low, Close, Volume, IndexPrice]) => ({
      time: Date.parse(DT),
      open: parseFloat(Open),
      high: parseFloat(High),
      low: parseFloat(Low),
      close: parseFloat(Close),
      volume: parseFloat(Volume),
      indexPrice: parseFloat(IndexPrice),
    }))
  );

export const updateCandle = (nextCandle, lastBar, resolution) => {
  if (!lastBar || !isInSameBar(nextCandle.time, lastBar.time, resolution)) {
    // return new
    return { ...nextCandle, time: Math.floor(nextCandle.time / resolution) * resolution };
  }

  // return updated previous candle
  return {
    time: lastBar.time,
    open: lastBar.open,
    high: lastBar.high > nextCandle.high ? lastBar.high : nextCandle.high,
    low: lastBar.low < nextCandle.low ? lastBar.low : nextCandle.low,
    close: nextCandle.close,
    volume: BigNumber(nextCandle.volume)
      .plus(lastBar.volume)
      .toNumber(),
    indexPrice: nextCandle.indexPrice,
  };
};

export const reBucket = (quotes, resolutioninMs) => {
  const newQuotes = [];
  let lastBar = {};

  while (quotes.length > 0) {
    const [nextCandle] = quotes;

    const updated = updateCandle(nextCandle, lastBar, resolutioninMs);

    if (lastBar.time && updated.time !== lastBar.time) {
      // adding new candle, push old one in and keep updating the cursor
      newQuotes.push(lastBar);
    }

    lastBar = updated;

    quotes.shift();
  }

  if (lastBar.time) {
    newQuotes.push(lastBar);
  }

  return newQuotes;
};

/*
  ceil and round are from https://github.com/SpotOnInc/moment-round
  which we are putting here because it does not appear to play nicely
  with webpack as advertised.
  TODO: remove this when the backend begins sending back the actual queried
  start and end times
*/

moment.fn.round = function(precision, key, direction) {
  direction = direction || 'round';
  var methods = {
    hours: { name: 'Hours', maxValue: 24 },
    minutes: { name: 'Minutes', maxValue: 60 },
    seconds: { name: 'Seconds', maxValue: 60 },
    milliseconds: { name: 'Milliseconds', maxValue: 1000 },
  };
  var keys = {
    mm: methods.milliseconds.name,
    milliseconds: methods.milliseconds.name,
    Milliseconds: methods.milliseconds.name,
    s: methods.seconds.name,
    seconds: methods.seconds.name,
    Seconds: methods.seconds.name,
    m: methods.minutes.name,
    minutes: methods.minutes.name,
    Minutes: methods.minutes.name,
    H: methods.hours.name,
    h: methods.hours.name,
    hours: methods.hours.name,
    Hours: methods.hours.name,
  };
  var value = 0;
  var rounded = false;
  var subRatio = 1;
  var maxValue;

  // make sure key is plural
  if (key.length > 1 && key !== 'mm' && key.slice(-1) !== 's') {
    key += 's';
  }
  key = keys[key].toLowerCase();

  //control
  if (!methods[key]) {
    throw new Error(
      'The value to round is not valid. Possibles ["hours", "minutes", "seconds", "milliseconds"]'
    );
  }

  var get = 'get' + methods[key].name;
  var set = 'set' + methods[key].name;

  for (var k in methods) {
    if (k === key) {
      value = this._d[get]();
      maxValue = methods[k].maxValue;
      rounded = true;
    } else if (rounded) {
      subRatio *= methods[k].maxValue;
      value += this._d['get' + methods[k].name]() / subRatio;
      this._d['set' + methods[k].name](0);
    }
  }

  value = Math[direction](value / precision) * precision;
  value = Math.min(value, maxValue);
  this._d[set](value);

  return this;
};

moment.fn.ceil = function(precision, key) {
  return this.round(precision, key, 'ceil');
};
