const isoDateFormat = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d*)?(?:[-+]\d{2}:?\d{2}|Z)?$/;

function isIsoDateString(value: any): boolean {
  return value
    && typeof(value) === 'string'
    && isoDateFormat.test(value);
}

export function parseDates(obj: any) {
  for (const [key, value] of Object.entries(obj)) {
    if (isIsoDateString(value)) {
      obj[key] = new Date(value as string);
    }
    if (typeof(value) === 'object') {
      parseDates(value);
    }
  }
}