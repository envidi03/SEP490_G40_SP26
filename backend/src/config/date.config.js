const DEFAULT_TZ = 'Asia/Ho_Chi_Minh';

const OriginalDate = Date;

// Convert 1 date sang timezone nhưng giữ đúng timestamp
function getTZDate(date, timeZone) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(date);

  const map = {};
  for (const { type, value } of parts) {
    map[type] = value;
  }

  // tạo ISO local (không Z)
  const str = `${map.year}-${map.month}-${map.day}T${map.hour}:${map.minute}:${map.second}`;

  return new OriginalDate(str);
}

class CustomDate extends OriginalDate {
  constructor(...args) {
    // 👉 nếu có param → giữ nguyên (tránh phá logic parse cũ)
    if (args.length > 0) {
      return new OriginalDate(...args);
    }

    // 👉 new Date() → ép timezone
    return getTZDate(new OriginalDate(), DEFAULT_TZ);
  }

  static now() {
    return getTZDate(new OriginalDate(), DEFAULT_TZ).getTime();
  }

  static parse(str) {
    return OriginalDate.parse(str);
  }

  static UTC(...args) {
    return OriginalDate.UTC(...args);
  }
}

// ⚠️ giữ prototype (cực quan trọng)
CustomDate.prototype = OriginalDate.prototype;

// override global
global.Date = CustomDate;