export class RequestTypesDto {
  readonly receiveType!: string;
  readonly docType!: number;
  readonly comment?: string;
}

export class RequestEdit {
  readonly id: number;
  readonly receiveType?: string;
  readonly docType?: number;
  readonly comment?: string;
}
