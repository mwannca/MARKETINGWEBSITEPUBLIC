export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    // Add other properties if needed, like email, roles, etc.
  };
}
