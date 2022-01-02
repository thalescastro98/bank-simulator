import { Knex } from 'knex';
import { pg } from '.';

export class BalanceDB {
  static getUserBalance = async (id: string, trx?: Knex.Transaction<any, any[]>) => {
    const userBalance = await (trx || pg).raw('select COALESCE (sum(amount),0.00) from transactions where "fromId"=?', [id]);
    return { id: id, balance: userBalance.rows[0].coalesce };
  };
}
