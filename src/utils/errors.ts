export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

export class DuplicateEmailError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DuplicateEmailError";
  }
}
