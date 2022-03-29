import { User } from "../../entities/User";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let usersRepositoryInMemory: InMemoryUsersRepository;
let showUserProfileUseCase: ShowUserProfileUseCase;
let createUserUseCase: CreateUserUseCase;

describe("Show User Profile", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(
      usersRepositoryInMemory
    );
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
  });
  it("should be able to see a user profile", async () => {
    const user = await createUserUseCase.execute({
      name: "test",
      email: "test@gmail.com",
      password: "test",
    });
    const userProfile = await showUserProfileUseCase.execute(user.id as string);
    expect(userProfile).toBeInstanceOf(User);
  });

  it("should not be able to see a user profile if incorrect id", async () => {
    const user = await createUserUseCase.execute({
      name: "test",
      email: "test@gmail.com",
      password: "test",
    });
    await expect(
      showUserProfileUseCase.execute((user.id + "a1c") as string)
    ).rejects.toBeInstanceOf(ShowUserProfileError);
  });
});
