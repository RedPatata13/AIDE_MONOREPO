import { IdentityRepository } from "../../db/identityRepository.js";
import { validateAdminInput } from "../helpers/inputValidator.js";

export async function registerAdminController(body: string) {
  if (!validateAdminInput(body)) throw new SyntaxError("Invalid body for creating students");

  const input = JSON.parse(body);
  const repo = new IdentityRepository();

  const admin = await repo.createAdmin(
    {
      cognitoSub: input.cognitoSub,
      cognitoUsername: input.cognitoUsername,
      email: input.email,
      type: "ADMIN",
      status: "ACTIVATED",
    },
    {
      firstName: input.firstName,
      middleName: input.middleName,
      lastName: input.lastName,
    }
  );

  return admin;
}