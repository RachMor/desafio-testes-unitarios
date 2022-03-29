import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let usersRepositoryInMemory: InMemoryUsersRepository;
let authenticateUserUseCase: AuthenticateUserUseCase;
let createUserUseCase: CreateUserUseCase;

describe("Authenticate User", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(
      usersRepositoryInMemory
    );
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
  });

  it("should be able to authenticate an existent user", async () => {
    await createUserUseCase.execute({
      name: "test",
      email: "test@gmail.com",
      password: "test",
    });
    const authenticate = await authenticateUserUseCase.execute({
      email: "test@gmail.com",
      password: "test",
    });

    expect(authenticate).toHaveProperty("token");
  });

  it("should not be able to authenticate an existent user with incorrect email", async () => {
    await createUserUseCase.execute({
      name: "test",
      email: "test@gmail.com",
      password: "test",
    });
    await expect(
      authenticateUserUseCase.execute({
        email: "teste@gmail.com",
        password: "test",
      })
    ).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it("should not be able to authenticate an existent user with incorrect password", async () => {
    await createUserUseCase.execute({
      name: "test",
      email: "test@gmail.com",
      password: "teste",
    });
    await expect(
      authenticateUserUseCase.execute({
        email: "test@gmail.com",
        password: "test",
      })
    ).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

});
