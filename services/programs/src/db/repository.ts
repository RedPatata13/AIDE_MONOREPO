export interface Repository<T> {
    findById(id: string) : Promise<T | null>;
    findAll() : Promise<T[]>;
    create(input: Partial<T>) : Promise<T>;
    update(id: string, updateInput: Partial<T>) : Promise<T>;
    delete(id: string) : Promise<T>;
}