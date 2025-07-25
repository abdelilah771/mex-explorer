import MultiStepRegisterForm from "@/components/auth/MultiStepRegisterForm";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg border bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-center text-2xl font-bold">
          Register for MEX
        </h1>
        <MultiStepRegisterForm />
      </div>
    </div>
  );
}