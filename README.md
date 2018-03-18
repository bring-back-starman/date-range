# Date Range

The DateRange class parses a string representing a date.

## Install
### Yarn
```
yarn add bring-back-starman/date-range
```

### Npm
```
npm install bring-back-starman/date-range --save
```

## How to use
### Parsing
```js
import DateRange from 'date-range';

const range1 = new DateRange('2019');
// DateRange {
//   type: DateRange.Type.YEAR,
//   from: '2019-01-01T00:00:00',
//   to: '2020-01-01T00:00:00' }

const range2 = new DateRange('2018 Q3');
// DateRange {
//   type: DateRange.Type.QUARTER,
//   from: '2018-07-01T00:00:00',
//   to: '2018-10-01T00:00:00' }

const range3 = new DateRange(range1);
const range4 = new DateRange({
  type: DateRange.Type.QUARTER,
  from: '2018-07-01T00:00:00',
  to: '2018-10-01T00:00:00',
});
```

### Durations and overlaps
`getDuration` and `getOverlapDuration` return a moment [Duration](https://momentjs.com/docs/#/durations/) object.
```js
import DateRange from 'date-range';

const range = DateRange('Jan 18');

range.getDuration().humanize(); // 'a month'
range.getOverlapDuration('6 january 2018').humanize(); // 'a day'
```

### Display
```js
import DateRange from 'date-range';

new DateRange('H1 2022').humanize(); // 'Early 2022'
new DateRange('Jan 2018').humanize(); // 'January'
```

## Supported formats
The order of each part is not important.

- **TBD:** TBD, TBA, empty
- **Year:** 2019
- **Half:** 2019 H1, H2 2020, H2 18
- **Quarter:** 2018 Q1, Q4 2022, Q2 19
- **Month:** 2019 Apr, Jan 2020, December 2022, Dec 18
- **Date:** 12 Feb 18, 2022 Jun 20
- **Date Time:** 2018 Apr 2 \[20:30], dec 25 2020 18:31
