import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

let statementRepository: InMemoryStatementsRepository;
let usersRepository: InMemoryUsersRepository;
let createStatementUseCase: CreateStatementUseCase;
let createUserUseCase: CreateUserUseCase;
let getBalanceUseCase: GetBalanceUseCase;
describe("Get Balance", () => {
  beforeEach(() => {
    statementRepository = new InMemoryStatementsRepository();
    usersRepository = new InMemoryUsersRepository();
    createStatementUseCase = new CreateStatementUseCase(
      usersRepository,
      statementRepository
    );
    createUserUseCase = new CreateUserUseCase(usersRepository);

    getBalanceUseCase = new GetBalanceUseCase(
      statementRepository,
      usersRepository
    );
  });
  it("should be able to get balance", async () => {
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
    const withdraw = await createStatementUseCase.execute({
      user_id: user.id as string,
      type: OperationType.WITHDRAW,
      amount: 70.0,
      description: "saque de salário",
    });
    const balance = await getBalanceUseCase.execute({
      user_id: user.id as string,
    });
    expect(balance.statement).toContain(withdraw);
    expect(balance).toHaveProperty("balance");
  });

  it("should not be able to get balance if user doens't exists", async () => {
    await expect(
      getBalanceUseCase.execute({
        user_id: "abc",
      })
    ).rejects.toBeInstanceOf(GetBalanceError);
  });
});
