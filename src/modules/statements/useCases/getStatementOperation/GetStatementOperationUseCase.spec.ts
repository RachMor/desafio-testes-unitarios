import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}
let statementRepository: InMemoryStatementsRepository;
let usersRepository: InMemoryUsersRepository;
let createStatementUseCase: CreateStatementUseCase;
let createUserUseCase: CreateUserUseCase;
let getStatementOperation: GetStatementOperationUseCase;
describe("Get Statement Operation", () => {
  beforeEach(() => {
    statementRepository = new InMemoryStatementsRepository();
    usersRepository = new InMemoryUsersRepository();
    createStatementUseCase = new CreateStatementUseCase(
      usersRepository,
      statementRepository
    );
    createUserUseCase = new CreateUserUseCase(usersRepository);

    getStatementOperation = new GetStatementOperationUseCase(
      usersRepository,
      statementRepository
    );
  });
  it("should be able do get an specific statement operation", async () => {
    const user = await createUserUseCase.execute({
      name: "teste",
      email: "teste@teste.com",
      password: "teste",
    });

    const deposit = await createStatementUseCase.execute({
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      amount: 120.0,
      description: "depósito de salário",
    });
    const withdraw = await createStatementUseCase.execute({
      user_id: user.id as string,
      type: OperationType.WITHDRAW,
      amount: 70.0,
      description: "saque de salário",
    });

    const statement = await getStatementOperation.execute({
      user_id: user.id as string,
      statement_id: deposit.id as string,
    });

    expect(statement).toHaveProperty("user_id");
    expect(statement).toHaveProperty("id");
  });

  it("should not be able do get an specific statement operation  if user does not exists", async () => {
    const user = await createUserUseCase.execute({
      name: "teste",
      email: "teste@teste.com",
      password: "teste",
    });

    const deposit = await createStatementUseCase.execute({
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      amount: 120.0,
      description: "depósito de salário",
    });
    await expect(
      getStatementOperation.execute({
        user_id: "abc",
        statement_id: deposit.id as string,
      })
    ).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });
  it("should not be able do get an specific statement operation by user if statement_id non exists", async () => {
    const user = await createUserUseCase.execute({
      name: "teste",
      email: "teste@teste.com",
      password: "teste",
    });

    const deposit = await createStatementUseCase.execute({
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      amount: 120.0,
      description: "depósito de salário",
    });
    await expect(
      getStatementOperation.execute({
        user_id: user.id as string,
        statement_id: "abc",
      })
    ).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
});
