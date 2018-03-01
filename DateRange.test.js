const DateRange = require('./index');

test('TBA', () => {
  expect(new DateRange('TBA')).toHaveProperty('type', DateRange.Type.TBA);
  expect(new DateRange('TBD')).toHaveProperty('type', DateRange.Type.TBA);
  expect(new DateRange(' To Be  Decided ')).toHaveProperty('type', DateRange.Type.TBA);
});

test('Year', () => {
  expect(new DateRange('2019')).toHaveProperty('type', DateRange.Type.YEAR);
  expect(new DateRange(' 2019  ')).toHaveProperty('type', DateRange.Type.YEAR);
});

test('Half', () => {
  expect(new DateRange('2018 H1')).toHaveProperty('type', DateRange.Type.HALF);
  expect(new DateRange('H2 2018 ')).toHaveProperty('type', DateRange.Type.HALF);
  expect(new DateRange('H1 18')).toHaveProperty('type', DateRange.Type.HALF);
  expect(new DateRange(' 18  H2')).toHaveProperty('type', DateRange.Type.HALF);
});

test('Quarter', () => {
  expect(new DateRange('2018 Q1')).toHaveProperty('type', DateRange.Type.QUARTER);
  expect(new DateRange('Q2 2018 ')).toHaveProperty('type', DateRange.Type.QUARTER);
  expect(new DateRange('Q3 18 ')).toHaveProperty('type', DateRange.Type.QUARTER);
  expect(new DateRange(' 18  Q4')).toHaveProperty('type', DateRange.Type.QUARTER);
});

test('Month', () => {
  expect(new DateRange('2018 Apr')).toHaveProperty('type', DateRange.Type.MONTH);
  expect(new DateRange('Jan 2018 ')).toHaveProperty('type', DateRange.Type.MONTH);
  expect(new DateRange('December 18')).toHaveProperty('type', DateRange.Type.MONTH);
  expect(new DateRange(' 18  April')).toHaveProperty('type', DateRange.Type.MONTH);
});

test('Date', () => {
  expect(new DateRange('dec 25 2020')).toHaveProperty('type', DateRange.Type.DATE);
  expect(new DateRange('2018 Apr 2')).toHaveProperty('type', DateRange.Type.DATE);
  expect(new DateRange('02 December 2018')).toHaveProperty('type', DateRange.Type.DATE);
});

test('Date Time', () => {
  expect(new DateRange('dec 25 2020 18:31')).toHaveProperty('type', DateRange.Type.DATETIME);
  expect(new DateRange('2018 Apr 2 [20:30]')).toHaveProperty('type', DateRange.Type.DATETIME);
  expect(new DateRange('02 December 15:07 2018')).toHaveProperty('type', DateRange.Type.DATETIME);
});