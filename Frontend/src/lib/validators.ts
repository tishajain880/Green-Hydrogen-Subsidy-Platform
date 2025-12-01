// Shared client-side validators mirroring backend rules

// EMAIL — must be a valid email, any domain allowed
export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// PASSWORD — min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character
export const passwordRegex =
  /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-={}\[\]|:;"'<>,.?/]).{8,}$/;

// NAME — only letters and spaces
export const nameRegex = /^[A-Za-z ]+$/;

export function validateEmail(email: string) {
  if (!email || typeof email !== "string")
    return { ok: false, message: "Email is required" };

  if (!emailRegex.test(email))
    return { ok: false, message: "Please enter a valid email address" };

  return { ok: true };
}

export function validatePassword(password: string) {
  if (!password || typeof password !== "string")
    return { ok: false, message: "Password is required" };

  if (!passwordRegex.test(password))
    return {
      ok: false,
      message:
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character",
    };

  return { ok: true };
}

export function validateName(name: string) {
  if (!name || typeof name !== "string" || name.trim().length === 0)
    return { ok: false, message: "Name is required" };

  if (name.length > 200)
    return { ok: false, message: "Name too long (max 200 chars)" };

  if (!nameRegex.test(name))
    return {
      ok: false,
      message: "Name can contain only letters and spaces",
    };

  return { ok: true };
}

export function validateSchemeForm(data: any) {
  if (!data) return { ok: false, message: "Missing form data" };
  if (!data.title && !data.name)
    return { ok: false, message: "Scheme name is required" };

  const title = data.title || data.name;

  if (typeof title !== "string" || title.trim().length === 0)
    return { ok: false, message: "Scheme name is required" };

  if (title.length > 200)
    return { ok: false, message: "Scheme name too long (max 200 chars)" };

  if (data.description && data.description.length > 2000)
    return {
      ok: false,
      message: "Description too long (max 2000 chars)",
    };

  if (data.targetValue !== undefined) {
    const n = Number(data.targetValue);
    if (isNaN(n) || n <= 0)
      return {
        ok: false,
        message: "Target value must be a positive number",
      };
  }

  if (data.subsidyAmount !== undefined) {
    const s = Number(data.subsidyAmount);
    if (isNaN(s) || s < 0)
      return {
        ok: false,
        message: "Subsidy amount must be a number",
      };
  }

  if (data.milestones) {
    if (!Array.isArray(data.milestones))
      return { ok: false, message: "Milestones must be an array" };

    for (const m of data.milestones) {
      if (!m.title && !m.name)
        return { ok: false, message: "Each milestone must have a title" };

      if (
        m.requiredProduction !== undefined &&
        isNaN(Number(m.requiredProduction))
      )
        return {
          ok: false,
          message: "Milestone requiredProduction must be numeric",
        };
    }
  }

  return { ok: true };
}

export function validateMilestoneSubmission(form: any) {
  if (!form) return { ok: false, message: "Missing submission data" };
  if (!form.projectId) return { ok: false, message: "Select a project" };

  if (
    form.index === undefined ||
    isNaN(Number(form.index)) ||
    Number(form.index) < 0
  )
    return { ok: false, message: "Invalid milestone index" };

  if (
    form.productionValue !== undefined &&
    form.productionValue !== "" &&
    isNaN(Number(form.productionValue))
  )
    return {
      ok: false,
      message: "Production value must be numeric",
    };

  return { ok: true };
}

export default {
  validateEmail,
  validatePassword,
  validateName,
  validateSchemeForm,
  validateMilestoneSubmission,
};
