# Date Range

The DateRange class parses a string representing a date.

## Install
```
yarn add bring-back-starman/date-range
```

## How to use
```
import DateRange from 'date-range';

new DateRange('2019');
// DateRange {
//   type: DateRange.Type.YEAR,
//   from: '2019-01-01T00:00:00+01:00',
//   to: '2020-01-01T00:00:00+01:00' }

new DateRange('2018 Q3');
// DateRange {
//   type: DateRange.Type.QUARTER,
//   from: '2018-07-01T00:00:00+02:00',
//   to: '2018-10-01T00:00:00+02:00' }

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
