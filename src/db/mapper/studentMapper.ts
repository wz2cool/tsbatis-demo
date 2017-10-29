import { BaseTableMapper } from "tsbatis";
import { Student } from "../entity/table/student";

export class StudentMapper extends BaseTableMapper<Student> {
    public getEntityClass(): new () => Student {
        return Student;
    }
}
