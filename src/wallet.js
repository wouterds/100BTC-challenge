//@flow
import axios from 'axios';
import { format, differenceInDays, addDays, subDays, isAfter } from 'date-fns';
import { sortBy } from 'lodash';

class Wallet {
  static get balance(): number {
    return (async () => {
      try {
        const response = await axios.get(
          `https://blockexplorer.com/api/addr/${
            process.env.BTC_WALLET_ADDRESS
          }`,
        );

        if (response.status !== 200) {
          return 0;
        }

        const { data } = response;

        if (typeof data !== 'object') {
          return 0;
        }

        const { balance } = data;

        return parseFloat(balance);
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
      data.txs.reverse().forEach(item => {
        if (isAfter(new Date(item.time * 1000), process.env.START_DATE)) {
          entries[format(new Date(item.time * 1000), 'YYYY-MM-DD')] =
            item.balance / 100000000;
        }
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
