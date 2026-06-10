import { format, addDays, differenceInDays, startOfQuarter, endOfQuarter } from 'date-fns';
import { fr } from 'date-fns/locale';

export class DateUtil {
  static now(): Date { return new Date(); }

  static formatDate(date: Date | string, pattern: string = 'yyyy-MM-dd'): string {
    return format(new Date(date), pattern, { locale: fr });
  }

  static addDays(date: Date | string, days: number): Date {
    return addDays(new Date(date), days);
  }

  static daysBetween(from: Date | string, to: Date | string): number {
    return differenceInDays(new Date(to), new Date(from));
  }

  static getCurrentQuarter(): { start: Date; end: Date; label: string } {
    const now = new Date();
    const start = startOfQuarter(now);
    const end = endOfQuarter(now);
    const q = Math.floor(now.getMonth() / 3) + 1;
    return {
      start,
      end,
      label: `Q${q}-${now.getFullYear()}`,
    };
  }

  static isExpired(date: Date | string): boolean {
    return new Date(date) < new Date();
  }

  static isWithinDays(date: Date | string, days: number): boolean {
    const target = this.addDays(date, days);
    return target >= this.now();
  }
}
