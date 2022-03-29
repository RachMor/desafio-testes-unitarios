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

  it("should be able to create a new statement with type deposit", async () => {
    await request(app).post("/api/v1/users").send({
      name: "newuser",
      email: "newuser@newuser.com",
      password: "newuser",
    });
    const session = await request(app).post("/api/v1/sessions").send({
      email: "newuser@newuser.com",
      password: "newuser",
    });
    const { token } = session.body;
    const deposit = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 10,
        description: "deposit",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(deposit.statusCode).toBe(201);
  });
  it("should be able to create a new statement with type withdraw", async () => {
    const session = await request(app).post("/api/v1/sessions").send({
      email: "newuser@newuser.com",
      password: "newuser",
    });
    const { token } = session.body;
    await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 10,
        description: "deposit",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });
    const withdraw = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 10,
        description: "withdraw",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(withdraw.statusCode).toBe(201);
  });
  it("should not be able to create a new statement if user doesn't exists", async () => {
    const tokenUserNotFound =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiMjlmZmY0YTMtYWE4Ni00MzhkLWI0ZjQtZmViNWI5YWE1ZTczIiwibmFtZSI6InRlc3RlIiwiZW1haWwiOiJ0ZXN0ZUB0ZXN0ZS5jb20iLCJwYXNzd29yZCI6IiQyYSQwOCR0VUlBdmZxbndFTjVpNkl2UVdPbDh1Z3gvU29GWTQ0eU9GVGVodkw5N3VNOWZYRlZMSU15RyIsImNyZWF0ZWRfYXQiOiIyMDIyLTAzLTI5VDE3OjEwOjI4LjA5MVoiLCJ1cGRhdGVkX2F0IjoiMjAyMi0wMy0yOVQxNzoxMDoyOC4wOTFaIn0sImlhdCI6MTY0ODU2MzM3MiwiZXhwIjoxNjQ4NjQ5NzcyLCJzdWIiOiIyOWZmZjRhMy1hYTg2LTQzOGQtYjRmNC1mZWI1YjlhYTVlNzMifQ.DFjeu6llGYkf6GCbUM_uGkzXC9CCgdrdktueDwVjahg";
    const deposit = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 25,
        description: "deposit",
      })
      .set({
        Authorization: `Bearer ${tokenUserNotFound}`,
      });

    expect(deposit.statusCode).toBe(404);
  });
  it("should not be able to create statement with invalid token", async () => {
    const invalidToken = "uGkzXC9CCgdrdktueDwVjahgaa";
    const statement = await request(app)
      .get("/api/v1/statements/deposit")
      .send({
        amount: 25,
        description: "deposit",
      })
      .set({
        Authorization: `Bearer ${invalidToken}`,
      });
    expect(statement.statusCode).toBe(401);
  });
  it("should not be able to create a new statement with type withdraw if balance less than amount", async () => {
    const session = await request(app).post("/api/v1/sessions").send({
      email: "newuser@newuser.com",
      password: "newuser",
    });
    const { token } = session.body;
    const withdraw = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 100,
        description: "withdraw",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });
    expect(withdraw.statusCode).toBe(400);
  });
});
