export enum UserRole {
  ADMIN = "admin",
  USER = "user",
  SPECIALIST = "specialist",
}

export enum DocumentStatus {
  CREATED = "Створено",
  IN_WORK = "В роботі",
  DONE = "Виконано",
  REJECT = "Відмінено",
}

export enum ReceiveType{
  E_COPY = "e-copy",
  ORIGINAL = "original"
}

export const transormRoles = function(list: UserRole[]): string[] {
  const res: string[] = [];
  if (list.length == 0) {
    return [];
  }

  list.forEach(function(elem) {
    if (elem == UserRole.ADMIN) {
      res.push("Адміністратор");
    } else if (elem == UserRole.USER) {
      res.push("Студент");
    } else if (elem == UserRole.SPECIALIST) {
      res.push("Спеціаліст");
    }
  });
  return res;

};
