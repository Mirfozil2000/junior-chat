export interface IUser {
  id: string;
  username: string;
  password: string;
}

export interface JwtPayload {
  id: string;
  username: string;
}
