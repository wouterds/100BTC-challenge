//@flow
import chalk from 'chalk';
import Table from 'cli-table3';
import axios from 'axios';
import Header from './header';

class App {
  coldStorageAddress: string = process.env.BTC_COLD_STORAGE_ADDRESS;

  constructor() {
    const overviewTable = new Table({
      head: [
        chalk.whiteBright('Day'),
        chalk.whiteBright('Progress'),
        chalk.whiteBright('Balance'),
      ],
    });
    overviewTable.push([
      this.day,
      `${this.progress.toFixed(2)}%`,
      `${this.totalBalance.toFixed(2)} BTC`,
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

    Header.print();

    console.log(`${overviewTableStrings[0]} ${balanceTableStrings[0]}`);
    console.log(`${overviewTableStrings[1]} ${balanceTableStrings[1]}`);
    console.log(`${overviewTableStrings[2]} ${balanceTableStrings[2]}`);
    console.log(`${overviewTableStrings[3]} ${balanceTableStrings[3]}`);
    console.log(`${overviewTableStrings[4]} ${balanceTableStrings[4]}`);

    const dataTable = new Table({
      head: [
        chalk.whiteBright('Day'),
        chalk.whiteBright('Progress'),
        chalk.whiteBright('Balance'),
        chalk.whiteBright('Date'),
      ],
      colWidths: [10, 18, 22, 16],
    });

    dataTable.push([3, '1.03%', '1.031568916 BTC', '2018-10-23']);
    dataTable.push([2, '0.89%', '0.893464621 BTC', '2018-10-22']);
    dataTable.push([1, '1.00%', '1.000000000 BTC', '2018-10-21']);

    console.log(dataTable.toString());
  }

  get day(): number {
    return 3;
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
    return 1.031568916;
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
