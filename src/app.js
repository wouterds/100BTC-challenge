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
    return (this.totalBalance / process.env.BTC_BALANCE_GOAL) * 100;
  }

  get bitmexHistory(): { [key: string]: number } {
    return this._bitmexHistory;
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
    this._bitmexHistory = await Bitmex.getBalanceHistory(
      process.env.START_DATE,
    );

    callback();
  };

  printData() {
    const overviewTable = new Table({
      head: [
        chalk.whiteBright('Day'),
        chalk.whiteBright('Progress'),
        chalk.whiteBright('Total Balance'),
        chalk.whiteBright('Wallet balance'),
        chalk.whiteBright('Bitmex balance'),
      ],
      colWidths: [6, 18, 20, 20, 20],
    });
    overviewTable.push([
      this.day,
      `${this.progress.toFixed(2)}%`,
      `${this.totalBalance.toFixed(2)} BTC`,
      `${this.walletBalance.toFixed(8)} BTC`,
      `${this.bitmexBalance.toFixed(8)} BTC`,
    ]);

    const dataTable = new Table({
      head: [
        chalk.whiteBright('Day'),
        chalk.whiteBright('Progress'),
        chalk.whiteBright('Balance'),
        chalk.whiteBright('Change'),
        chalk.whiteBright('Date'),
      ],
      colWidths: [6, 18, 20, 20, 20],
    });

    this.bitmexHistory.forEach(({ date, value }) =>
      dataTable.push([
        differenceInDays(date, process.env.START_DATE),
        `${((value / process.env.BTC_BALANCE_GOAL) * 100).toFixed(2)}%`,
        value,
        '--',
        date,
      ]),
    );

    console.log(overviewTable.toString());
    console.log(dataTable.toString());
  }
}

export default App;
