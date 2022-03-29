import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from './CreateUserError';
import { CreateUserUseCase } from "./CreateUserUseCase";

let createUserUseCase: CreateUserUseCase;
let usersRepositoryInMemory: InMemoryUsersRepository;

describe("Create User", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
  });

  it("should be able to create a new user", async () => {
    const user = await createUserUseCase.execute({
      name: "test",
      email: "test@gmail.com",
      password: "test",
    });
    expect(user).toHaveProperty("id");
  });

  it("should not be be able to create a new user if email already exists", async () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: "test",
        email: "test@gmail.com",
        password: "test",
      });
      const user = await createUserUseCase.execute({
        name: "test",
        email: "test@gmail.com",
        password: "test",
      });
    }).rejects.toBeInstanceOf(CreateUserError);
  });
});
