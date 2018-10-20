//@flow
import axios from 'axios';
import crypto from 'crypto';
import { format, getTime, isBefore, subDays, isAfter } from 'date-fns';

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

  static get balanceHistory(): Array<{ date: string, value: number }> {
    return (async () => {
      let data = await apiCall('/user/walletHistory');

      if (!data) {
        return [];
      }

      // Filter out deposits withdrawals etc
      data = data.filter(item => item.transactType === 'RealisedPNL');

      // Filter out everything before current date
      data = data.filter((item: Object) =>
        isBefore(item.timestamp, new Date()),
      );

      // Sort ascending
      data = data.reverse();

      let entries = {};
      data.forEach(item => {
        entries[format(item.timestamp, 'YYYY-MM-DD')] =
          item.walletBalance / 100000000;
      });

      // Return array of objects
      let previousValue = null;
      entries = Object.entries(entries).map(([date, value]) => {
        const change = previousValue !== null ? value - previousValue : null;
        previousValue = value;

        return {
          date,
          value,
          change,
        };
      });

      // Reverse again to descending order
      return entries.reverse();
    })();
  }

  static getBalanceHistory = async (
    offset: Date,
  ): Array<{ date: string, value: number }> => {
    const entries = await Bitmex.balanceHistory;

    // Filter out entries before offset
    return entries.filter(({ date }) => isAfter(date, subDays(offset, 1)));
  };
}

export default Bitmex;
