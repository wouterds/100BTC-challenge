//@flow
import axios from 'axios';
import crypto from 'crypto';
import {
  format,
  getTime,
  isBefore,
  isAfter,
  addDays,
  differenceInDays,
  subDays,
  isToday,
} from 'date-fns';
import { sortBy } from 'lodash';

const apiCall = async (path: string): ?Object => {
  path = `/api/v1${path}`;
  const expires = getTime(new Date());

  const signature = crypto
    .createHmac('sha256', process.env.BITMEX_API_KEY_SECRET)
    .update(`GET${path}${expires}`)
    .digest('hex');

  const headers = {
    'api-expires': expires,
    'api-key': process.env.BITMEX_API_KEY_ID,
    'api-signature': signature,
  };

  try {
    const response = await axios.get(`https://bitmex.com${path}`, {
      headers,
    });

    if (response.status !== 200) {
      return null;
    }

    return response.data;
  } catch (e) {
    return null;
  }
};

class Bitmex {
  static get balance(): number {
    return (async () => {
      const data = await apiCall('/user/wallet');

      if (!data) {
        return 0;
      }

      return parseFloat(data.amount / 100000000);
    })();
  }

  static get balanceHistory(): Array<{
    date: string,
    value: number,
    change: number,
  }> {
    return (async () => {
      let data = await apiCall('/user/walletHistory');

      if (!data) {
        return [];
      }

      data = data.filter(item => item.transactType === 'RealisedPNL');

      data = data.filter((item: Object) =>
        isBefore(item.timestamp, new Date()),
      );

      data = data.reverse();

      let entries = {};
      data.forEach(item => {
        entries[format(item.timestamp, 'YYYY-MM-DD')] =
          item.walletBalance / 100000000;
      });

      for (
        let i = 0;
        i < differenceInDays(new Date(), process.env.START_DATE);
        i++
      ) {
        const date = format(addDays(process.env.START_DATE, i), 'YYYY-MM-DD');

        if (!entries[date]) {
          const previousEntry = entries[format(subDays(date, 1), 'YYYY-MM-DD')];

          entries[date] = previousEntry || 0;
        }
      }

      entries = Object.entries(entries).map(([date, value]) => {
        return {
          date,
          value,
        };
      });

      entries = entries.filter(({ date }) =>
        isAfter(date, subDays(process.env.START_DATE, 1)),
      );

      entries = entries.filter(({ date }) => !isToday(date));

      let previousValue = null;
      entries = sortBy(entries, 'date').map(({ date, value }) => {
        const change = previousValue !== null ? value - previousValue : null;
        previousValue = value;

        return { date, value, change };
      });

      return entries.reverse();
    })();
  }
}

export default Bitmex;
