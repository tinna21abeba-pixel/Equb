export const equbFields = [
  {
    name: "name",
    label: "Equb name",
    type: "text",
    placeholder: "Family savings, Work group, Neighborhood circle",
    hint: "Choose a descriptive name between 3 and 60 characters.",
  },
  {
    name: "amount",
    label: "Contribution amount (ETB)",
    type: "number",
    inputMode: "numeric",
    placeholder: "1000",
    hint: "Fixed amount each member contributes per round (50 - 1,000,000 ETB).",
  },
  {
    name: "frequency",
    label: "Contribution frequency",
    type: "select",
    defaultValue: "monthly",
    options: [
      { value: "weekly", label: "Weekly (every 7 days)" },
      { value: "biweekly", label: "Bi-weekly (every 14 days)" },
      { value: "monthly", label: "Monthly (every month)" },
    ],
    hint: "How often contributions are collected and winners drawn.",
  },
  {
    name: "drawMethod",
    label: "Winner selection method",
    type: "select",
    defaultValue: "lottery",
    options: [
      { value: "lottery", label: "Lottery draw (random each round)" },
      { value: "order", label: "Sequential order (by member sequence)" },
    ],
    hint: "Lottery picks eligible members at random; sequential pays in list order.",
  },
  {
    name: "startDate",
    label: "Start date",
    type: "date",
    hint: "First round due date and start of the equb schedule.",
  },
];

export const signUpFields = [
  {
    name: "name",
    label: "Full name",
    type: "text",
    autoComplete: "name",
    placeholder: "Abebe Bikila",
  },
  {
    name: "email",
    label: "Email address",
    type: "email",
    autoComplete: "email",
    placeholder: "abebe@example.com",
  },
  {
    name: "password",
    label: "Password",
    type: "password",
    autoComplete: "new-password",
    placeholder: "At least 8 characters",
    hint: "Must be at least 8 characters.",
  },
];

export const signInFields = [
  {
    name: "email",
    label: "Email address",
    type: "email",
    autoComplete: "email",
    placeholder: "abebe@example.com",
  },
  {
    name: "password",
    label: "Password",
    type: "password",
    autoComplete: "current-password",
    placeholder: "Your password",
  },
];

export const memberFields = [
  {
    name: "name",
    label: "Member name",
    type: "text",
    placeholder: "Almaz Kebede",
  },
  {
    name: "phone",
    label: "Phone number",
    type: "tel",
    inputMode: "tel",
    placeholder: "0912345678",
    hint: "Ethiopian mobile number starting with 09, 07, or +251.",
  },
];