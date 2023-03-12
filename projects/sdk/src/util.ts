import { pipe } from "ramda";

const printDanger = process.env.PRINT_DANGER;

export const printDangerWarning = () => {
  if (printDanger)
    console.log(`
*****************************************************************
Danger! You have PRINT_DANGER set, your console output may include
sensitive information, be careful if you share debug information 
with others.
*****************************************************************
`);
};

/**
 * We have some data that needs to be logged for troubleshooting but
 * shouldn't be generally included in log files to keep your identity safe.
 */
export const anonLog = (safeMessage: string, dangerousMessage?: string) => {
  pipe(removeUsername, console.log)(safeMessage);
  if (printDanger && dangerousMessage)
    pipe(
      // This _is_ the dangerous message, but username isn't worth the benefit
      removeUsername,
      console.log
    )(dangerousMessage);
};

export const removeUsername = (str: string) =>
  process.env.USER ? str.replace(process.env.USER, "<usernamescrubbed>") : str;
