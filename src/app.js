//@flow
import fs from 'fs';
import chalk from 'chalk';
import Table from 'cli-table3';
import axios from 'axios';

class App {
  coldStorageAddress: string = process.env.BTC_COLD_STORAGE_ADDRESS;

  constructor() {
    const overviewTable = new Table({
      head: [
        chalk.whiteBright('Balance'),
        chalk.whiteBright('Day'),
        chalk.whiteBright('Progress'),
      ],
    });
    overviewTable.push([
      `${this.totalBalance.toFixed(2)} BTC`,
      this.day,
      `${this.progress.toFixed(2)}%`,
    ]);

    const balanceTable = new Table({
      head: [
        chalk.whiteBright('Cold storage balance'),
        chalk.whiteBright('Bitmex balance'),
      ],
    });
    balanceTable.push([
      `${this.coldStorageBalance.toFixed(8)} BTC`,
      `${this.bitmexBalance.toFixed(8)} BTC`,
    ]);

    const overviewTableStrings = overviewTable.toString().split('\n');
    const balanceTableStrings = balanceTable.toString().split('\n');

    const ascii = fs.readFileSync('resources/ascii.txt', {
      encoding: 'utf-8',
      flag: 'r',
    });

    console.log(chalk.magentaBright(ascii));
    console.log(
      `Cold storage wallet: ${
        this.coldStorageAddress
      }, start date: 21st of October 2018`,
    );
    console.log('');

    console.log(`${overviewTableStrings[0]}  ${balanceTableStrings[0]}`);
    console.log(`${overviewTableStrings[1]}  ${balanceTableStrings[1]}`);
    console.log(`${overviewTableStrings[2]}  ${balanceTableStrings[2]}`);
    console.log(`${overviewTableStrings[3]}  ${balanceTableStrings[3]}`);
    console.log(`${overviewTableStrings[4]}  ${balanceTableStrings[4]}`);
  }

  get day(): number {
    return 0;
  }

  get progress(): number {
    return (this.totalBalance / this.goalBalance) * 100;
  }

  get goalBalance(): number {
    return 100;
  }

  get totalBalance(): number {
    return this.bitmexBalance + this.coldStorageBalance;
  }

  get bitmexBalance(): number {
    return 0;
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
