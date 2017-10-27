import { injectable } from "inversify";
import "reflect-metadata";
import { BaseTableMapper } from "tsbatis";
import { Student } from "../entity/table/student";

@injectable()
export class StudentMapper extends BaseTableMapper<Student> {
    public getEntityClass(): new () => Student {
        return Student;
    }
}
