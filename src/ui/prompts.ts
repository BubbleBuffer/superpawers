import prompts from "prompts";

/**
 * Log "Cancelled." and exit. Called when user aborts a prompt.
 */
export function cancelPrompt(): never {
  console.log("Cancelled.");
  process.exit(1);
}

/**
 * Show a yes/no confirmation prompt.
 * Returns the boolean result. Exits on cancel.
 */
export async function confirmPrompt(
  message: string,
  initial: boolean = true
): Promise<boolean> {
  const response = await prompts({
    type: "confirm",
    name: "value",
    message,
    initial,
  });
  if (response.value === undefined) {
    cancelPrompt();
  }
  return response.value as boolean;
}

/**
 * Show a single-select prompt.
 * Returns the selected value. Exits on cancel.
 */
export async function selectPrompt<T extends string>(
  message: string,
  choices: Array<{ title: string; value: T }>,
  initial?: T
): Promise<T> {
  const response = await prompts({
    type: "select",
    name: "value",
    message,
    choices,
    initial: initial
      ? choices.findIndex((c) => c.value === initial)
      : undefined,
  });
  if (response.value === undefined) {
    cancelPrompt();
  }
  return response.value as T;
}
