import { useState, useCallback } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ValidationRule {
  validate: (value: any) => boolean;
  message: string;
}

export interface FormErrors {
  [fieldName: string]: string | undefined;
}

interface UseFormValidationOptions {
  rules: {
    [fieldName: string]: ValidationRule[];
  };
}

export function useFormValidation({ rules }: UseFormValidationOptions) {
  const [errors, setErrors] = useState<FormErrors>({});

  const validateField = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (fieldName: string, value: any): boolean => {
      const fieldRules = rules[fieldName];
      if (!fieldRules) return true;

      for (const rule of fieldRules) {
        if (!rule.validate(value)) {
          setErrors((prev) => ({
            ...prev,
            [fieldName]: rule.message,
          }));
          return false;
        }
      }

      // Clear error if validation passes
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
      return true;
    },
    [rules]
  );

  const validateForm = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (formData: Record<string, any>): boolean => {
      const newErrors: FormErrors = {};
      let isValid = true;

      Object.keys(rules).forEach((fieldName) => {
        const fieldRules = rules[fieldName];
        const value = formData[fieldName];

        for (const rule of fieldRules) {
          if (!rule.validate(value)) {
            newErrors[fieldName] = rule.message;
            isValid = false;
            break;
          }
        }
      });

      setErrors(newErrors);
      return isValid;
    },
    [rules]
  );

  const clearError = useCallback((fieldName: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    errors,
    validateField,
    validateForm,
    clearError,
    clearAllErrors,
    hasErrors: Object.keys(errors).length > 0,
  };
}
