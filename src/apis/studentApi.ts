import * as express from "express";
import { ConnectionFactory, DynamicQuery, IConnection, MappingProvider, SortDescriptor, SortDirection } from "tsbatis";
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

        studentApi.get("/", (req, res, next) => {
            this.getStudents()
                .then((student) => {
                    res.json(student);
                }).catch((err) => {
                    res.status(500).send(err);
                });
        });

        studentApi.delete("/:id", (req, res, next) => {
            const id = req.params.id;
            this.deleteStudent(id)
                .then(() => {
                    res.json("success");
                }).catch((err) => {
                    res.status(500).send(err);
                });
        });

        studentApi.put("/", (req, res, next) => {
            const id = req.params.id;
            const newStudents = MappingProvider.toEntities<Student>(Student, req.body, false);
            this.updateStudent(newStudents)
                .then(() => {
                    res.json("success");
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

        let connection: IConnection;
        try {
            connection = await this.connectionFactory.getConnection();
            await connection.beginTransaction();
            try {
                const studentMapper = new StudentMapper(connection);
                for (const student of students) {
                    student.createTime = new Date();
                    student.updateTime = new Date();
                    const newStudentId = await studentMapper.insert(student, true);
                    newStudentIds.push(newStudentId);
                }
                await connection.commit();
                return new Promise<number[]>((resolve, reject) => resolve(newStudentIds));
            } catch (e) {
                await connection.rollback();
                return new Promise<number[]>((resolve, reject) => reject(e));
            }
        } catch (e) {
            return new Promise<number[]>((resolve, reject) => reject(e));
        } finally {
            if (connection) {
                try {
                    await connection.release();
                } catch (releaseError) {
                    // nothing to do.
                    console.error(releaseError);
                }
            }
        }
    }

    private async deleteStudent(id: number): Promise<void> {
        let connection: IConnection;
        try {
            connection = await this.connectionFactory.getConnection();
            const studentMapper = new StudentMapper(connection);
            await studentMapper.deleteByPrimaryKey(id);
            return new Promise<void>((resolve, reject) => resolve());
        } catch (e) {
            return new Promise<void>((resolve, reject) => reject(e));
        } finally {
            if (connection) {
                try {
                    await connection.release();
                } catch (releaseError) {
                    // nothing to do.
                    console.error(releaseError);
                }
            }
        }
    }

    private async updateStudent(students: Student[]): Promise<void> {
        if (!students || students.length === 0) {
            return new Promise<void>((resolve, reject) => resolve());
        }

        let connection: IConnection;
        try {
            connection = await this.connectionFactory.getConnection();
            await connection.beginTransaction();
            try {
                const studentMapper = new StudentMapper(connection);
                for (const student of students) {
                    student.updateTime = new Date();
                    await studentMapper.updateByKeySelective(student);
                }
                await connection.commit();
                return new Promise<void>((resolve, reject) => resolve());
            } catch (e) {
                await connection.rollback();
                return new Promise<void>((resolve, reject) => reject(e));
            }
        } catch (e) {
            return new Promise<void>((resolve, reject) => reject(e));
        } finally {
            if (connection) {
                try {
                    await connection.release();
                } catch (releaseError) {
                    // nothing to do.
                    console.error(releaseError);
                }
            }
        }
    }

    private async getStudents(): Promise<Student[]> {
        let connection: IConnection;
        try {
            connection = await this.connectionFactory.getConnection();
            const studentMapper = new StudentMapper(connection);
            const query = DynamicQuery.createIntance<Student>();
            const idDescSort = new SortDescriptor<Student>((s) => s.id, SortDirection.DESC);
            query.addSorts(idDescSort);
            const students = await studentMapper.selectByDynamicQuery(query);
            return new Promise<Student[]>((resolve, reject) => resolve(students));
        } catch (e) {
            return new Promise<Student[]>((resolve, reject) => reject(e));
        } finally {
            if (connection) {
                try {
                    await connection.release();
                } catch (releaseError) {
                    // nothing to do.
                    console.error(releaseError);
                }
            }
        }
    }
}
