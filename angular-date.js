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
  this.compare = function (a, b, precision, rounding) {
    var
    ams = this.ms(a),
    bms = this.ms(b);

    if(precision) {
      var roundFn = this.round.bind(this);

      if(angular.isString(rounding)) {
        rounding = rounding.toLowerCase();
        if(rounding === 'ceil')  roundFn = this.ceil.bind(this);
        if(rounding === 'floor') roundFn = this.floor.bind(this);
      }
      else if(angular.isFunction(rounding)) {
        roundFn = rounding;
      }

      ams = roundFn(ams, precision).getTime();
      bms = roundFn(bms, precision).getTime();
    }

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
})
.filter('duration', function () {
  var
  defaultOpts = {
    week:               'week',
    weeks:              'weeks',
    day:                'day',
    days:               'days',
    hour:               'hour',
    hours:              'hours',
    minute:             'minute',
    minutes:            'minutes',
    second:             'second',
    seconds:            'seconds',
    millisecond:        'ms',
    milliseconds:       'ms',
    nullLabel:          '---',
    pastPrefix:         '(',
    pastSuffix:         ')',
    futurePrefix:       '',
    futureSuffix:       '',
    nowPrefix:          '',
    nowSuffix:          '',
    delimiter:          ' ',
    delimiterCaption:   ' ',
    showWeek:           'auto',
    showDay:            'auto',
    showHr:             'auto',
    showMin:            'auto',
    showSec:            'auto',
    showMs:             'auto',
    html:               false,
    tagWrapper:         false,
    tagLabelWrapper:    false,
    tagCount:           'em',
    tagCaption:         'small',
    classPast:          'past-date',
    classCount:         false,
    classCaption:       false,
    classLabelWrapper:  false,
    precise:            false,
    showZeroLead:       false,
    showZeroTrail:      false,
    showZeroMs:         true,
    inputAsSec:         false,
    inputAsMin:         false,
    inputAsHr:          false,
    inputAsDay:         false
  },
  durations = [
    { property: 'week', ms: 604800000 },
    { property: 'day',  ms: 86400000 },
    { property: 'hour', ms: 3600000 },
    { property: 'min',  ms: 60000 },
    { property: 'sec',  ms: 1000 },
    { property: 'ms',   ms: 1 }
  ],
  isBoolean = function (v) {
    return (typeof v === 'boolean');
  },
  isAuto = function (v) {
    return v === 'auto';
  },
  pluralize = function (n, singular, plural) {
    return n === 1 ? singular : plural;
  },
  htmlTag = function (tag, inner, cls) {
    if(!tag && !cls) return inner; else if(!!cls && !tag) tag = 'span';
    return '<' + tag + (!!cls ? ' class="'+cls+'"' : '') + '>' + inner + '</' + tag + '>';
  },
  calcDuration = function (ms, opts) {
    if(!angular.isNumber(ms) || isNaN(ms) || !isFinite(ms)) {
      return false;
    }
    else if(ms === 0) {
      return { ms: ms };
    }

    if(opts.inputAsSec) {
      ms *= 1000;
    }
    else if(opts.inputAsMin) {
      ms *= 60000;
    }
    else if(opts.inputAsHr) {
      ms *= 3600000;
    }
    else if(opts.inputAsDay) {
      ms *= 8.64e7;
    }

    var o = {};

    if(ms < 0) {
      o.past = true;
    }

    ms = Math.abs(ms);

    return durations.reduce(function (p, c) {
      if(c.ms > ms) {
        p[c.property] = 0;
        return p;
      }

      var n = Math.floor(ms / c.ms);
      if(n > 0) {
        ms -= n * c.ms;
      }

      p[c.property] = n;
      return p;
    }, o);
  },
  formatLabel = function (val, property, opts) {
    var caption, delim = opts.delimiterCaption;

    switch(property) {
      case 'week':
        caption = pluralize(val, opts.week, opts.weeks);
        break;
      case 'day':
        caption = pluralize(val, opts.day, opts.days);
        break;
      case 'hour':
        caption = pluralize(val, opts.hour, opts.hours);
        break;
      case 'min':
        caption = pluralize(val, opts.minute, opts.minutes);
        break;
      case 'sec':
        caption = pluralize(val, opts.second, opts.seconds);
        break;
      case 'ms':
        caption = pluralize(val, opts.millisecond, opts.milliseconds);
        break;
      default:
        return false;
    }

    if(opts.html) {
      return htmlTag(opts.tagLabelWrapper,
        htmlTag(opts.tagCount, val, opts.classCount) + delim +
        htmlTag(opts.tagCaption, caption, opts.classCaption),
      opts.classLabelWrapper);
    }

    return String(val) + delim + caption;
  },
  concatLabel = function (to, val, property, totalMs, opts) {
    var formatted = formatLabel(val, property, opts);
    if(!formatted) return to;

    var
    mspday = 8.64e7, msphr = 3600000,
    mspmin = 60000,  mspsec = 1000,
    toLen         = to.length,
    showZeroLead  = !!opts.showZeroLead,
    showZeroTrail = !!opts.showZeroTrail,
    show = false,
    autoValue = function (ums, lowerLim, upperLim) {
      lowerLim = (angular.isNumber(lowerLim) && lowerLim >= 0)
        ? lowerLim
        : 0;
      upperLim = (angular.isNumber(upperLim) && !isNaN(upperLim) && isFinite(upperLim))
        ? upperLim
        : Infinity;

      var
      abs = Math.abs(totalMs),
      A = opts.precise ? (val > 0) : (val > 0 && abs >= lowerLim && abs <= upperLim);

      if(val === 0) {
        if(showZeroLead && abs <= ums) A = true;
        else if(showZeroTrail && abs >= ums) A = true;
      }

      return A;
    };

    switch(property) {
      case 'week':
      show = isAuto(opts.showWeek) ? autoValue(mspday * 7, 0, Infinity) : opts.showWeek;
      break;
      case 'day':
      show = isAuto(opts.showDay)  ? autoValue(mspday, 0, mspday * 30) : opts.showDay;
      break;
      case 'hour':
      show = isAuto(opts.showHr)   ? autoValue(msphr, 0, mspday * 7) : opts.showHr;
      break;
      case 'min':
      show = isAuto(opts.showMin)  ? autoValue(mspmin, 0, msphr * 2) : opts.showMin;
      break;
      case 'sec':
      show = isAuto(opts.showSec)  ? autoValue(mspsec, 0, mspmin * 2) : opts.showSec;
      break;
      case 'ms':
      show = isAuto(opts.showMs)   ? autoValue(1, 0, mspsec * 2) : opts.showMs;

      if((to.length === 0 && totalMs === 0) && opts.showZeroMs) {
        show = true;
      }

      break;
      default: return to;
    }

    if(!show) return to;

    return (toLen > 0 ? to + opts.delimiter : to) + formatted;
  };

  return function (ms, opts) {
    var
    o = angular.extend({}, defaultOpts, opts),
    dur = calcDuration(ms, o),
    nullStr = o.nullLabel;

    if(!dur) {
      return nullStr;
    }

    var
    past = dur.past,
    label = durations.reduce(function (p, c) {
      return concatLabel(p, dur[c.property] || 0, c.property, ms, o);
    }, ''),
    prefix = (past ? o.pastPrefix : o.futurePrefix),
    suffix = (past ? o.pastSuffix : o.futureSuffix);

    if(ms === 0) { // now prefix/suffix
      prefix = o.nowPrefix;
      suffix = o.nowSuffix;
    }

    if(!label || !label.length) {
      return nullStr;
    }

    label = prefix + label + suffix;

    if(!o.html) return label;

    return htmlTag(o.tagWrapper, label, past ? o.classPast : null);
  };
})
.filter('since', ['$date', '$filter', function ($date, $filter) {
  var durationFilter = $filter('duration');
  return function (date, now, durationOpts) {
    var o = durationOpts = durationOpts || {};

    if(!o.hasOwnProperty('pastPrefix')) {
      o.pastPrefix = '';
    }
    if(!o.hasOwnProperty('pastSuffix')) {
      o.pastSuffix = ' ago';
    }
    if(!o.hasOwnProperty('futurePrefix')) {
      o.futurePrefix = 'in ';
    }
    if(!o.hasOwnProperty('futureSuffix')) {
      o.futureSuffix = '';
    }

    var
    dateMs = $date.ms(date),
    nowMs = $date.ms(now),
    diff = dateMs - nowMs;

    return durationFilter(diff, durationOpts);
  };
}])
.factory('DateRange', ['$date', '$filter', function ($date, $filter) {

  var
  dateFilter = $filter('date');

  function DateRange () {
    var from = 0, to = $date.ms(),
    numberTest = /^[0-9]+$/,
    parseNumberStr = function (v) {
      return (angular.isString(v) && numberTest.test(v)) ? parseInt(v) : v;
    };

    Object.defineProperties(this, {
      from: {
        get: function () { return from; },
        set: function (v) {
          v = parseNumberStr(v);

          if($date.compare(v, to) >= 0) {
            v = to - 1;
          }

          from = v;
        }
      },
      to: {
        get: function () { return to; },
        set: function (v) {
          v = parseNumberStr(v);

          if($date.compare(v, from) <= 0) {
            v = from + 1;
          }

          to = v;
        }
      },
      difference: {
        get: function () {
          return Math.abs(to - from);
        }
      }
    });

    this.set = function (a, b) {
      var aMS, bMS, arglen = arguments.length;

      if(arglen === 2) {
        aMS = $date.ms(a);
        bMS = $date.ms(b);
        from = Math.min(aMS, bMS);
        to   = Math.max(aMS, bMS);
      }
      else if(arglen === 1) {
        aMS = $date.ms(a);

        if(aMS < from) {
          from = aMS;
        }
        else if(aMS > to) {
          to = aMS;
        }
      }

      return this;
    };

    // init the range from arguments;
    this.set.apply(this, arguments);
  }

  Object.defineProperties(DateRange.prototype, {
    fromDate: {
      get: function () { return new Date(this.from); }
    },
    toDate: {
      get: function () { return new Date(this.to); }
    }
  });

  DateRange.prototype.toString = function (format, toFormat, delimiter) {
    delimiter = delimiter || ' to ';
    format    = format   || 'short';
    toFormat  = toFormat || format;

    return [
      dateFilter(this.from, format),
      dateFilter(this.to, format)
    ].join(delimiter);
  };

  return DateRange;
}]);
