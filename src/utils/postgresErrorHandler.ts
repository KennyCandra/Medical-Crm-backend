import { Response } from "express";
import { StatusCodes, ReasonPhrases } from "http-status-codes";

export interface DatabaseError extends Error {
  code?: string;
  constraint?: string;
  column?: string;
  detail?: string;
  table?: string;
}

export const handlePostgresError = (
  err: DatabaseError,
  res: Response
): boolean => {
  console.log(err);
  switch (err.code) {
    case "23503":
      const constraintMatch = err.detail?.match(/Key \((\w+)\)/);
      const field = constraintMatch ? constraintMatch[1] : "reference";

      let message = "Invalid reference";
      if (field.includes("doctor") || err.constraint?.includes("doctor")) {
        message = "Doctor not found";
      } else if (
        field.includes("patient") ||
        err.constraint?.includes("patient")
      ) {
        message = "Patient not found";
      } else if (field.includes("drug") || err.constraint?.includes("drug")) {
        message = "One or more drugs not found";
      }

      res.status(StatusCodes.BAD_REQUEST).json({
        message,
        field,
      });
      return true;

    case "22P02":
      res.status(StatusCodes.BAD_REQUEST).json({
        message: "Invalid data format provided",
      });
      return true;

    case "23505":
      res.status(StatusCodes.CONFLICT).json({
        message: "Duplicate entry detected",
      });
      return true;

    case "23502":
      const columnName = err.column || "unknown field";
      res.status(StatusCodes.BAD_REQUEST).json({
        message: `Required field '${columnName}' is missing`,
      });
      return true;

    case "23514":
      res.status(StatusCodes.BAD_REQUEST).json({
        message: "Data validation failed",
      });
      return true;

    case "ECONNREFUSED":
    case "ENOTFOUND":
      res
        .status(StatusCodes.SERVICE_UNAVAILABLE)
        .json({ message: ReasonPhrases.SERVICE_UNAVAILABLE });
      return true;

    default:
      return false;
  }
};
