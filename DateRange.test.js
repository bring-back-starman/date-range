const DateRange = require('./index');
const { TBA, YEAR, HALF, QUARTER, MONTH, DATE, DATETIME } = DateRange.Type;

const shouldParse = (input, type, from, to) => {
  const date = new DateRange(input);
  expect(date).toHaveProperty('type', type);
  expect(date).toHaveProperty('from', from);
  expect(date).toHaveProperty('to', to);
};

const duration = (value) => new DateRange(value).getDuration().humanize();
const overlap = (v1, v2) => new DateRange(v1).getOverlapDuration(v2).humanize();

const expectOverlap = (v1, v2, duration) => {
  expect(overlap(v1, v2)).toBe(duration);
  expect(overlap(v2, v1)).toBe(duration);
};

const expectHumanized = (value, humanized) => expect(new DateRange(value).humanize()).toBe(humanized);

test('TBA', () => {
  shouldParse('TBA', TBA);
  shouldParse('TBD', TBA);
  shouldParse('To Be  Decided', TBA);
});

test('Year', () => {
  shouldParse('2019', YEAR, '2019-01-01T00:00:00', '2020-01-01T00:00:00');
});

test('Half', () => {
  shouldParse('2018 H1', HALF, '2018-01-01T00:00:00', '2018-07-01T00:00:00');
  shouldParse('18 H1',   HALF, '2018-01-01T00:00:00', '2018-07-01T00:00:00');
  shouldParse('H2 2018', HALF, '2018-07-01T00:00:00', '2019-01-01T00:00:00');
  shouldParse('H2 18',   HALF, '2018-07-01T00:00:00', '2019-01-01T00:00:00');
});

test('Quarter', () => {
  shouldParse('2018 Q1', QUARTER, '2018-01-01T00:00:00', '2018-04-01T00:00:00');
  shouldParse('18 Q2',   QUARTER, '2018-04-01T00:00:00', '2018-07-01T00:00:00');
  shouldParse('Q3 2018', QUARTER, '2018-07-01T00:00:00', '2018-10-01T00:00:00');
  shouldParse('Q4 18',   QUARTER, '2018-10-01T00:00:00', '2019-01-01T00:00:00');
});

test('Month', () => {
  shouldParse('2018 Apr',     MONTH, '2018-04-01T00:00:00', '2018-05-01T00:00:00');
  shouldParse('jan 2018 ',    MONTH, '2018-01-01T00:00:00', '2018-02-01T00:00:00');
  shouldParse('December 18',  MONTH, '2018-12-01T00:00:00', '2019-01-01T00:00:00');
  shouldParse('18  november', MONTH, '2018-11-01T00:00:00', '2018-12-01T00:00:00');
});

test('Date', () => {
  shouldParse('dec 25 2020',      DATE, '2020-12-25T00:00:00', '2020-12-26T00:00:00');
  shouldParse('2018 Apr 2',       DATE, '2018-04-02T00:00:00', '2018-04-03T00:00:00');
  shouldParse('02 December 2018', DATE, '2018-12-02T00:00:00', '2018-12-03T00:00:00');
  shouldParse('17 jan 18',        DATE, '2018-01-17T00:00:00', '2018-01-18T00:00:00');
});

test('Date Time', () => {
  shouldParse('dec 25 2020 18:31',      DATETIME, '2020-12-25T18:31:00', '2020-12-25T18:32:00');
  shouldParse('2018 Apr 2 [20:30]',     DATETIME, '2018-04-02T20:30:00', '2018-04-02T20:31:00');
  shouldParse('2018 Mar 29 [15:19]',    DATETIME, '2018-03-29T15:19:00', '2018-03-29T15:20:00');
  shouldParse('02 December 15:07 2018', DATETIME, '2018-12-02T15:07:00', '2018-12-02T15:08:00');
});

test('Constructor', () => {
  shouldParse(new DateRange('17 jan 18'), DATE, '2018-01-17T00:00:00', '2018-01-18T00:00:00');
  shouldParse({
    type: DATE,
    from:'2018-01-17T00:00:00',
    to: '2018-01-18T00:00:00',
  }, DATE, '2018-01-17T00:00:00', '2018-01-18T00:00:00');
});

test('Duration', () => {
  expect(duration('13 Jan 2019 16:30')).toBe('a minute');
  expect(duration('7 Apr 18')).toBe('a day');
  expect(duration('Aug 18')).toBe('a month');
  expect(duration('Q3 18')).toBe('3 months');
  expect(duration('H1 18')).toBe('6 months');
  expect(duration('2020')).toBe('a year');
});

test('Overlap', () => {
  expectOverlap('Jan 18', 'January 2018', 'a month');
  expectOverlap('Jan 18', '6 Jan 18', 'a day');
  expectOverlap('Q2 18', 'H1 18', '3 months');
  expectOverlap('jan 18', {
    type: DATE,
    from:'2018-01-20T00:00:00',
    to: '2018-02-08T00:00:00',
  }, '12 days');
  expect(new DateRange('Jan 18').getOverlapDuration('2020').asSeconds()).toBeLessThan(0);
});

test('Humanize', () => {
  const y = new Date().getFullYear();

  expectHumanized('TBD', 'To be announced');
  expectHumanized('H2 ' + y, 'End of the year');
  expectHumanized('H1 2030', 'Early 2030');
  expectHumanized('Q2 ' + y, '2nd quarter');
  expectHumanized('Q3 2030', 'Q3 2030');
  expectHumanized('jan ' + y, 'January');
  expectHumanized('jan 2030', 'Jan 2030');
  expectHumanized('10 apr ' + y, 'April 10');
  expectHumanized('10 apr 2030', 'Apr 10, 2030');
});

describe('Time zone', () => {
  test('set time zone', () => {
    const range = new DateRange('dec 25 2020 18:31');
    range.setTimeZone('America/New_York');

    expect(range).toHaveProperty('from', '2020-12-25T18:31:00-05:00');
    expect(range).toHaveProperty('to', '2020-12-25T18:32:00-05:00');
  });

  test('set time zone', () => {
    const range1 = new DateRange('dec 25 2020 12:00');
    range1.setTimeZone('America/New_York');

    const range2 = new DateRange('dec 25 2020 12:00');
    range2.setTimeZone('Europe/Paris');

    expect(range1.getOverlapDuration(range2).asHours()).toBeCloseTo(-6, 1);
  });
});