import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { Statement } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
  TRANSFER = 'transfer'
}
let statementRepository: InMemoryStatementsRepository;
let usersRepository: InMemoryUsersRepository;
let createStatementUseCase: CreateStatementUseCase;
let createUserUseCase: CreateUserUseCase;

describe("Create Statement", () => {
  beforeEach(() => {
    statementRepository = new InMemoryStatementsRepository();
    usersRepository = new InMemoryUsersRepository();
    createStatementUseCase = new CreateStatementUseCase(
      usersRepository,
      statementRepository
    );
    createUserUseCase = new CreateUserUseCase(usersRepository);
  });
  it("should be able create a statement type deposit", async () => {
    const user = await createUserUseCase.execute({
      name: "teste",
      email: "teste@teste.com",
      password: "teste",
    });

    expect(
      await createStatementUseCase.execute({
        user_id: user.id as string,
        type: OperationType.DEPOSIT,
        amount: 120.0,
        description: "depósito de salário",
      })
    ).toBeInstanceOf(Statement);
  });

  it("should be able create a statement type withdraw", async () => {
    const user = await createUserUseCase.execute({
      name: "teste",
      email: "teste@teste.com",
      password: "teste",
    });

    await createStatementUseCase.execute({
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      amount: 120.0,
      description: "depósito de salário",
    });

    expect(
      await createStatementUseCase.execute({
        user_id: user.id as string,
        type: OperationType.WITHDRAW,
        amount: 30.0,
        description: "saque em conta",
      })
    ).toBeInstanceOf(Statement);
  });

  it("should not be able to make deposit if user does not exist", async () => {
    await expect(
      createStatementUseCase.execute({
        user_id: "abc" as string,
        type: OperationType.DEPOSIT,
        amount: 120.0,
        description: "depósito de salário",
      })
    ).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it("should not be able to make withdraw if user does not exist", async () => {
    await expect(
      createStatementUseCase.execute({
        user_id: "abc" as string,
        type: OperationType.WITHDRAW,
        amount: 120.0,
        description: "saque de salário",
      })
    ).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });
  it("should not be able to make withdraw if balance is less than amount", async () => {
    const user = await createUserUseCase.execute({
      name: "teste",
      email: "teste@teste.com",
      password: "teste",
    });

    await expect(
      createStatementUseCase.execute({
        user_id: user.id as string,
        type: OperationType.WITHDRAW,
        amount: 120.0,
        description: "saque de salário",
      })
    ).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });

});
