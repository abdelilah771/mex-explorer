// app/(auth)/register/page.tsx
import MultiStepRegisterForm from "@/components/auth/MultiStepRegisterForm";

export default function RegisterPage() {
  return (
    <div style={{ maxWidth: '500px', margin: '40px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Register for MEX</h1>
      <MultiStepRegisterForm />
    </div>
  );
}