import * as express from "express";
import { ConnectionFactory, MappingProvider } from "tsbatis";
import { Student } from "../db/entity/table/student";
import { StudentMapper } from "../db/mapper/studentMapper";
import { myContainer } from "../ioc/inversify.config";

export class StudentApi {

    public static getRoute(): express.Router {
        const studentApi = express.Router();
        studentApi.post("/", (req, res, next) => {
            const newStudents = MappingProvider.toEntities<Student>(Student, req.body, false);
            console.log(newStudents);
            this.addStudents(newStudents)
                .then((ids) => {
                    res.json(ids);
                }).catch((err) => {
                    res.status(500).send(err);
                });
        });
        return studentApi;
    }

    private static async addStudents(students: Student[]): Promise<number[]> {
        try {
            const newStudentIds: number[] = [];
            if (!students || students.length === 0) {
                return new Promise<number[]>((resolve, reject) => resolve(newStudentIds));
            }

            const connectionFactory = myContainer.get<ConnectionFactory>(ConnectionFactory);
            const transConn = await connectionFactory.getConnection();
            try {
                try {
                    const transMapper = new StudentMapper(transConn);
                    for (const student of students) {
                        student.createTime = new Date();
                        student.updateTime = new Date();
                        const newStudentId = await transMapper.insert(student, true);
                        newStudentIds.push(newStudentId);
                    }
                    return new Promise<number[]>((resolve, reject) => resolve(newStudentIds));
                } catch (e) {
                    await transConn.rollback();
                    return new Promise<number[]>((resolve, reject) => reject(e));
                }
            } catch (beginTransError) {
                return new Promise<number[]>((resolve, reject) => reject(beginTransError));
            } finally {
                await transConn.release();
            }
        } catch (getConnError) {
            return new Promise<number[]>((resolve, reject) => reject(getConnError));
        }
    }
}
