"use client";

import { useActionState } from "react";

export default function ActionForm({ action, fields, submit, hidden = {} }) {
  const [state, formAction, pending] = useActionState(action, { errors: {}, values: {} });
  const errors = state.errors ?? {};
  const values = state.values ?? {};

  return (
    <form action={formAction} className="form" noValidate>
      {Object.entries(hidden).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      {state.message && (
        <p role="status" className="notice">
          {state.message}
        </p>
      )}
      {fields.map((field) => {
        const invalid = Boolean(errors[field.name]);
        const describedBy = invalid ? `${field.name}-error` : undefined;
        return (
          <div className="field" key={field.name}>
            <label htmlFor={field.name}>{field.label}</label>
            {field.type === "select" ? (
              <select
                id={field.name}
                name={field.name}
                defaultValue={values[field.name] ?? field.defaultValue}
                aria-invalid={invalid}
                aria-describedby={describedBy}
              >
                {field.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id={field.name}
                name={field.name}
                type={field.type}
                inputMode={field.inputMode}
                placeholder={field.placeholder}
                autoComplete={field.autoComplete}
                defaultValue={values[field.name] ?? field.defaultValue ?? ""}
                aria-invalid={invalid}
                aria-describedby={describedBy}
              />
            )}
            {field.hint && !invalid && <p className="hint">{field.hint}</p>}
            {invalid && (
              <p id={`${field.name}-error`} className="error" role="alert">
                {errors[field.name]}
              </p>
            )}
          </div>
        );
      })}
      {errors.form && (
        <p className="error" role="alert">
          {errors.form}
        </p>
      )}
      <button type="submit" disabled={pending}>
        {pending ? "Please wait" : submit}
      </button>
    </form>
  );
}