const moment = require('moment');
const _ = require('lodash');

// Possible types of a Part
const TIME = 't';
const DAY = 'd';
const MONTH = 'm';
const QUARTER = 'q';
const HALF = 'h';
const YEAR = 'y';
const SKIP = 's';
const TYPES = [TIME, DAY, MONTH, QUARTER, HALF, YEAR, SKIP];

// Parts that are recognized but should be skipped
const skippableParts = ['tba', 'tbd', 'net'];

class Part {
  constructor(value) {
    this.raw = value.trim().toLowerCase();

    if (skippableParts.includes(this.raw)) {
      this.value = null;
      this.type = SKIP;
    }

    // Anything that looks like 20XX is a year
    if (this.raw.match(/^20\d{2}$/)) {
      this.setYear();
    }

    // Use moment to detect months (Apr and April works)
    if (moment(this.raw, ['MMM']).isValid()) {
      this.setMonth();
    }

    // Anything that looks like QX is a quarter
    if (this.raw.match(/^q[1-4]$/)) {
      this.setQuarter();
    }

    // Anything that looks like HX is a half year
    if (this.raw.match(/^h[12]$/)) {
      this.setHalfYear();
    }

    // A one digit number
    if (this.raw.match(/^\d$/)) {
      this.setDay();
    }

    // A two digit number greater than 31 cannot be a day, it must be a year
    if (this.raw.match(/^\d{2}$/) && parseInt(this.raw) > 31) {
      this.setYear();
    }

    // Anything that looks like HH:MM is a time
    if (this.raw.match(/^\[?([01]\d|2[0-3]):[0-5]\d]?$/)) {
      this.setTime();
    }
  }

  /**
   * Try to guess type with info about other parts
   * @param foundTypes List of found types, this part cannot be one of them
   * @param numberOfParts Number of parts found
   */
  guessTypeKnowing(foundTypes, numberOfParts) {
    if (this.type) {
      return;
    }

    const found = (type) => foundTypes.includes(type);
    const foundOnly = (type) => found(type) && foundTypes.length === 1;

    // A two digit number
    if (this.raw.match(/^\d{2}$/)) {
      // Found day but not year
      if (found(DAY) && !found(YEAR)) {
        this.setYear();
      }

      // Found year but not day
      if (found(YEAR) && !found(DAY)) {
        this.setDay();
      }

      // Found only two parts and year is missing
      if (numberOfParts === 2 && (foundOnly(HALF) || foundOnly(QUARTER) || foundOnly(MONTH))) {
        this.setYear()
      }
    }
  }

  setMonth() {
    this.value = parseInt(moment(this.raw, ['MMM']).format('M'));
    this.type = MONTH;
  }

  setQuarter() {
    this.value = parseInt(this.raw[1]);
    this.type = QUARTER;
  }

  setHalfYear() {
    this.value = parseInt(this.raw[1]);
    this.type = HALF;
  }

  setTime() {
    this.value = _.trim(this.raw, '[]');
    this.type = TIME;
  }

  setDay() {
    this.value = parseInt(this.raw);
    this.type = DAY;
  }

  setYear() {
    if (this.raw.match(/^\d{2}$/)) {
      this.value = parseInt('20' + this.raw);
    } else {
      this.value = parseInt(this.raw);
    }

    this.type = YEAR;
  }
}

class PartsList {
  constructor(value) {
    this.parts = value
      .trim()
      .split(/\s+/)
      .map(part => new Part(part))
      .filter(({ type }) => type !== SKIP)
    ;
  }

  /**
   * Get an array of types found
   * @param includeUndefined Set to false to filter out undefined
   */
  types(includeUndefined = true) {
    return _.map(this.parts, 'type').filter(includeUndefined ? _.stubTrue : _.identity)
  }

  /**
   * @returns {boolean} True if at least two parts have the same type (excluding undefined)
   */
  hasDuplicateTypes() {
    const types = this.types(false);

    return types.length !== _.uniq(types).length
  }

