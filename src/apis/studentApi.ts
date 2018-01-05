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
                .then((students) => {
                    console.log("return json");
                    res.json(students);
                }).catch((err) => {
                    res.status(500).send(err);
                });
        });

        studentApi.get("/:id", (req, res, next) => {
            const id = req.params.id;
            this.getStudent(id)
                .then((student) => {
                    console.log("return json");
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

        try {
            const connection = await this.connectionFactory.getConnection();
            try {
                await connection.beginTransaction();
                try {
                    const studentMapper = new StudentMapper(connection);
                    for (const student of students) {
                        student.createTime = new Date();
                        student.updateTime = new Date();
                        const effectRows = await studentMapper.insert(student);
                        console.log("effectRows: ", effectRows);
                        newStudentIds.push(student.id);
                    }
                    await connection.commit();
                    await connection.release();
                    return new Promise<number[]>((resolve, reject) => resolve(newStudentIds));
                } catch (e) {
                    await connection.rollback();
                    await connection.release();
                    return new Promise<number[]>((resolve, reject) => reject(e));
                }
            } catch (beginTransError) {
                await connection.release();
                return new Promise<number[]>((resolve, reject) => reject(beginTransError));
            }
        } catch (getConnError) {
            return new Promise<number[]>((resolve, reject) => reject(getConnError));
        }
    }

    private async deleteStudent(id: number): Promise<void> {
        try {
            const connection = await this.connectionFactory.getConnection();
            try {
                const studentMapper = new StudentMapper(connection);
                const effectRows = await studentMapper.deleteByPrimaryKey(id);
                console.log("effectRows: ", effectRows);
                connection.release();
                return new Promise<void>((resolve, reject) => resolve());
            } catch (e) {
                connection.release();
                return new Promise<void>((resolve, reject) => reject(e));
            }
        } catch (getConnError) {
            return new Promise<void>((resolve, reject) => reject(getConnError));
        }
    }

    private async updateStudent(students: Student[]): Promise<void> {
        if (!students || students.length === 0) {
            return new Promise<void>((resolve, reject) => resolve());
        }

        try {
            const connection = await this.connectionFactory.getConnection();
            try {
                await connection.beginTransaction();
                try {
                    const studentMapper = new StudentMapper(connection);
                    for (const student of students) {
                        student.updateTime = new Date();
                        const effectRows = await studentMapper.updateByPrimaryKeySelective(student);
                        console.log("effectRows: ", effectRows);
                    }
                    await connection.commit();
                    await connection.release();
                    return new Promise<void>((resolve, reject) => resolve());
                } catch (e) {
                    await connection.rollback();
                    await connection.release();
                    return new Promise<void>((resolve, reject) => reject(e));
                }
            } catch (e) {
                await connection.release();
                return new Promise<void>((resolve, reject) => reject(e));
            }
        } catch (getConnError) {
            return new Promise<void>((resolve, reject) => reject(getConnError));
        }
    }

    private async getStudents(): Promise<Student[]> {
        try {
            const connection = await this.connectionFactory.getConnection();
            try {
                const studentMapper = new StudentMapper(connection);
                const query = DynamicQuery.createIntance<Student>();
                const idDescSort = new SortDescriptor<Student>((s) => s.id, SortDirection.DESC);
                query.addSorts(idDescSort);
                const students = await studentMapper.selectByDynamicQuery(query);
                await connection.release();
                return new Promise<Student[]>((resolve, reject) => resolve(students));
            } catch (e) {
                await connection.release();
                return new Promise<Student[]>((resolve, reject) => reject(e));
            }
        } catch (getConnError) {
            return new Promise<Student[]>((resolve, reject) => reject(getConnError));
        }
    }

    private async getStudent(id: number): Promise<Student> {
        try {
            const connection = await this.connectionFactory.getConnection();
            try {
                const studentMapper = new StudentMapper(connection);
                const students = await studentMapper.selectByPrimaryKey(id);
                await connection.release();
                return new Promise<Student>((resolve, reject) => resolve(students[0]));
            } catch (e) {
                await connection.release();
                return new Promise<Student>((resolve, reject) => reject(e));
            }
        } catch (getConnError) {
            return new Promise<Student>((resolve, reject) => reject(getConnError));
        }
    }
}
