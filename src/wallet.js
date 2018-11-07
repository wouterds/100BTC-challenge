//@flow
import axios from 'axios';
import {
  format,
  differenceInDays,
  addDays,
  subDays,
  isAfter,
  compareAsc,
} from 'date-fns';
import { sortBy } from 'lodash';

class Wallet {
  static get balance(): number {
    return (async () => {
      try {
        const response = await axios.get(
          `https://blockchain.info/rawaddr/${process.env.BTC_WALLET_ADDRESS}`,
        );

        if (response.status !== 200) {
          return 0;
        }

        const { data } = response;

        if (typeof data !== 'object') {
          return 0;
        }

        const { final_balance: finalBalance } = data;

        return parseFloat(finalBalance / 100000000);
      } catch {
        return 0;
      }
    })();
  }

  static get balanceHistory(): Array<{
    date: string,
    value: number,
    change: number,
  }> {
    return (async () => {
      let response = {};
      try {
        response = await axios.get(
          `https://blockchain.info/multiaddr?active=${
            process.env.BTC_WALLET_ADDRESS
          }`,
        );
      } catch {
        return [];
      }

      const { data } = response;

      let entries = {};
      let dateFirstEntry = null;
      data.txs.reverse().forEach(item => {
        if (dateFirstEntry === null) {
          dateFirstEntry = new Date(item.time * 1000);
        }

        entries[format(new Date(item.time * 1000), 'YYYY-MM-DD')] =
          item.balance / 100000000;
      });

      let oldestDate = compareAsc(dateFirstEntry, process.env.START_DATE)
        ? dateFirstEntry
        : process.env.START_DATE;

      for (let i = 0; i < differenceInDays(new Date(), oldestDate) + 2; i++) {
        const date = format(addDays(oldestDate, i), 'YYYY-MM-DD');

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

export default Wallet;
