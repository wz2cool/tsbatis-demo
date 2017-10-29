import * as express from "express";
import { ConnectionFactory, IConnection, MappingProvider } from "tsbatis";
import { Student } from "../db/entity/table/student";
import { StudentMapper } from "../db/mapper/studentMapper";
import { myContainer } from "../ioc/inversify.config";

export class StudentApi {
    private readonly connectionFactory: ConnectionFactory;
    constructor() {
        this.connectionFactory = myContainer.get<ConnectionFactory>(ConnectionFactory);
    }

    public getRoute(): express.Router {
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

    private async addStudents(students: Student[]): Promise<number[]> {
        const newStudentIds: number[] = [];
        if (!students || students.length === 0) {
            return new Promise<number[]>((resolve, reject) => resolve(newStudentIds));
        }

        let transConn: IConnection;
        try {
            transConn = await this.connectionFactory.getConnection();
            await transConn.beginTransaction();
            try {
                const transMapper = new StudentMapper(transConn);
                for (const student of students) {
                    student.createTime = new Date();
                    student.updateTime = new Date();
                    const newStudentId = await transMapper.insert(student, true);
                    newStudentIds.push(newStudentId);
                }
                await transConn.commit();
                return new Promise<number[]>((resolve, reject) => resolve(newStudentIds));
            } catch (e) {
                await transConn.rollback();
                return new Promise<number[]>((resolve, reject) => reject(e));
            }
        } catch (e) {
            return new Promise<number[]>((resolve, reject) => reject(e));
        } finally {
            if (transConn) {
                await transConn.release();
            }
        }
    }
}
