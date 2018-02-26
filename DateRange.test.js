const DateRange = require('./index');

test('TBA', () => {
  new DateRange('TBA');
  new DateRange('TBD');
});

test('Year', () => {
  new DateRange('2019');
  new DateRange('  2019  ');
});

test('Half', () => {
  new DateRange('2018 H1');
  new DateRange('H2 2018 ');
  new DateRange('H1 18');
  new DateRange(' 18  H2');
});

test('Quarter', () => {
  new DateRange('2018 Q1');
  new DateRange('Q2 2018 ');
  new DateRange('Q3 18');
  new DateRange(' 18  Q4');
});

test('Month', () => {
  new DateRange('2018 Apr');
  new DateRange('Jan 2018 ');
  new DateRange('December 18');
  new DateRange(' 18  April');
});

test('Date', () => {
  new DateRange('dec 25 2020');
  new DateRange('2018 Apr 2');
  new DateRange('02 December 2018');
});

test('Date Time', () => {
  new DateRange('dec 25 2020 18:31');
  new DateRange('2018 Apr 2 [20:30]');
  new DateRange('02 December 15:07 2018');
});