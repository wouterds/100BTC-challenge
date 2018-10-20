//@flow
import axios from 'axios';
import crypto from 'crypto';
import { format, getTime, isBefore, isAfter } from 'date-fns';

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

  static get balanceHistory(): { [key: string]: number } {
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
        entries[format(item.timestamp, 'YYYY-MM-DD')] = item.walletBalance;
      });

      return entries;
    })();
  }

  static getBalanceHistory = async (
    offset: Date,
  ): { [key: string]: number } => {
    let entries = {};

    const balanceHistory = await Bitmex.balanceHistory;
    Object.keys(balanceHistory).forEach((date: string) => {
      if (isAfter(date, offset)) {
        entries[date] = balanceHistory[date];
      }
    });

    return entries;
  };
}

export default Bitmex;
