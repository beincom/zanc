export interface AppStatesLoader<T= any,R = any> {

  fetch(...args: any[]): Promise<R>;

  update(input: T, deleteKeys: string[]): Promise<boolean>;

  delete(input: T): Promise<boolean>;
}
