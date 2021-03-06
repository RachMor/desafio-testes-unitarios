import { Request, Response } from 'express';
import { container } from 'tsyringe';

import { CreateStatementUseCase } from './CreateStatementUseCase';

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  TRANSFER = 'transfer'
}

export class CreateStatementController {
  async execute(request: Request, response: Response) {
    const { receive_id } = request.params;
    const { id } = request.user;
    const { amount, description } = request.body;
    let user_id = id;
    let sender_id;
    const splittedPath = request.originalUrl.split('/')
    let type = splittedPath[splittedPath.length - 1] as OperationType;
    if (receive_id) {
      sender_id = id;
      user_id = receive_id;
      type = OperationType.TRANSFER;
    }
    const createStatement = container.resolve(CreateStatementUseCase);
    const statement = await createStatement.execute({
      user_id,
      sender_id,
      type,
      amount,
      description
    });

    return response.status(201).json(statement);
  }
}
