import { Reading, ReadingInput } from '../../domain/Reading';

/** ISP: el panel solo necesita consultas, no operaciones de escritura. */
export interface ReadingQueryPort {
  findAll(): Promise<Reading[]>;
}

/** ISP: los casos de uso de edición requieren un contrato separado. */
export interface ReadingCommandPort {
  create(input: ReadingInput): Promise<Reading>;
  update(id: string, input: ReadingInput): Promise<Reading | null>;
  delete(id: string): Promise<boolean>;
  count(): Promise<number>;
  createMany(inputs: ReadingInput[]): Promise<number>;
}

/** Contrato completo implementado por cualquier adaptador de persistencia. */
export interface ReadingRepository extends ReadingQueryPort, ReadingCommandPort {}
