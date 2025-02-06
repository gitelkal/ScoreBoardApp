import { Team } from './team.model';
import { Admin } from './admin.model';
import { User } from './user.model';

export class Home {
    constructor(
        public id: number,
        public name: string,
        public teams: Team[],
        public user: User[],
        public max_points: number,
        public date: Date,
        public administered_by: Admin[]
    ) {}
}