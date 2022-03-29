import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { app } from "../../../../app";
import "reflect-metadata";

let connection: Connection;
describe("Get Statement Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able do get a statement by id", async () => {
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
        amount: 100.0,
        description: "deposit",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });
    const { id } = deposit.body;
    const getStatement = await request(app)
      .get(`/api/v1/statements/${id}`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(getStatement.statusCode).toBe(200);
    expect(getStatement.body.id).toBe(id);
  });

  it("should not be able do get a statement by id if user doesn't exists", async () => {
    const tokenUserNotFound =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiMjlmZmY0YTMtYWE4Ni00MzhkLWI0ZjQtZmViNWI5YWE1ZTczIiwibmFtZSI6InRlc3RlIiwiZW1haWwiOiJ0ZXN0ZUB0ZXN0ZS5jb20iLCJwYXNzd29yZCI6IiQyYSQwOCR0VUlBdmZxbndFTjVpNkl2UVdPbDh1Z3gvU29GWTQ0eU9GVGVodkw5N3VNOWZYRlZMSU15RyIsImNyZWF0ZWRfYXQiOiIyMDIyLTAzLTI5VDE3OjEwOjI4LjA5MVoiLCJ1cGRhdGVkX2F0IjoiMjAyMi0wMy0yOVQxNzoxMDoyOC4wOTFaIn0sImlhdCI6MTY0ODU2MzM3MiwiZXhwIjoxNjQ4NjQ5NzcyLCJzdWIiOiIyOWZmZjRhMy1hYTg2LTQzOGQtYjRmNC1mZWI1YjlhYTVlNzMifQ.DFjeu6llGYkf6GCbUM_uGkzXC9CCgdrdktueDwVjahg";
    const session = await request(app).post("/api/v1/sessions").send({
      email: "newuser@newuser.com",
      password: "newuser",
    });
    const { token } = session.body;
    const deposit = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 100.0,
        description: "deposit",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });
    const { id } = deposit.body;
    const getStatement = await request(app)
      .get(`/api/v1/statements/${id}`)
      .set({
        Authorization: `Bearer ${tokenUserNotFound}`,
      });
    expect(getStatement.statusCode).toBe(404);
  });
  it("should not be able do get a statement by id if statement doesn't exists", async () => {
    const session = await request(app).post("/api/v1/sessions").send({
      email: "newuser@newuser.com",
      password: "newuser",
    });
    const { token } = session.body;
    const statementIdNotExists = "93bf429c-78eb-4300-a142-2044828cb4f3";
    const getStatement = await request(app)
      .get(`/api/v1/statements/${statementIdNotExists}`)
      .set({
        Authorization: `Bearer ${token}`,
      });
    expect(getStatement.statusCode).toBe(404);
  });
});
