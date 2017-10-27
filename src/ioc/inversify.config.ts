import { Container } from "inversify";
import * as mysql from "mysql";
import "reflect-metadata";
import { MysqlPool } from "tsbatis";
import { StudentMapper } from "../db/mapper/studentMapper";

const pool = mysql.createPool({
    host: "sql12.freemysqlhosting.net",
    port: 3306,
    // tslint:disable-next-line:object-literal-sort-keys
    database: "sql12200910",
    user: "sql12200910",
    password: "ku8lhu9lAg",
});

const mysqlPool = new MysqlPool(pool, true);
const studentMapper = new StudentMapper(mysqlPool);

const myContainer = new Container();
myContainer.bind(StudentMapper).toConstantValue(studentMapper);

export { myContainer };
