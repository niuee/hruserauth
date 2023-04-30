export declare function getUsers(): Promise<import("pg").QueryResult<any>>;
export declare function getPassword(username: string): Promise<any>;
export declare function createUser(username: string, password: string): Promise<{
    id: any;
    username: any;
}>;
