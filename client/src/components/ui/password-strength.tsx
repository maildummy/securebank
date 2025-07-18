interface PasswordStrengthProps {
  password: string;
}

export default function PasswordStrength({ password }: PasswordStrengthProps) {
  const getStrength = (pass: string) => {
    if (!pass) return { score: 0, label: "Enter password" };
    
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[a-z]/.test(pass)) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    const labels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
    return { score, label: labels[score - 1] || "Very Weak" };
  };

  const { score, label } = getStrength(password);
  const colors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-blue-500", "bg-green-500"];

  return (
    <div className="mt-2">
      <div className="flex space-x-1">
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={i}
            className={`h-1 w-full rounded ${
              i < score ? colors[score - 1] : "bg-gray-200"
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-1">
        Password strength: <span className="font-medium">{label}</span>
      </p>
    </div>
  );
}
