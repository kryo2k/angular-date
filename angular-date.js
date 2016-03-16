/*!
* angular-date
* Simple & useful, native date manipulation library for Angular 1.x
* @license GPL
* @author Hans Doller <hans@ticonerd.com>
*/
angular.module('ngDate', [])
.service('$date', function () {

  var
  dateKeys = {
    week: ['wk','week','weeks'],
    ms:   ['ms','milli','millisecond','milliseconds'],
    sec:  ['s','sec','second','seconds'],
    min:  ['min','minute','minutes'],
    hr:   ['h','hr','hrs','hour','hours'],
    day:  ['d','day','days'],
    mon:  ['mon','month','months'],
    year: ['y','year','years']
  },
  unitMs = {
    ms:   1,
    sec:  1000,
    min:  60000,
    hr:   3600000,
    day:  8.64e7,
    week: 8.64e7 * 7
  };

  // DAYS OF WEEK
  this.SUNDAY    = 0;
  this.MONDAY    = 1;
  this.TUESDAY   = 2;
  this.WEDNESDAY = 3;
  this.THURSDAY  = 4;
  this.FRIDAY    = 5;
  this.SATURDAY  = 6;

  // MONTHS OF YEAR
  this.JANUARY   = 0;
  this.FEBRUARY  = 1;
  this.MARCH     = 2;
  this.APRIL     = 3;
  this.MAY       = 4;
  this.JUNE      = 5;
  this.JULY      = 6;
  this.AUGUST    = 7;
  this.SEPTEMBER = 8;
  this.OCTOBER   = 9;
  this.NOVEMBER  = 10;
  this.DECEMBER  = 11;

  // same as now(), but returns milliseconds.
  this.ms = function (now) {
    var ms = Date.now();
    if(angular.isDate(now)) {
      ms = now.getTime();
    }
    else if(angular.isNumber(now)) {
      ms = now;
    }
    else if(angular.isString(now)) {
      var tms = Date.parse(now);
      if(!isNaN(tms)) ms = tms;
    }
    return ms;
  };

  // get the current date
  this.now = function (now) {
    if(angular.isDate(now)) {
      return now;
    }

    return new Date(this.ms(now));
  };

  // validate a number to see if is a valid day of the week
  this.validDay = function (n) {
    return angular.isNumber(n) && !isNaN(n) && n >= this.SUNDAY && n <= this.SATURDAY;
  };

  // return date that is the nearest to the day provided from now
  this.nearestDay = function (day, now) {
    day = this.validDay(day) ? day : this.THURSDAY;

    // transform now to date
    now = this.now(this.ms(now)); // so we don't mod original date

    // Set to nearest bow: current date + bow - current day number
    now.setDate(now.getDate() + (day - now.getDay()));

    // return the date of now
    return now;
  };

  // similar to nearest day, but will always return a future date.
  this.futureDay = function (day, now) {
    var nnow = this.nearestDay(day, now);
    if(nnow <= this.now(now)) {
      nnow.setDate(nnow.getDate() + 7);
    }
    return nnow;
  };

  // similar to past day, but will always return a future date.
  this.pastDay = function (day, now) {
    var nnow = this.nearestDay(day, now);
    if(nnow >= this.now(now)) {
      nnow.setDate(nnow.getDate() - 7);
    }
    return nnow;
  };

  // gets the day of the week (1 - 7)
  this.dayOfWeek = function (now, beginningOfWeek) {
    now = this.startOf(now,'day');
    var yw = this.getYearWeek(now, beginningOfWeek);
    return Math.ceil(((now - yw[2].getTime()) / unitMs.day) % 7) + 1;
  };

  // get the current day of the year
  this.dayOfYear = function (now) {
    now = this.now(now);
    var
    dayCount = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334],
    mn = now.getMonth(),
    dn = now.getDate(),
    dayOfYear = dayCount[mn] + dn;
    if(mn > 1 && this.isLeapYear(now)) dayOfYear++;
    return dayOfYear;
  };

  // get the first of the year
  this.firstOfYear = function (year, utc) {
    year = angular.isNumber(year) ? year : (new Date()).getFullYear();
    if(utc) {
      return new Date(Date.UTC(year, this.JANUARY, 1, 0, 0, 0, 0));
    }
    return new Date(year, 0, 1, 0, 0, 0);
  };

  // get the last day of the year
  this.lastOfYear = function (year, utc) {
    if(utc) {
      return new Date(Date.UTC(year, this.DECEMBER, 31, 23, 59, 59, 999));
    }
    return new Date(year, this.DECEMBER, 31, 23, 59, 59, 999);
  };

  // calculate the number of days in a year
  this.daysInYear = function (year) {
    return this.dayOfYear(this.lastOfYear(year));
  };

  // calculate days in a month
  this.daysInMonth = function (month, year, utc) {
    return this.lastOfMonth(month, year, utc).getDate();
  };

  // date for the first of a month
  this.firstOfMonth = function (month, year, utc) {
    if(utc) {
      return new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
    }
    return new Date(year, month, 1, 0, 0, 0, 0);
  };

  // date for the last of the month
  this.lastOfMonth = function (month, year, utc) {
    var nmon = this.firstOfMonth(month + 1, year, utc);
    return new Date(nmon - 1);
  };

  // compute the current UTC offset for normalization.
  this.utcOffset = function(now) {
    return this.now(now).getTimezoneOffset() * unitMs.min;
  };

  // calculate the standard timezone offset
  this.stdTimezoneOffset = function(now) {
    var now = this.now(now);
    var jan = new Date(now.getFullYear(), 0, 1);
    var jul = new Date(now.getFullYear(), 6, 1);
    return Math.max(this.utcOffset(jan), this.utcOffset(jul));
  };

  // calculate the day-light-savings offset
  this.dstOffset = function(now) {
    var
    stdOffset = this.stdTimezoneOffset(),
    curOffset = this.utcOffset(now);
    return (curOffset < stdOffset) ? (stdOffset - curOffset) : 0;
  };

  // determines if current dst is in effect
  this.isDST = function(now) {
    return this.utcOffset(now) < this.stdTimezoneOffset();
  };

  // determines if current year is a leap year
  this.isLeapYear = function (now) {
    var year = this.now(now).getFullYear();
    if((year & 3) != 0) return false;
    return ((year % 100) != 0 || (year % 400) == 0);
  };

  // get a week number, year, week start and end dates.
  this.getYearWeek = function (now, beginningOfWeek) {
    now = this.pastDay(beginningOfWeek, now);

    var
    // Get first day of year
    yearStart = this.firstOfYear(now.getFullYear()),

    // Calculate full weeks to nearest bow
    weekNo = Math.ceil((((now.getTime() - yearStart.getTime()) / unitMs.day) + 1) / 7);

    // Return array of year and week number
    return [now.getFullYear(), weekNo, this.startOf(now,'day'), this.endOf(now.getTime() + (unitMs.week - 1), 'day')];
  };

  // round a date to the nearest precision (year, month, day, hour, min, sec, ms) [default: ms]
  // accepts optional rounding function.
  this.round = function (date, precision, roundFn) {
    roundFn = angular.isFunction(roundFn) ? roundFn : Math.round;
    date = this.ms(date);

    var
    roundNumberMod = function(n, mod) {
      if(!angular.isNumber(n)) return NaN;
      if(angular.isNumber(mod)) {
        var
        offset = n % mod,
        rounded = roundFn(offset / mod) * mod;
        return n - offset + rounded;
      }
      return roundFn(n);
    },
    roundDayOffset = function (day, maxDays) {
      return roundNumberMod(day, maxDays) * unitMs.day;
    },
    dateMod = (function (mod) {
      var utcOffset = this.utcOffset(date);
      return new Date(roundNumberMod(date - utcOffset, mod) + utcOffset);
    }).bind(this);

    precision = String(precision||'ms').toLowerCase();

    switch(true) { // check for simple unit rounding
      case dateKeys.ms.indexOf(precision)  > -1: return dateMod(unitMs.ms);
      case dateKeys.sec.indexOf(precision) > -1: return dateMod(unitMs.sec);
      case dateKeys.min.indexOf(precision) > -1: return dateMod(unitMs.min);
      case dateKeys.hr.indexOf(precision)  > -1: return dateMod(unitMs.hr);
      case dateKeys.day.indexOf(precision) > -1: return dateMod(unitMs.day);
    }

    var
    dobj = new Date(date),
    cmon = dobj.getMonth(),
    cyr  = dobj.getFullYear(),
    cdt  = dobj.getDate();

    switch(true) {
      case dateKeys.mon.indexOf(precision) > -1:
      return new Date(this.firstOfMonth(cmon, cyr).getTime() + roundDayOffset(cdt, this.daysInMonth(cmon, cyr)));
      case dateKeys.year.indexOf(precision) > -1:
      return new Date(this.firstOfYear(cyr).getTime() + roundDayOffset(this.dayOfYear(dobj), this.daysInYear(cyr)));
    }

    return false;
  };

  // equiv of Math.ceil on date.
  this.ceil = function (date, precision) {
    return this.round(date, precision, Math.ceil);
  };

  // equiv of Math.floor on date.
  this.floor = function (date, precision) {
    return this.round(date, precision, Math.floor);
  };

  // equiv of this.floor
  this.startOf = function (date, precision) {
    return this.floor(date, precision);
  };

  // similar to this.ceil, but removes one ms from offset precision
  this.endOf = function (date, precision) {
    return new Date(this.ceil(date, precision).getTime() - 1);
  };

  // strict date comparison function
  this.compare = function (a, b) {
    var ams = this.ms(a), bms = this.ms(b);
    if(ams > bms) return  1;
    if(ams < bms) return -1;
    return 0;
  };

  // strict date between range function
  this.between = function (v, min, max) {
    return this.compare(v, min) >= 0 && this.compare(v, max) <= 0;
  };

  // compare two dates with precision equality checking
  this.equal = function (a, b, precision, bow) {
    var
    p = [],
    getYearWeek = this.getYearWeek.bind(this),
    getWeek = function () {
      var yw = getYearWeek(this, bow);
      return yw.slice(0,2).join('-');
    };

    precision = String(precision||'ms').toLowerCase();

    switch (true) {
      case dateKeys.week.indexOf(precision) > -1:
      p.push(getWeek);
      break;
      case dateKeys.ms.indexOf(precision) > -1:
      p.push(Date.prototype.getMilliseconds);
      case dateKeys.sec.indexOf(precision) > -1:
      p.push(Date.prototype.getSeconds);
      case dateKeys.min.indexOf(precision) > -1:
      p.push(Date.prototype.getMinutes);
      case dateKeys.hr.indexOf(precision) > -1:
      p.push(Date.prototype.getHours);
      case dateKeys.day.indexOf(precision) > -1:
      p.push(Date.prototype.getDate);
      case dateKeys.mon.indexOf(precision) > -1:
      p.push(Date.prototype.getMonth);
      case dateKeys.year.indexOf(precision) > -1:
      p.push(Date.prototype.getFullYear);
    }

    a = this.now(a);
    b = this.now(b);

    return p.every(function (fn) {
      return fn.call(a) === fn.call(b);
    });
  };
});