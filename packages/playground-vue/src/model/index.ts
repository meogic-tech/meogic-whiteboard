

export enum GENDER {Male, Female};


let userIdStart = -1

export type User = {
    userId: number,
    name: string,
    gender: GENDER,
    detail: string,
}

export const createUser = (user: Omit<User, "userId">) : User => {
    return {
        userId: userIdStart ++,
        ...user
    }
}

