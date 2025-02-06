import { User } from './user.model';
import { Admin } from './admin.model';


export class Team {
    constructor(
        public id: number,
        public teamName: string,
        public points: number,
        public date?: Date,
        public viewValue?: string,
        public admin?: Admin[],
        public user?: User[]
    ) {}
}