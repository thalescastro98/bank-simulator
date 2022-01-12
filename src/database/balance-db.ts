import { Knex } from 'knex';
import { getConnection } from '.';

export class BalanceDB {
  static getUserBalance = async (id: string, trx?: Knex.Transaction<any, any[]>) => {
    const userBalance = await (trx || getConnection()).raw('SELECT COALESCE (SUM(amount),0.00) FROM transactions WHERE "fromId"=?', [id]);
    return { id: id, balance: userBalance.rows[0].coalesce };
  };
}
