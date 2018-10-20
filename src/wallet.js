//@flow
import axios from 'axios';

class Wallet {
  static get balance(): number {
    const address = process.env.BTC_COLD_STORAGE_ADDRESS;

    return (async () => {
      try {
        const response = await axios.get(
          `https://blockexplorer.com/api/addr/${address}`,
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
}

export default Wallet;
