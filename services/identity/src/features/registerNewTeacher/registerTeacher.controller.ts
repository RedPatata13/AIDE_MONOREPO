import { IdentityRepository } from "../../db/identityRepository.js";
import { validateStudentInput, validateTeacherInput } from "../helpers/inputValidator.js";

export async function registerTeacherController(body: string) {
  if (!validateTeacherInput(body)) throw new SyntaxError("Invalid body for creating students");

  const input = JSON.parse(body);
  const repo = new IdentityRepository();

  const student = await repo.createTeacher(
    {
      cognitoSub: input.cognitoSub,
      cognitoUsername: input.cognitoUsername,
      email: input.email,
      type: "TEACHER",
      status: "ACTIVATED",
    },
    {
      firstName: input.firstName,
      middleName: input.middleName,
      lastName: input.lastName,
      contactNo: input.contactNo,
    }
  );

  return student;
}