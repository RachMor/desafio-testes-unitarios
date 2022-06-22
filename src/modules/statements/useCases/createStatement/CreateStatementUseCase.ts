import { inject, injectable } from "tsyringe";

import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { Statement } from '../../entities/Statement';
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { ICreateStatementDTO } from "./ICreateStatementDTO";

@injectable()
export class CreateStatementUseCase {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('StatementsRepository')
    private statementsRepository: IStatementsRepository
  ) {}

  async execute({ user_id, type, amount, description, sender_id }: ICreateStatementDTO): Promise<Statement> {
    const user = await this.usersRepository.findById(user_id);
    let sender_user;
    if (sender_id) {
      sender_user = await this.usersRepository.findById(sender_id as string)
      if (JSON.stringify(sender_user) === JSON.stringify(user)) throw new CreateStatementError.EqualUser();
    };
    if(!user || (sender_user && Object.keys(sender_user).length === 0)){
      throw new CreateStatementError.UserNotFound();
    }
    if (type === 'withdraw' || type === 'transfer') {
      let id = (type === 'transfer' ? sender_id : user_id);
      const { balance } = await this.statementsRepository.getUserBalance({ user_id: id as string });
      if (balance < amount) {
        throw new CreateStatementError.InsufficientFunds()
      }
    }

    const statementOperation = await this.statementsRepository.create({
      user_id,
      sender_id,
      type,
      amount,
      description
    });

    return statementOperation;
  }
}
