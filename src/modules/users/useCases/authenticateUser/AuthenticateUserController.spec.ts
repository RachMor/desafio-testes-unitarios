import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { app } from "../../../../app";
import "reflect-metadata";

let connection: Connection;
describe("Create User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to authenticate an existent user", async () => {
    await request(app).post("/api/v1/users").send({
      name: "user",
      email: "user@user.com",
      password: "user",
    });

    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "user@user.com",
      password: "user",
    });
    expect(responseToken.body).toHaveProperty("token");
    expect(responseToken.statusCode).toBe(200);
  });

  it("should not be able to authenticate a user with incorrect email", async () => {
    await request(app).post("/api/v1/users").send({
      name: "user",
      email: "user@user.com",
      password: "user",
    });

    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "user@wrong.com",
      password: "user",
    });
    expect(responseToken.statusCode).toBe(401);
  });

  it("should not be able to authenticate a user with incorrect password", async () => {
    await request(app).post("/api/v1/users").send({
      name: "user",
      email: "user@user.com",
      password: "user",
    });

    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "user@user.com",
      password: "wrong",
    });
    expect(responseToken.statusCode).toBe(401);
  });
});
