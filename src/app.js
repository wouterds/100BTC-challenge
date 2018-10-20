//@flow
import chalk from 'chalk';
import Table from 'cli-table3';
import { differenceInDays } from 'date-fns';
import Header from './header';
import Wallet from './wallet';
import Bitmex from './bitmex';

class App {
  _walletBalance: number = 0;
  _bitmexBalance: number = 0;

  constructor() {
    Header.print();

    this.fetch(() => this.printData());
  }

  get day(): number {
    return differenceInDays(new Date(), process.env.START_DATE);
  }

  get progress(): number {
    return (this.totalBalance / this.goalBalance) * 100;
  }

  get goalBalance(): number {
    return 100;
  }

  get totalBalance(): number {
    return this.bitmexBalance + this.walletBalance;
  }

  get walletBalance(): number {
    return this._walletBalance;
  }

  get bitmexBalance(): number {
    return this._bitmexBalance;
  }

  fetch = async (callback: Function) => {
    this._bitmexBalance = await Bitmex.balance;
    this._walletBalance = await Wallet.balance;

    callback();
  };

  printData() {
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
      `${this.walletBalance.toFixed(8)} BTC`,
      `${this.bitmexBalance.toFixed(8)} BTC`,
    ]);

    const overviewTableStrings = overviewTable.toString().split('\n');
    const balanceTableStrings = balanceTable.toString().split('\n');

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

    console.log(dataTable.toString());
  }
}

export default App;
