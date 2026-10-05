export class NotFoundError extends Error {
    constructor(message: string = 'Resource not found.') {
        super(message);
        this.name = 'NotFoundError';
    }
}

export class BadRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BadRequestError';
  }
}

export class UnauthorizedError extends Error {
  constructor(message: string = 'Unauthorized access.') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}