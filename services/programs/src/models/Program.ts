export interface Course {
    courseId : string;
    courseName: string;
    units: number;
}

export interface Program {
    programId : string;
    programName : string;
    unitsRequired : number;
    minResidency: number;
    maxResidency: number;
    mandatoryCourses : Course[];
    status: 'active' | 'inactive'
}
