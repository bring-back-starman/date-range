const moment = require('moment');
const _ = require('lodash');


const Parts = {
  TIME: 't',
  DAY: 'd',
  MONTH: 'm',
  QUARTER: 'q',
  HALF: 'h',
  YEAR: 'y',
  SKIP: 's',
};

function mapPartType(part, numberOfParts, alreadyFound = []) {
  if (['tba', 'tbd', 'net'].includes(part.toLowerCase())) {
    return {
      value: null,
      type: Parts.SKIP,
    };
  }

  if (part.match(/^20\d{2}$/)) {
    return {
      value: parseInt(part),
      type: Parts.YEAR,
    };
  }

  if (moment(part, ['MMM']).isValid()) {
    return {
      value: parseInt(moment(part, ['MMM']).format('M')),
      type: Parts.MONTH,
    };
  }

  if (part.match(/^Q[1-4]$/)) {
    return {
      value: parseInt(part[1]),
      type: Parts.QUARTER,
    };
  }

  if (part.match(/^H[12]$/)) {
    return {
      value: parseInt(part[1]),
      type: Parts.HALF,
    };
  }

  if (part.match(/^\d{1,2}$/)) {
    const val = parseInt(part);

    // Cannot be a day
    if (val > 31) {
      return {
        value: parseInt('20' + part),
        type: Parts.YEAR,
      };
    }

    // Cannot be a year
    if (part.length === 1) {
      return {
        value: val,
        type: Parts.DAY,
      };
    }

    if (alreadyFound.includes(Parts.DAY) && !alreadyFound.includes(Parts.YEAR)) {
      return {
        value: parseInt('20' + part),
        type: Parts.YEAR,
      };
    }

    if (alreadyFound.includes(Parts.YEAR) && !alreadyFound.includes(Parts.DAY)) {
      return {
        value: val,
        type: Parts.DAY,
      };
    }

    if (numberOfParts === 2) {
      return {
        value: parseInt('20' + part),
        type: Parts.YEAR,
      };
    }
  }

  if (part.match(/^\[?([01]\d|2[0-3]):[0-5]\d]?$/)) {
    return {
      value: _.trim(part, '[]'),
      type: Parts.TIME,
    };
  }
}

function sameValues(a, b) {
  if (a.length !== b.length) {
    return false;
  }

  return a.every(v => b.includes(v));
}

class DateRange {
  constructor(value) {
    if (!_.isString(value)) {
      throw new Error('Value must be a string');
    }

    // Map obvious types
    let parts = value.trim().split(/\s+/).map(part => ({ part, ...mapPartType(part)}));

    let foundParts = _.map(parts, 'type').filter(_.identity);

    // Check for doubles
    if (foundParts.length !== _.uniq(foundParts).length) {
      throw new Error('Could not parse date "' + value + '", same part found multiple times');
    }

    // Try again to map remaining unknown parts knowing which part were already found
    parts = parts.map(part => part.type ? part : { part: part.part, ...mapPartType(part.part, parts.length, foundParts)});

    // Handle "23 Apr 18" format
    if (_.isEqual(_.map(parts, 'type'), [undefined, Parts.MONTH, undefined]) && parts[0].part.match(/^\d{2}$/) && parts[2].part.match(/^\d{2}$/)) {
      parts[0] = {
        ...parts[0],
        value: parts[0].part,
        type: Parts.DAY,
      };

      parts[2] = {
        ...parts[2],
        value: parts[2].part,
        type: Parts.YEAR,
      };
    }

    // Remove SKIP parts
    parts = parts.filter(({ type }) => type !== Parts.SKIP);
    foundParts = _.map(parts, 'type');

    if (foundParts.includes(undefined)) {
      throw new Error('Could not parse date "' + value + '", some parts are still undefined');
    }

    const data = {};

    parts.forEach(part => data[part.type] = part.value);

    // Build
    if (sameValues(foundParts, [])) {
      this.type = DateRange.Type.TBA;
    }

    if (sameValues(foundParts, [Parts.YEAR])) {
      this.type = DateRange.Type.YEAR;
      const from = moment(data[Parts.YEAR], 'YYYY');
      this.from = from.format();
      this.to = from.add(1, 'year').format();
    }

    if (sameValues(foundParts, [Parts.YEAR, Parts.HALF])) {
      this.type = DateRange.Type.HALF;
      const from = moment(data[Parts.YEAR], 'YYYY').add(6 * (data[Parts.HALF] - 1), 'months');
      this.from = from.format();
      this.to = from.add(6, 'months').format();
    }

    if (sameValues(foundParts, [Parts.YEAR, Parts.QUARTER])) {
      this.type = DateRange.Type.QUARTER;
      const from = moment(data[Parts.YEAR], 'YYYY').add(3 * (data[Parts.QUARTER] - 1), 'months');
      this.from = from.format();
      this.to = from.add(3, 'months').format();
    }

    if (sameValues(foundParts, [Parts.YEAR, Parts.MONTH])) {
      this.type = DateRange.Type.MONTH;
      const from = moment(data[Parts.YEAR] + '-' + data[Parts.MONTH], 'YYYY-MM');
      this.from = from.format();
      this.to = from.add(1, 'months').format();
    }

    if (sameValues(foundParts, [Parts.YEAR, Parts.MONTH, Parts.DAY])) {
      this.type = DateRange.Type.DATE;
      const from = moment(data[Parts.YEAR] + '-' + data[Parts.MONTH] + '-' + data[Parts.DAY], 'YYYY-MM-DD');
      this.from = from.format();
      this.to = from.add(1, 'day').format();
    }

    if (sameValues(foundParts, [Parts.YEAR, Parts.MONTH, Parts.DAY, Parts.TIME])) {
      this.type = DateRange.Type.DATETIME;
      const from = moment(data[Parts.YEAR] + '-' + data[Parts.MONTH] + '-' + data[Parts.DAY] + 'T' + data[Parts.TIME], 'YYYY-MM-DDTHH:mm');
      this.from = from.format();
      this.to = from.add(1, 'minute').format();
    }
  }
}

DateRange.Type = {
  DATETIME: 'dt',
  DATE: 'd',
  MONTH: 'm',
  QUARTER: 'q',
  HALF: 'h',
  YEAR: 'y',
  TBA: 'n',
};

module.exports = DateRange;