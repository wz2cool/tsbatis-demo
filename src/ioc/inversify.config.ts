import { Container } from "inversify";
import * as path from "path";
import "reflect-metadata";
import { ConnectionFactory, SqliteConnectionConfig } from "tsbatis";

const config = new SqliteConnectionConfig();
config.filepath = path.join(__dirname, "../northwind.db");

const connectionFactory = new ConnectionFactory(config, true);
const myContainer = new Container();
myContainer.bind(ConnectionFactory).toConstantValue(connectionFactory);

export { myContainer };
