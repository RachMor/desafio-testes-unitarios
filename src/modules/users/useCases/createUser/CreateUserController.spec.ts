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

  it("should be able to create a new user", async () => {
    const response = await request(app).post("/api/v1/users").send({
      name: "newuser",
      email: "newuser@newuser.com",
      password: "newuser",
    });

    expect(response.statusCode).toBe(201);
  });

  it("should not be able to create a new user if email already exists", async () => {
    await request(app).post("/api/v1/users").send({
      name: "newuser2",
      email: "newuser@newuser.com",
      password: "newuser2",
    });
    const response = await request(app).post("/api/v1/users").send({
      name: "newuser",
      email: "newuser@newuser.com",
      password: "newuser",
    });
    expect(response.statusCode).toBe(400);
  });
});
