export function mapPgError(err: any) {
  // Postgres error codes: https://www.postgresql.org/docs/current/errcodes-appendix.html
  if (!err || !err.code)
    return { status: 500, message: err?.message || "Internal server error" };
  switch (err.code) {
    case "23505": // unique_violation
      return { status: 409, message: err.detail || "Duplicate entry" };
    case "23503": // foreign_key_violation
      return {
        status: 400,
        message: err.detail || "Foreign key constraint violation",
      };
    case "22P02": // invalid_text_representation (bad UUID, etc)
      return { status: 400, message: "Invalid input format" };
    default:
      return { status: 500, message: err?.message || "Database error" };
  }
}
