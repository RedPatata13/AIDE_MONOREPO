import { IdentityRepository } from "../../db/identityRepository.js";
import { validateStudentInput } from "../helpers/inputValidator.js";

export async function registerStudentController(body: string) {
  if (!validateStudentInput(body)) throw new SyntaxError("Invalid body for creating students");

  const input = JSON.parse(body);
  const repo = new IdentityRepository();

  const student = await repo.createStudent(
    {
      cognitoSub: input.cognitoSub,
      cognitoUsername: input.cognitoUsername,
      email: input.email,
      type: "STUDENT",
      status: "ACTIVATED",
    },
    {
      firstName: input.firstName,
      middleName: input.middleName,
      lastName: input.lastName,
      contactNo: input.contactNo,
      guardianName: input.guardianName,
      guardianContactNo: input.guardianContactNo,
    }
  );

  return student;
}