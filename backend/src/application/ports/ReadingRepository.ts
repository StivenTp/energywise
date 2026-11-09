import { Reading, ReadingInput } from '../../domain/Reading';
/** Puerto: los casos de uso dependen de esta abstracción, nunca de MongoDB. */
export interface ReadingRepository {
  findAll(): Promise<Reading[]>;
  create(input: ReadingInput): Promise<Reading>;
  update(id: string, input: ReadingInput): Promise<Reading | null>;
  delete(id: string): Promise<boolean>;
  count(): Promise<number>;
  createMany(inputs: ReadingInput[]): Promise<number>;
}
