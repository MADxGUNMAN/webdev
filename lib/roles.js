// User role constants & helpers

export const ROLES = {
    STUDENT: 'student',
    TEACHER: 'teacher',
    ADMIN: 'admin',
};

export const TEACHER_STATUS = {
    PENDING: 'pending',
    APPROVED: 'approved',
    BLOCKED: 'blocked',
};

export function isAdmin(userData) {
    return userData?.role === ROLES.ADMIN;
}

export function isTeacher(userData) {
    return userData?.role === ROLES.TEACHER;
}

export function isApprovedTeacher(userData) {
    return userData?.role === ROLES.TEACHER && userData?.teacherStatus === TEACHER_STATUS.APPROVED;
}

export function isPendingTeacher(userData) {
    return userData?.role === ROLES.TEACHER && userData?.teacherStatus === TEACHER_STATUS.PENDING;
}

export function isBlockedTeacher(userData) {
    return userData?.role === ROLES.TEACHER && userData?.teacherStatus === TEACHER_STATUS.BLOCKED;
}
