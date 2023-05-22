import { DataSource } from 'typeorm';
import { User } from '../../model/entity/User';
import { Student } from '../../model/entity/Student';
import { Grade } from '../../model/entity/Grade';
import { Document } from '../../model/entity/Document';
import { Department } from '../../model/entity/Department';
import { Specialist } from '../../model/entity/Specialist';
import { DocumentRequest } from '../../model/entity/DocumentRequest';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.HOST_LOCAL_DB,
  port: 3306,
  username: process.env.LOCAL_DB_USERNAME,
  password: process.env.LOCAL_DB_PASSWORD,
  database: process.env.LOCAL_DB_DATABASE,
  entities: [User, Document, Department, Specialist, DocumentRequest],
  synchronize: true,
});

export const NaukmaDataSource = new DataSource({
  type: 'mssql',
  host: process.env.HOST_NAUKMA_DB,
  username: process.env.NAUKMA_DB_USERNAME,
  password: process.env.NAUKMA_DB_PASSWORD,
  database: process.env.NAUKMA_DB_DATABASE,
  schema: 'dbo',
  options: {
    encrypt: false,
  },
  entities: [Student, Grade],
});