  /**
   * Manually handle special snowflakes
   */
  guessRemainingTypes() {
    this.parts.forEach(part => part.guessTypeKnowing(this.types(false), this.parts.length));

    // Handle "23 Apr 18" format
    if (this.isFormat([/^\d{2}$/, MONTH, /^\d{2}$/])) {
      this.parts[0].setDay();
      this.parts[2].setYear();
    }
  }

  /**
   * Checks if this list is a given format
   * @param format An array of format for each part, supports PartType and RegExp
   */
  isFormat(format) {
    if (format.length !== this.parts.length) {
      return false;
    }

    return format.every((f, index) => {
      if (_.isString(f) && TYPES.includes(f)) {
        return this.parts[index].type === f;
      }

      if (_.isString(f)) {
        return this.parts[index].raw === f;
      }

      if (_.isRegExp(f)) {
        return this.parts[index].raw.match(f);
      }

      throw new Error('Unsupported format');
    });
  }

  hasExactlyTypes(types) {
    let ownTypes = this.types();

    if (types.length !== ownTypes.length) {
      return false;
    }

    return types.every(t => ownTypes.includes(t));
  }

  get(type) {
    return _.find(this.parts, { type });
  }
}

class DateRange {
  constructor(value) {
    if (!_.isString(value)) {
      throw new Error('Value must be a string');
    }

    let parts = new PartsList(value);

    if (parts.isFormat(['to', 'be', 'decided'])) {
      this.type = DateRange.Type.TBA;
      return;
    }

    if (parts.hasDuplicateTypes()) {
      throw new Error('Could not parse date "' + value + '", same part found multiple times');
    }

    parts.guessRemainingTypes();

    if (parts.types().includes(undefined)) {
      throw new Error('Could not parse date "' + value + '", some parts are still undefined');
    }

    // Build range based on what parts we found

    if (parts.hasExactlyTypes([])) {
      this.type = DateRange.Type.TBA;
    }

    if (parts.hasExactlyTypes([YEAR])) {
      this.type = DateRange.Type.YEAR;
      this.setRange(moment(parts.get(YEAR), 'YYYY'), 1, 'year');
    }

    if (parts.hasExactlyTypes([YEAR, HALF])) {
      this.type = DateRange.Type.HALF;
      this.setRange(moment(parts.get(YEAR), 'YYYY').add(6 * (parts.get(HALF) - 1), 'months'), 6, 'months');
    }

    if (parts.hasExactlyTypes([YEAR, QUARTER])) {
      this.type = DateRange.Type.QUARTER;
      this.setRange(moment(parts.get(YEAR), 'YYYY').add(3 * (parts.get(QUARTER) - 1), 'months'), 3, 'months');
    }

    if (parts.hasExactlyTypes([YEAR, MONTH])) {
      this.type = DateRange.Type.MONTH;
      this.setRange(moment(parts.get(YEAR) + '-' + parts.get(MONTH), 'YYYY-MM'), 1, 'month');
    }

    if (parts.hasExactlyTypes([YEAR, MONTH, DAY])) {
      this.type = DateRange.Type.DATE;
      this.setRange(moment(parts.get(YEAR) + '-' + parts.get(MONTH) + '-' + parts.get(DAY), 'YYYY-MM-DD'), 1, 'day');
    }

    if (parts.hasExactlyTypes([YEAR, MONTH, DAY, TIME])) {
      this.type = DateRange.Type.DATETIME;
      this.setRange(moment(parts.get(YEAR) + '-' + parts.get(MONTH) + '-' + parts.get(DAY) + 'T' + parts.get(TIME), 'YYYY-MM-DDTHH:mm'), 1, 'minute');
    }
  }

  setRange(momentFrom, size, unit) {
    this.from = momentFrom.format();
    this.to = momentFrom.add(size, unit).format();
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