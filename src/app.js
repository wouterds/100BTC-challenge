//@flow
import axios from 'axios';

class App {
  coldStorageAddress: string = process.env.BTC_COLD_STORAGE_ADDRESS;

  constructor() {
    console.log(`Cold storage Bitcoin balance: ${this.coldStorageBalance}`);
  }

  get coldStorageBalance(): number {
    async () => {
      try {
        const { data } = axios.get(
          `https://blockexplorer.com/api/addr/${this.coldStorageAddress}`,
        );

        return data.balance;
      } catch {
        return 0;
      }
    };

    return 0;
  }
}

export default App;
