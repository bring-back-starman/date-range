const DateRange = require('./index');
const { TBA, YEAR, HALF, QUARTER, MONTH, DATE, DATETIME } = DateRange.Type;

const shouldParse = (input, type, from, to) => {
  const date = new DateRange(input);

  expect(date).toHaveProperty('type', type);
  expect(date).toHaveProperty('from', from);
  expect(date).toHaveProperty('to', to);
};

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