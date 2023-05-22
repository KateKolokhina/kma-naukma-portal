import { DocumentStatus } from '../entity/types';
import { Grade } from '../entity/Grade';

export interface DocumentRequestDetails {
  //// request information ////
  officialCode: string;
  creationDate: string;
  finishedDate?: string;

  status: DocumentStatus;
  specialistFio: string;
  docType: string;
  comment: string;

  //// student information ////
  studentFio?: string;
  yearOfStudy?: number;
  studentEmail?: string;

  modeOfStudy?: string;

  // contract or paid-by-government
  formOfStudy?: string;

  faculty?: string;
  speciality?: string;

  // bachelor or master
  degreeLevel?: string;

  specialistEmail?: string;

  // term of study
  startTerm?: string;
  endTerm?: string;

  grades?: Grade[];
}
